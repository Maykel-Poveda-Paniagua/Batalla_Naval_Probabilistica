import { useState } from 'react';
import ModalLore from '../components/IntroLore';
import BarraSuperior from '../components/BarraSuperior';
import TableroNaval from '../components/TableroNaval';
import Barco from '../components/Barco';
import FinJuego from '../components/FinJuego';
import PanelProceso from '../components/PanelProceso';
import PanelEstadisticas from '../components/PanelEstadisticas';
import PanelHistorial from '../components/PanelHistorial';
import ColocarFlota from '../components/ColocarFlota';
import { calcularProbabilidades } from '../algorithms/algoritmoProbabilistico';
import {
    colocarFlotaAleatoria,
    obtenerBarcos,
    TAMANO_TABLERO,
    rotarBarcoEnTablero,
    moverBarcoEnTablero,
} from '../utils/tablero';
import { realizarDisparo, verificarFinJuego } from '../utils/motorJuego';
import { LETRAS } from '../utils/DatosPruebas';
import '../css/Juego.css';

export default function Juego() {
    const [fase, setFase] = useState('lore'); // 'lore' | 'despliegue' | 'combate'
    const [nSimulaciones, setNSimulaciones] = useState(5000);
    const [esperandoEnemigo, setEsperandoEnemigo] = useState(false);

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

    const siguienteAccion = juegoTerminado
        ? 'Partida finalizada'
        : esperandoEnemigo
        ? 'Esperando ataque...'
        : 'Esperando tu disparo';

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
        setEsperandoEnemigo(false);
        setFase('despliegue');
    };

    const manejarRotarBarco = (idBarco) => {
        const nuevoTablero = rotarBarcoEnTablero(tableroJugador, idBarco, TAMANO_TABLERO);
        setTableroJugador(nuevoTablero);
        setEstadosPropios(tableroAStrings(nuevoTablero, true));
        setBarcosPropios(obtenerBarcosParaUI(nuevoTablero));
    };

    const manejarMoverBarco = (idBarco, nuevaFila, nuevaCol) => {
        const nuevoTablero = moverBarcoEnTablero(tableroJugador, idBarco, nuevaFila, nuevaCol, TAMANO_TABLERO);
        setTableroJugador(nuevoTablero);
        setEstadosPropios(tableroAStrings(nuevoTablero, true));
        setBarcosPropios(obtenerBarcosParaUI(nuevoTablero));
    };

    const manejarDisparo = (fila, col) => {
        if (juegoTerminado || esperandoEnemigo) return;

        const nuevoTablero = tableroEnemigo.map((f) => f.map((c) => ({ ...c })));
        const resultado = realizarDisparo(nuevoTablero, fila, col);

        if (!resultado.exito) return;

        setTableroEnemigo(nuevoTablero);
        setEstadosEnemigo(tableroAStrings(nuevoTablero, false));

        const barcosEnemigos = obtenerBarcos(nuevoTablero);
        const hundidos = barcosEnemigos
            .filter((b) => b.celdas.every((celda) => nuevoTablero[celda.fila][celda.col].atacado))
            .map((b) => ({
                id: b.nombre.toLowerCase(),
                nombre: b.nombre,
                tamano: b.tamano,
                fila: b.fila,
                col: b.col,
                horizontal: b.horizontal,
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

        const fueSeguida =
            infoProceso.recomendada &&
            infoProceso.recomendada.fila === fila &&
            infoProceso.recomendada.col === col;

        setHistorial((prev) => [
            {
                turno: turno + 1,
                coord: `${LETRAS[fila]}${col + 1}`,
                resultado: resultado.hundido ? 'hundido' : resultado.resultado,
                siguioRecomendacion: fueSeguida,
            },
            ...prev,
        ]);
        setTurno((prev) => prev + 1);

        if (verificarFinJuego(nuevoTablero)) {
            setJuegoTerminado(true);
            setGanador('jugador');
            return;
        }

        setEsperandoEnemigo(true);
        setTimeout(() => {
            turnoAgente();
            setEsperandoEnemigo(false);
        }, 700);
    };

    const turnoAgente = () => {
        // La IA evalúa lo que conoce de tu tablero (sin ver tus barcos intactos)
        const vistaOcultaJugador = tableroAStrings(tableroJugador, false);
        const info = calcularProbabilidades(vistaOcultaJugador, nSimulaciones);
        if (!info.recomendada) return;

        const { fila, col } = info.recomendada;
        const nuevoTableroJugador = tableroJugador.map((f) => f.map((c) => ({ ...c })));
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
            {fase === 'lore' && <ModalLore onFinalizarLore={manejarFinLore} />}

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
                        onRotarBarco={manejarRotarBarco}
                        onMoverBarco={manejarMoverBarco}
                    />
                ) : (
                    <>
                        <div className="fila-tableros">
                            <TableroNaval titulo="Tu Flota" estados={estadosPropios} capaDebajo>
                                {barcosPropios.map((barco) => (
                                    <Barco key={barco.id} barco={barco} hundido={barco.hundido} />
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
                                siguienteAccion={siguienteAccion}
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
                <FinJuego
                    ganador={ganador}
                    estadisticas={estadisticas}
                    historial={historial}
                    onReiniciar={manejarReiniciar}
                />
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
    return obtenerBarcos(tablero).map((b) => ({
        id: b.nombre.toLowerCase(),
        barcoId: b.id,
        nombre: b.nombre,
        tamano: b.tamano,
        fila: b.fila,
        col: b.col,
        horizontal: b.horizontal,
        hundido: b.celdas.every((c) => tablero[c.fila][c.col].atacado),
    }));
}