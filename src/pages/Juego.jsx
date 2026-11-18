import { useState } from 'react';
import ModalLore from '../components/IntroLore';
import BarraSuperior from '../components/BarraSuperior';
import TableroNaval from '../components/TableroNaval';
import Barco from '../components/Barco';
import PanelProceso from '../components/PanelProceso';
import PanelEstadisticas from '../components/PanelEstadisticas';
import PanelHistorial from '../components/PanelHistorial';
import ColocarFlota from '../components/ColocarFlota';
import { calcularProbabilidades } from '../algorithms/algoritmoProbabilistico';
import { colocarFlotaAleatoria, obtenerBarcos, TAMANO_TABLERO } from '../utils/tablero';
import { realizarDisparo, verificarFinJuego } from '../utils/motorJuego';
import { LETRAS } from '../utils/DatosPruebas';
import '../css/Juego.css';

export default function Juego() {
    const [fase, setFase] = useState('lore'); // 'lore' | 'despliegue' | 'combate'
    const [nSimulaciones, setNSimulaciones] = useState(5000);

    const manejarFinLore = () => {
        setFase('despliegue');
    };

    const [tableroJugador, setTableroJugador] = useState(() => colocarFlotaAleatoria());
    const [tableroEnemigo, setTableroEnemigo] = useState(() => colocarFlotaAleatoria());

    const [estadosPropios, setEstadosPropios] = useState(() => tableroAStrings(tableroJugador, true));
    const [estadosEnemigo, setEstadosEnemigo] = useState(() => tableroAStrings(tableroEnemigo, false));

    const [barcosPropios, setBarcosPropios] = useState(() => obtenerBarcosParaUI(tableroJugador));
    const [barcosHundidos, setBarcosHundidos] = useState([]);

    const [estadisticas, setEstadisticas] = useState({
        disparos: 0,
        impactos: 0,
        fallos: 0,
        barcosRestantes: 5,
    });

    const [historial, setHistorial] = useState([]);
    const [turno, setTurno] = useState(0);

    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [ganador, setGanador] = useState(null);

    const infoProceso = calcularProbabilidades(estadosEnemigo, nSimulaciones);
    const coordRecomendada = infoProceso.recomendada
        ? `${LETRAS[infoProceso.recomendada.fila]}${infoProceso.recomendada.col + 1}`
        : '—';

    const manejarReiniciar = () => {
        const nuevoTableroJugador = colocarFlotaAleatoria();
        const nuevoTableroEnemigo = colocarFlotaAleatoria();

        setTableroJugador(nuevoTableroJugador);
        setTableroEnemigo(nuevoTableroEnemigo);
        setEstadosPropios(tableroAStrings(nuevoTableroJugador, true));
        setEstadosEnemigo(tableroAStrings(nuevoTableroEnemigo, false));
        setBarcosPropios(obtenerBarcosParaUI(nuevoTableroJugador));
        setBarcosHundidos([]);
        setEstadisticas({ disparos: 0, impactos: 0, fallos: 0, barcosRestantes: 5 });
        setHistorial([]);
        setTurno(0);
        setJuegoTerminado(false);
        setGanador(null);
        setFase('despliegue');
    };

    const manejarDisparo = (fila, col) => {
        if (juegoTerminado) return;

        const nuevoTablero = tableroEnemigo.map(f => f.map(c => ({ ...c })));
        const resultado = realizarDisparo(nuevoTablero, fila, col);

        if (!resultado.exito) return;

        setTableroEnemigo(nuevoTablero);
        setEstadosEnemigo(tableroAStrings(nuevoTablero, false));

        const barcosEnemigos = obtenerBarcos(nuevoTablero);
        const hundidos = barcosEnemigos
            .filter(b => b.celdas.every(celda => nuevoTablero[celda.fila][celda.col].atacado))
            .map(b => ({
                id: b.nombre.toLowerCase(),
                nombre: b.nombre,
                tamano: b.tamano,
                fila: b.celdas[0].fila,
                col: b.celdas[0].col,
                horizontal: b.celdas[0].orientacion === 'horizontal',
            }));
        setBarcosHundidos(hundidos);

        const nuevasStats = { ...estadisticas };
        nuevasStats.disparos++;
        if (resultado.resultado === 'impacto') {
            nuevasStats.impactos++;
        } else {
            nuevasStats.fallos++;
        }
        if (resultado.hundido) {
            nuevasStats.barcosRestantes--;
        }
        setEstadisticas(nuevasStats);

        const fueSeguida = infoProceso.recomendada &&
                           infoProceso.recomendada.fila === fila &&
                           infoProceso.recomendada.col === col;
        setHistorial(prev => [{
            turno: turno + 1,
            coord: `${LETRAS[fila]}${col + 1}`,
            resultado: resultado.hundido ? 'hundido' : resultado.resultado,
            siguioRecomendacion: fueSeguida,
        }, ...prev]);
        setTurno(prev => prev + 1);

        if (verificarFinJuego(nuevoTablero)) {
            setJuegoTerminado(true);
            setGanador('jugador');
            return;
        }

        setTimeout(() => turnoAgente(nuevoTablero, tableroAStrings(nuevoTablero, false)), 500);
    };

    const turnoAgente = (tableroEnemigoActual, estadosEnemigoActual) => {
        const info = calcularProbabilidades(estadosEnemigoActual, nSimulaciones);
        if (!info.recomendada) return;

        const { fila, col } = info.recomendada;
        const nuevoTableroJugador = tableroJugador.map(f => f.map(c => ({ ...c })));
        const resultado = realizarDisparo(nuevoTableroJugador, fila, col);

        if (!resultado.exito) return;

        setTableroJugador(nuevoTableroJugador);
        setEstadosPropios(tableroAStrings(nuevoTableroJugador, true));
        setBarcosPropios(obtenerBarcosParaUI(nuevoTableroJugador));

        if (verificarFinJuego(nuevoTableroJugador)) {
            setJuegoTerminado(true);
            setGanador('agente');
        }
    };

    const manejarPosicionAleatoria = () => {
        const nuevoTableroJugador = colocarFlotaAleatoria();
        setTableroJugador(nuevoTableroJugador);
        setEstadosPropios(tableroAStrings(nuevoTableroJugador, true));
        setBarcosPropios(obtenerBarcosParaUI(nuevoTableroJugador));
    };

    return (
        <div className="juego-contenedor">
            {fase === 'lore' && (
                <ModalLore onFinalizarLore={manejarFinLore} />
            )}

            {(fase === 'combate' || fase === 'lore') && (
                <BarraSuperior
                    nSimulaciones={nSimulaciones}
                    onCambiarSimulaciones={setNSimulaciones}
                    onReiniciar={manejarReiniciar}
                    apagado={fase === 'lore' || fase === 'despliegue'}
                />
            )}

            <main className="juego-principal">
                {fase === 'despliegue' ? (
                    <ColocarFlota
                        estadosPropios={estadosPropios}
                        flotaPropia={barcosPropios}
                        onIniciarBatalla={() => setFase('combate')}
                        onPosicionAleatoria={manejarPosicionAleatoria}
                    />
                ) : (
                    <>
                        <div className="fila-tableros">
                            <TableroNaval titulo="Tu Flota" estados={estadosPropios} capaDebajo>
                                {barcosPropios.map((barco) => (
                                    <Barco key={barco.id} barco={barco} />
                                ))}
                            </TableroNaval>

                            <TableroNaval
                                titulo="Aguas Enemigas"
                                estados={estadosEnemigo}
                                probabilidades={infoProceso.mapa}
                                recomendada={infoProceso.recomendada}
                                onCeldaClick={manejarDisparo}
                                capaDebajo
                            >
                                {barcosHundidos.map((barco) => (
                                    <Barco key={barco.id} barco={barco} hundido />
                                ))}
                            </TableroNaval>
                        </div>

                        <section className="panel-inferior" aria-label="Panel de control">
                            <PanelProceso
                                validas={infoProceso.validas}
                                tiempoMs={infoProceso.tiempoMs}
                                recomendacion={coordRecomendada}
                            />
                            <PanelEstadisticas
                                disparos={estadisticas.disparos}
                                impactos={estadisticas.impactos}
                                fallos={estadisticas.fallos}
                                barcosRestantes={estadisticas.barcosRestantes}
                            />
                            <PanelHistorial historial={historial} />
                        </section>
                    </>
                )}
            </main>

            {juegoTerminado && (
                <div className="modal-fin-juego">
                    <h2>{ganador === 'jugador' ? '¡Ganaste!' : '¡Perdiste!'}</h2>
                    <button onClick={manejarReiniciar}>Nueva Partida</button>
                </div>
            )}
        </div>
    );
}

