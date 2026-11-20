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

/**
 * Pantalla principal de la partida. Controla todo el flujo del juego desde la
 * introducción narrativa, el despliegue de barcos y los turnos de combate contra la IA,
 * hasta el resumen final de victoria o derrota.
 *
 * @component
 * @example
 * return <Juego />
 *
 * @returns {JSX.Element} Vista completa de la partida con tableros, barra superior y paneles inferiores.
 */
export default function Juego() {
    const [fase, setFase] = useState('lore'); // 'lore' | 'despliegue' | 'combate'
    const [nSimulaciones, setNSimulaciones] = useState(5000);
    const [esperandoEnemigo, setEsperandoEnemigo] = useState(false);

    /**
     * Cierra la introducción narrativa y pasa a la pantalla para acomodar los barcos.
     *
     * @returns {void}
     */
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

    const [estadisticasAgente, setEstadisticasAgente] = useState({
        disparos: 0,
        impactos: 0,
        fallos: 0,
        barcosRestantes: 5,
    });

    const [historial, setHistorial] = useState([]);
    const [historialAgente, setHistorialAgente] = useState([]);
    const [tiempoUltimoAgente, setTiempoUltimoAgente] = useState(0);
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

    /**
     * Reinicia toda la partida generando nuevos tableros aleatorios, limpiando
     * historiales y estadísticas, y volviendo a la fase de despliegue.
     *
     * @returns {void}
     */
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
        setEstadisticasAgente({ disparos: 0, impactos: 0, fallos: 0, barcosRestantes: 5 });
        setHistorial([]);
        setHistorialAgente([]);
        setTiempoUltimoAgente(0);
        setTurno(0);
        setJuegoTerminado(false);
        setGanador(null);
        setEsperandoEnemigo(false);
        setFase('despliegue');
    };

    /**
     * Gira un barco del jugador entre horizontal y vertical durante la fase de despliegue
     * y actualiza el tablero en pantalla.
     *
     * @param {string} idBarco - Identificador del barco que se quiere rotar.
     * @returns {void}
     */
    const manejarRotarBarco = (idBarco) => {
        const nuevoTablero = rotarBarcoEnTablero(tableroJugador, idBarco, TAMANO_TABLERO);
        setTableroJugador(nuevoTablero);
        setEstadosPropios(tableroAStrings(nuevoTablero, true));
        setBarcosPropios(obtenerBarcosParaUI(nuevoTablero));
    };

    /**
     * Mueve un barco del jugador a una nueva casilla durante el despliegue
     * y actualiza la vista del tablero.
     *
     * @param {string} idBarco - Identificador del barco que se movió.
     * @param {number} nuevaFila - Fila destino (0 a 9).
     * @param {number} nuevaCol - Columna destino (0 a 9).
     * @returns {void}
     */
    const manejarMoverBarco = (idBarco, nuevaFila, nuevaCol) => {
        const nuevoTablero = moverBarcoEnTablero(tableroJugador, idBarco, nuevaFila, nuevaCol, TAMANO_TABLERO);
        setTableroJugador(nuevoTablero);
        setEstadosPropios(tableroAStrings(nuevoTablero, true));
        setBarcosPropios(obtenerBarcosParaUI(nuevoTablero));
    };

    /**
     * Ejecuta el disparo del jugador sobre una casilla del tablero enemigo, actualiza
     * estadísticas e historial, revisa si ya ganó y cede el turno al agente IA.
     *
     * @param {number} fila - Fila atacada (0 a 9).
     * @param {number} col - Columna atacada (0 a 9).
     * @returns {void}
     */
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

        const probCelda = infoProceso.mapa?.[fila]?.[col] ?? 0;
        const probPct = probCelda <= 1 ? Math.round(probCelda * 100) : Math.round(probCelda);

        setHistorial((prev) => [
            {
                turno: turno + 1,
                coord: `${LETRAS[fila]}${col + 1}`,
                resultado: resultado.hundido ? 'hundido' : resultado.resultado,
                siguioRecomendacion: fueSeguida,
                probabilidad: probPct,
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

    /**
     * Ejecuta el turno del agente IA: calcula las probabilidades sobre el tablero
     * del jugador, dispara a la mejor casilla, registra su jugada y verifica si ganó.
     *
     * @returns {void}
     */
    const turnoAgente = () => {
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
        setTiempoUltimoAgente(info.tiempoMs ?? 0);

        setEstadisticasAgente((prev) => ({
            disparos: prev.disparos + 1,
            impactos: prev.impactos + (resultado.resultado === 'impacto' ? 1 : 0),
            fallos: prev.fallos + (resultado.resultado !== 'impacto' ? 1 : 0),
            barcosRestantes: prev.barcosRestantes - (resultado.hundido ? 1 : 0),
        }));

        const probCelda = info.mapa?.[fila]?.[col] ?? 0;
        const probPct = probCelda <= 1 ? Math.round(probCelda * 100) : Math.round(probCelda);

        setHistorialAgente((prev) => [
            {
                turno: prev.length + 1,
                coord: `${LETRAS[fila]}${col + 1}`,
                resultado: resultado.hundido ? 'hundido' : resultado.resultado,
                probabilidad: probPct,
            },
            ...prev,
        ]);

        if (verificarFinJuego(nuevoTableroJugador)) {
            setJuegoTerminado(true);
            setGanador('agente');
        }
    };

    /**
     * Genera una nueva distribución al azar para los barcos del jugador en la fase de despliegue.
     *
     * @returns {void}
     */
    const manejarPosicionAleatoria = () => {
        const nuevoTableroJugador = colocarFlotaAleatoria();
        setTableroJugador(nuevoTableroJugador);
        setEstadosPropios(tableroAStrings(nuevoTableroJugador, true));
        setBarcosPropios(obtenerBarcosParaUI(nuevoTableroJugador));
    };

    const probRecomendada = infoProceso.recomendada
        ? (() => {
              const { fila, col } = infoProceso.recomendada;
              const val = infoProceso.mapa?.[fila]?.[col] ?? 0;
              return val <= 1 ? (val * 100).toFixed(1) : Number(val).toFixed(1);
          })()
        : '0.0';

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
                                probabilidadMax={probRecomendada}
                                tiempoMs={infoProceso.tiempoMs}
                                recomendacion={coordRecomendada}
                                siguienteAccion={siguienteAccion}
                            />
                            <PanelEstadisticas
                                statsJugador={{
                                    disparos: estadisticas.disparos,
                                    impactos: estadisticas.impactos,
                                    fallos: estadisticas.fallos,
                                    hundidos: 5 - estadisticas.barcosRestantes,
                                    restantes: estadisticas.barcosRestantes,
                                }}
                                statsAgente={{
                                    disparos: estadisticasAgente.disparos,
                                    impactos: estadisticasAgente.impactos,
                                    fallos: estadisticasAgente.fallos,
                                    hundidos: 5 - estadisticasAgente.barcosRestantes,
                                    restantes: estadisticasAgente.barcosRestantes,
                                }}
                                usoIA={{
                                    seguidas: historial.filter((h) => h.siguioRecomendacion).length,
                                    total: historial.length,
                                }}
                                tiempoIA={tiempoUltimoAgente}
                            />
                            <PanelHistorial
                                historialJugador={historial}
                                historialAgente={historialAgente}
                            />
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

/**
 * Convierte la matriz interna del tablero en una matriz de textos sencillos
 * (`'desconocido'`, `'barco'`, `'impacto'`, `'agua'`) para que los componentes visuales
 * puedan dibujarla fácilmente.
 *
 * @param {Object[][]} tablero - Matriz de 10x10 con los objetos de cada casilla.
 * @param {boolean} esPropio - Si es `true`, deja visibles los barcos que aún no han sido atacados.
 * @returns {string[][]} Matriz de 10x10 con el estado visual de cada casilla.
 */
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

/**
 * Extrae la lista de barcos del tablero con el formato que espera el componente `Barco`
 * (posición, tamaño, orientación y si ya fue hundido por completo).
 *
 * @param {Object[][]} tablero - Matriz de 10x10 con la información actual de la flota.
 * @returns {Array.<{id: string, barcoId: string, nombre: string, tamano: number, fila: number, col: number, horizontal: boolean, hundido: boolean}>} Lista de barcos lista para dibujarse en pantalla.
 */
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