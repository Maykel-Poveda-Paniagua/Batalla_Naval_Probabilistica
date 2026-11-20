import '../css/PanelesInferiores.css';

/**
 * @typedef {Object} RegistroDisparoJugador
 * @property {number} turno - Número de turno del disparo del jugador.
 * @property {string} coord - Casilla atacada (por ejemplo, 'D6').
 * @property {'agua'|'impacto'|'hundido'} resultado - Resultado del disparo.
 * @property {boolean} [siguioRecomendacion] - Indica si el jugador atacó la casilla sugerida por la IA.
 * @property {number} [probabilidad] - Porcentaje de probabilidad que tenía esa casilla al disparar.
 */

/**
 * @typedef {Object} RegistroDisparoAgente
 * @property {number} turno - Número de turno del disparo del agente IA.
 * @property {string} coord - Casilla atacada por la IA (por ejemplo, 'E6').
 * @property {'agua'|'impacto'|'hundido'} resultado - Resultado del disparo de la IA.
 * @property {number} probabilidad - Porcentaje de probabilidad con el que la IA eligió esa casilla.
 */

/**
 * Muestra la lista de disparos realizados durante la partida, separados entre
 * el jugador y el agente IA, indicando la casilla atacada, el resultado y si se
 * siguió la recomendación de la IA.
 *
 * @component
 * @example
 * return (
 *   <PanelHistorial
 *     historialJugador={[{ turno: 1, coord: 'F5', resultado: 'agua', siguioRecomendacion: true, probabilidad: 18 }]}
 *     historialAgente={[{ turno: 1, coord: 'E6', resultado: 'impacto', probabilidad: 20 }]}
 *   />
 * )
 *
 * @param {Object} props - Propiedades del componente.
 * @param {RegistroDisparoJugador[]} [props.historialJugador=[]] - Lista con los disparos que ha hecho el jugador.
 * @param {RegistroDisparoAgente[]} [props.historialAgente=[]] - Lista con los disparos que ha hecho el agente IA.
 * @returns {JSX.Element} Tarjeta con el historial de jugadas de ambos bandos y el total de disparos.
 */
export default function PanelHistorial({
    historialJugador = [],
    historialAgente = [],
}) {
    const totalDisparos = historialJugador.length + historialAgente.length;

    return (
        <article className="tarjeta-panel">
            <h3>Historial de Combate</h3>

            {/* FILA 1: JUGADOR */}
            <div className="subtitulo-grupo">
                <span className="etiqueta-bando etiqueta-bando--jugador">Jugador</span>
            </div>

            {historialJugador.length === 0 ? (
                <div className="historial-vacio historial-vacio--compacto">
                    <span>Sin disparos aún</span>
                    <small>Haz clic en Aguas Enemigas para iniciar</small>
                </div>
            ) : (
                <ul className="lista-historial lista-historial--compacta">
                    {historialJugador.map((item) => (
                        <li
                            key={`j-${item.turno}`}
                            className={`historial-fila historial-fila--${item.resultado}`}
                        >
                            <span className="historial-turno">#{item.turno}</span>
                            <strong className="historial-coord">{item.coord}</strong>
                            <span className={`historial-estado estado--${item.resultado}`}>
                                {item.resultado.toUpperCase()}
                            </span>
                            <span
                                className={`badge-origen${
                                    item.siguioRecomendacion ? ' badge-origen--ia' : ''
                                }`}
                            >
                                {item.siguioRecomendacion
                                    ? `IA ${item.probabilidad ?? ''}%`
                                    : 'PROPIA'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {/* FILA 2: AGENTE IA */}
            <div className="subtitulo-grupo subtitulo-grupo--agente">
                <span className="etiqueta-bando etiqueta-bando--agente">Agente IA</span>
            </div>

            {historialAgente.length === 0 ? (
                <div className="historial-vacio historial-vacio--compacto">
                    <span>Esperando turno de la IA</span>
                    <small>El agente responderá tras tu disparo</small>
                </div>
            ) : (
                <ul className="lista-historial lista-historial--compacta">
                    {historialAgente.map((item) => (
                        <li
                            key={`ia-${item.turno}`}
                            className={`historial-fila historial-fila--${item.resultado}`}
                        >
                            <span className="historial-turno">#{item.turno}</span>
                            <strong className="historial-coord">{item.coord}</strong>
                            <span className={`historial-estado estado--${item.resultado}`}>
                                {item.resultado.toUpperCase()}
                            </span>
                            <span className="badge-origen badge-origen--ia">
                                PROB {item.probabilidad}%
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="panel-pie">
                <span>Total disparos: {totalDisparos}</span>
                <strong>
                    IA {historialAgente.length} • J {historialJugador.length}
                </strong>
            </div>
        </article>
    );
}