function tableroAStrings(tablero, esPropio) {
    const matriz = [];
    for (let f = 0; f < TAMANO_TABLERO; f++) {
        const fila = [];
        for (let c = 0; c < TAMANO_TABLERO; c++) {
            const celda = tablero[f][c];
            if (!celda.atacado) {
                if (esPropio && celda.barco) {
                    fila.push('barco');
                } else {
                    fila.push('desconocido');
                }
            } else {
                if (celda.resultado === 'impacto') {
                    fila.push('impacto');
                } else {
                    fila.push('agua');
                }
            }
        }
        matriz.push(fila);
    }
    return matriz;
}

function obtenerBarcosParaUI(tablero) {
    const barcosMap = {};
    for (let f = 0; f < TAMANO_TABLERO; f++) {
        for (let c = 0; c < TAMANO_TABLERO; c++) {
            const celda = tablero[f][c];
            if (celda.barco) {
                const id = celda.barco.id;
                if (!barcosMap[id]) {
                    barcosMap[id] = {
                        id: celda.barco.nombre.toLowerCase(),
                        nombre: celda.barco.nombre,
                        tamano: celda.barco.tamano,
                        fila: f,
                        col: c,
                        horizontal: celda.barco.orientacion === 'horizontal',
                    };
                }
            }
        }
    }
    return Object.values(barcosMap);
}