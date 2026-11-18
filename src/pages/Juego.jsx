import { useState, useMemo } from 'react';
import ModalLore from '../components/IntroLore';
import BarraSuperior from '../components/BarraSuperior';
import TableroNaval from '../components/TableroNaval';
import Barco from '../components/Barco';
import PanelProceso from '../components/PanelProceso';
import PanelEstadisticas from '../components/PanelEstadisticas';
import PanelHistorial from '../components/PanelHistorial';
import { calcularProbabilidades } from '../algorithms/algoritmoProbabilistico';
import { colocarFlotaAleatoria, obtenerBarcos, barcoHundido } from '../utils/tablero';
import { realizarDisparo, verificarFinJuego } from '../utils/motorJuego';
import { LETRAS } from '../utils/DatosPruebas';
import '../css/Juego.css';

// Convierte el tablero interno de motorJuego/tablero.js a la matriz 10x10 ('desconocido' | 'agua' | 'impacto' | 'hundido')
function extraerMatrizVisible(tableroMotor) {
    return tableroMotor.map((fila) =>
        fila.map((celda) => {
            if (!celda.atacado) return 'desconocido';
            if (celda.resultado === 'impacto' && celda.barco) {
                return barcoHundido(tableroMotor, celda.barco.id) ? 'hundido' : 'impacto';
            }
            return 'agua';
        })
    );
}

// Convierte los barcos de tablero.js al formato que espera <Barco /> (id en minúscula para cargar el SVG correcto)
function extraerBarcosParaRender(tableroMotor, soloHundidos = false) {
    return obtenerBarcos(tableroMotor)
        .filter((b) => (soloHundidos ? barcoHundido(tableroMotor, b.id) : true))
        .map((b) => {
            const primera = b.celdas[0];
            const segunda = b.celdas[1];
            const horizontal = segunda ? primera.fila === segunda.fila : true;
            return {
                keyId: b.id,
                id: b.nombre.toLowerCase(), // 'portaaviones', 'acorazado', etc. para que cargue el SVG
                nombre: b.nombre,
                tamano: b.tamano,
                horizontal,
                fila: primera.fila,
                col: primera.col,
                hundido: barcoHundido(tableroMotor, b.id),
            };
        });
}

function clonarTablero(tablero) {
    return tablero.map((r) =>
        r.map((c) => ({ ...c, barco: c.barco ? { ...c.barco } : null }))
    );
}

