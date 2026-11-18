import { useState } from 'react';
import ModalLore from '../components/IntroLore';
import BarraSuperior from '../components/BarraSuperior';
import TableroNaval from '../components/TableroNaval';
import Barco from '../components/Barco';
import PanelProceso from '../components/PanelProceso';
import PanelEstadisticas from '../components/PanelEstadisticas';
import PanelHistorial from '../components/PanelHistorial';
import { calcularProbabilidades } from '../algorithms/algoritmoProbabilistico';
import {
    LETRAS,
    crearMatriz,
    MOCK_FLOTA_PROPIA,
    MOCK_ESTADOS_ENEMIGO,
    MOCK_ESTADISTICAS,
    MOCK_HISTORIAL,
    MOCK_BARCOS_HUNDIDOS,
} from '../utils/DatosPruebas';
import '../css/Juego.css';

export default function Juego() {
    const [mostrarLore, setMostrarLore] = useState(true);
    const [nSimulaciones, setNSimulaciones] = useState(5000);

    // Estados iniciales cargados desde datosprueba.js
    const [estadosPropios, setEstadosPropios] = useState(crearMatriz);
    const [estadosEnemigo, setEstadosEnemigo] = useState(MOCK_ESTADOS_ENEMIGO);
    const [estadisticas, setEstadisticas] = useState(MOCK_ESTADISTICAS);
    const [historial, setHistorial] = useState(MOCK_HISTORIAL);

    // Algoritmo probabilístico real (Persona 2)
    const infoProceso = calcularProbabilidades(estadosEnemigo, nSimulaciones);
    const coordRecomendada = infoProceso.recomendada
        ? `${LETRAS[infoProceso.recomendada.fila]}${infoProceso.recomendada.col + 1}`
        : '—';

    // [INTEGRACIÓN P1]: Reemplazar por reinicio del motor
    const manejarReiniciar = () => {
        setEstadosPropios(crearMatriz());
        setEstadosEnemigo(crearMatriz());
        setEstadisticas({ disparos: 0, impactos: 0, fallos: 0, barcosRestantes: 5 });
        setHistorial([]);
    };

    // [INTEGRACIÓN P1 y P2]: Conectar aquí el disparo real
    const manejarDisparo = (fila, col) => {
        console.log(`Celda seleccionada: ${LETRAS[fila]}${col + 1}`);
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

            <main className="juego-principal">
                <div className="fila-tableros">
                    <TableroNaval titulo="Tu Flota" estados={estadosPropios} capaDebajo>
                        {MOCK_FLOTA_PROPIA.map((barco) => (
                            <Barco key={barco.id} barco={barco} />
                        ))}
                    </TableroNaval>

                    <TableroNaval
                        titulo="Aguas Enemigas"
                        estados={estadosEnemigo}
                        onCeldaClick={manejarDisparo}
                        capaDebajo
                    >
                        {MOCK_BARCOS_HUNDIDOS.map((barco) => (
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
            </main>
        </div>
    );
}