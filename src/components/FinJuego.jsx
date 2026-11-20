import { useState, useEffect, useRef } from 'react';
import capitanVictoria from '../assets/Victoria.svg';
import capitanDerrota from '../assets/Derrota.svg';
import '../css/IntroLore.css';
import '../css/FinJuego.css';

/**
 * Mensajes y encabezados que se muestran al terminar la partida según quién haya ganado.
 *
 * @type {Object.<string, {titulo: string, emisor: string, texto: string}>}
 */
const DIALOGOS_FIN = {
    jugador: {
        titulo: 'VICTORIA - FLOTA ENEMIGA NEUTRALIZADA',
        emisor: 'PRIMER OFICIAL',
        texto: '¡Excelente trabajo, Jefe! Nuestro análisis probabilístico desmanteló cada movimiento enemigo. El cuadrante 10x10 vuelve a estar bajo nuestro control.',
    },
    agente: {
        titulo: 'DERROTA - TODA NUESTRA FLOTA HA SIDO HUNDIDA',
        emisor: 'PRIMER OFICIAL',
        texto: '¡Nos han hundido, Jefe! El algoritmo enemigo descifró toda nuestra formación y perdimos hasta el último buque. Reagruparemos la flota para la revancha.',
    },
};

/**
 * @typedef {Object} EstadisticasFin
 * @property {number} disparos - Total de tiros que hizo el jugador en la partida.
 * @property {number} impactos - Total de tiros que dieron en un barco enemigo.
 */

/**
 * @typedef {Object} EntradaHistorialFin
 * @property {boolean} [siguioRecomendacion] - Indica si el jugador atacó la casilla que le sugirió la IA.
 */

/**
 * Ventana final que anuncia si ganaste o perdiste con un mensaje animado,
 * muestra tu resumen de disparos, precisión y uso de la IA, y permite minimizar
 * el cartel para revisar cómo quedaron los tableros.
 *
 * @component
 * @example
 * return (
 *   <FinJuego
 *     ganador="jugador"
 *     estadisticas={{ disparos: 46, impactos: 17 }}
 *     historial={[]}
 *     onReiniciar={() => {}}
 *   />
 * )
 *
 * @param {Object} props - Propiedades del componente.
 * @param {'jugador'|'agente'} props.ganador - Indica quién ganó la partida (`'jugador'` o `'agente'`).
 * @param {EstadisticasFin} props.estadisticas - Resumen final de disparos e impactos del jugador.
 * @param {EntradaHistorialFin[]} [props.historial=[]] - Lista de turnos del jugador para contar cuántas veces siguió la sugerencia de la IA.
 * @param {Function} props.onReiniciar - Función que se ejecuta al hacer clic en el botón para empezar una nueva partida.
 * @returns {JSX.Element} Ventana modal o barra inferior minimizada con el resumen del encuentro.
 */
export default function FinJuego({
    ganador,
    estadisticas,
    historial = [],
    onReiniciar,
}) {
    const [minimizado, setMinimizado] = useState(false);
    const [textoVisible, setTextoVisible] = useState('');
    const intervaloRef = useRef(null);

    const esVictoria = ganador === 'jugador';
    const info = esVictoria ? DIALOGOS_FIN.jugador : DIALOGOS_FIN.agente;
    const precision =
        estadisticas.disparos > 0
            ? Math.round((estadisticas.impactos / estadisticas.disparos) * 100)
            : 0;
    const seguidosIA = historial.filter((h) => h.siguioRecomendacion).length;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTextoVisible('');
        let indice = 0;

        intervaloRef.current = setInterval(() => {
            indice++;
            setTextoVisible(info.texto.slice(0, indice));
            if (indice >= info.texto.length) {
                clearInterval(intervaloRef.current);
            }
        }, 20);

        return () => clearInterval(intervaloRef.current);
    }, [info.texto]);

    if (minimizado) {
        return (
            <div className="fin-barra-minimizada">
                <button
                    type="button"
                    className="btn-saltar"
                    onClick={() => setMinimizado(false)}
                >
                    VER REPORTE FINAL
                </button>
                <button
                    type="button"
                    className="btn-accion-lore"
                    onClick={onReiniciar}
                >
                    NUEVA PARTIDA ↻
                </button>
            </div>
        );
    }

    return (
        <div className="lore-overlay fin-overlay">
            <div className="lore-ventana fin-ventana">
                <div
                    className={`lore-header ${
                        esVictoria ? 'fin-header--victoria' : 'fin-header--derrota'
                    }`}
                >
                    <span className="lore-punto-alerta"></span>
                    <span>{info.titulo}</span>
                </div>

                <div className="lore-cuerpo">
                    <div className="lore-avatar fin-avatar">
                        <img
                            src={esVictoria ? capitanVictoria : capitanDerrota}
                            alt={esVictoria ? 'Capitán victorioso' : 'Capitán derrotado'}
                            className="fin-avatar__img"
                        />
                    </div>

                    <div className="lore-dialogo">
                        <h4 className="lore-emisor">{info.emisor}</h4>
                        <p className="lore-texto">
                            {textoVisible}
                            <span className="lore-cursor">█</span>
                        </p>

                        <div className="fin-resumen-stats">
                            <div>
                                <span>Disparos: </span>
                                <strong>{estadisticas.disparos}</strong>
                            </div>
                            <div>
                                <span>Precisión: </span>
                                <strong>{precision} %</strong>
                            </div>
                            <div>
                                <span>Uso de IA: </span>
                                <strong>
                                    {seguidosIA}/{historial.length}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lore-footer">
                    <button
                        type="button"
                        className="btn-saltar"
                        onClick={() => setMinimizado(true)}
                    >
                        VER TABLEROS Y PANELES
                    </button>
                    <button
                        type="button"
                        className="btn-accion-lore"
                        onClick={onReiniciar}
                    >
                        NUEVA PARTIDA ↻
                    </button>
                </div>
            </div>
        </div>
    );
}