export default function Juego() {
    const [mostrarLore, setMostrarLore] = useState(true);
    const [nSimulaciones, setNSimulaciones] = useState(5000);

    // Tableros reales de Persona 1 (jugador y enemigo generados aleatoriamente sin superposición)
    const [tableroPropioReal, setTableroPropioReal] = useState(() => colocarFlotaAleatoria());
    const [tableroEnemigoReal, setTableroEnemigoReal] = useState(() => colocarFlotaAleatoria());
    const [historial, setHistorial] = useState([]);
    const [ganador, setGanador] = useState(null); // 'jugador' | 'agente' | null

    // Matrices 10x10 visibles (sin revelar barcos ocultos)
    const estadosPropios = useMemo(() => extraerMatrizVisible(tableroPropioReal), [tableroPropioReal]);
    const estadosEnemigo = useMemo(() => extraerMatrizVisible(tableroEnemigoReal), [tableroEnemigoReal]);

    // Barcos propios (todos visibles) y barcos enemigos (solo visibles cuando se hunden)
    const flotaPropiaRender = useMemo(() => extraerBarcosParaRender(tableroPropioReal, false), [tableroPropioReal]);
    const barcosHundidosEnemigo = useMemo(() => extraerBarcosParaRender(tableroEnemigoReal, true), [tableroEnemigoReal]);
    const barcosHundidosPropios = useMemo(() => extraerBarcosParaRender(tableroPropioReal, true), [tableroPropioReal]);

    // Algoritmo probabilístico en tiempo real (Persona 2) — calcula recomendación para el jugador sobre Aguas Enemigas
    const infoProceso = useMemo(
        () => calcularProbabilidades(estadosEnemigo, nSimulaciones),
        [estadosEnemigo, nSimulaciones]
    );

    const coordRecomendada =
        !ganador && infoProceso.recomendada
            ? `${LETRAS[infoProceso.recomendada.fila]}${infoProceso.recomendada.col + 1} (${infoProceso.recomendada.prob.toFixed(1)}%)`
            : '—';

    // Estadísticas calculadas en vivo
    const estadisticas = useMemo(() => {
        let disparos = 0;
        let impactos = 0;
        let fallos = 0;
        for (let f = 0; f < 10; f++) {
            for (let c = 0; c < 10; c++) {
                if (estadosEnemigo[f][c] !== 'desconocido') {
                    disparos++;
                    if (estadosEnemigo[f][c] === 'agua') fallos++;
                    else impactos++;
                }
            }
        }
        return {
            disparos,
            impactos,
            fallos,
            barcosRestantes: Math.max(0, 5 - barcosHundidosEnemigo.length),
        };
    }, [estadosEnemigo, barcosHundidosEnemigo]);

    // Reiniciar partida completa con nuevas flotas aleatorias
    const manejarReiniciar = () => {
        setTableroPropioReal(colocarFlotaAleatoria());
        setTableroEnemigoReal(colocarFlotaAleatoria());
        setHistorial([]);
        setGanador(null);
    };

    // Turno completo: 1) Dispara el jugador -> 2) Verifica victoria -> 3) Agente IA calcula con calcularProbabilidades y dispara
    const manejarDisparo = (fila, col) => {
        if (ganador) return;

        const clonEnemigo = clonarTablero(tableroEnemigoReal);
        const resJugador = realizarDisparo(clonEnemigo, fila, col);
        if (!resJugador.exito) return;

        const siguioRecomendacion =
            infoProceso.recomendada?.fila === fila && infoProceso.recomendada?.col === col;

        const estadoTiroJugador = resJugador.hundido ? 'hundido' : resJugador.resultado;
        setTableroEnemigoReal(clonEnemigo);

        setHistorial((prev) => [
            {
                turno: prev.length + 1,
                coord: `${LETRAS[fila]}${col + 1}`,
                resultado: estadoTiroJugador,
                siguioRecomendacion,
            },
            ...prev,
        ]);

        // ¿Ganó el jugador humano al hundir los 5 barcos enemigos?
        if (verificarFinJuego(clonEnemigo)) {
            setGanador('jugador');
            return;
        }

        // Bucle del Agente Computacional:
        // Analiza únicamente la matriz de sus disparos previos (estadosPropios, NUNCA recibe tus barcos reales),
        // calcula las probabilidades con tu algoritmo y dispara a su celda recomendada.
        const clonPropio = clonarTablero(tableroPropioReal);
        const matrizVisibleParaAgente = extraerMatrizVisible(clonPropio);
        const analisisAgente = calcularProbabilidades(matrizVisibleParaAgente, nSimulaciones);

        if (analisisAgente.recomendada) {
            const { fila: fIA, col: cIA } = analisisAgente.recomendada;
            realizarDisparo(clonPropio, fIA, cIA);
            setTableroPropioReal(clonPropio);

            if (verificarFinJuego(clonPropio)) {
                setGanador('agente');
            }
        }
    };

    return (
        <div className="juego-contenedor">
            {mostrarLore && (
                <ModalLore onFinalizarLore={() => setMostrarLore(false)} />
            )}

            <BarraSuperior
                nSimulaciones={nSimulaciones}
                onCambiarSimulaciones={setNSimulaciones}
                onReiniciar={manejarReiniciar}
            />

            {ganador && (
                <div
                    style={{
                        background: ganador === 'jugador' ? '#1b5e20' : '#b71c1c',
                        color: '#fff',
                        textAlign: 'center',
                        padding: '10px 16px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <span>
                        {ganador === 'jugador'
                            ? `¡VICTORIA! Hundiste toda la flota enemiga en ${estadisticas.disparos} disparos.`
                            : 'DERROTA — El Agente Computacional hundió toda tu flota primero.'}
                    </span>
                    <button
                        type="button"
                        onClick={manejarReiniciar}
                        style={{
                            background: '#fff',
                            color: '#1e242b',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        Jugar de nuevo
                    </button>
                </div>
            )}

            <main className="juego-principal">
                <div className="fila-tableros">
                    <TableroNaval
                        titulo={`Tu Flota (${5 - barcosHundidosPropios.length}/5 a flote)`}
                        estados={estadosPropios}
                        capaDebajo
                    >
                        {flotaPropiaRender.map((barco) => (
                            <Barco key={barco.keyId} barco={barco} hundido={barco.hundido} />
                        ))}
                    </TableroNaval>

                    <TableroNaval
                        titulo="Aguas Enemigas"
                        estados={estadosEnemigo}
                        probabilidades={infoProceso.mapa}
                        recomendada={infoProceso.recomendada}
                        mostrarPorcentaje
                        onCeldaClick={ganador ? undefined : manejarDisparo}
                        capaDebajo
                    >
                        {barcosHundidosEnemigo.map((barco) => (
                            <Barco key={barco.keyId} barco={barco} hundido />
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
            </main>
        </div>
    );
}