import '../css/PanelesInferiores.css';

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