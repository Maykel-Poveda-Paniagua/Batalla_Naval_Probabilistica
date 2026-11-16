import '../css/PanelesInferiores.css';

export default function PanelHistorial({ historial = [] }) {
    const seguidosIA = historial.filter((h) => h.siguioRecomendacion).length;

    return (
        <article className="tarjeta-panel">
            <h3>Historial de Combate</h3>

            {historial.length === 0 ? (
                <div className="historial-vacio">
                    <span>Sin disparos registrados</span>
                    <small>Haz clic en Aguas Enemigas para iniciar</small>
                </div>
            ) : (
                <ul className="lista-historial">
                    {historial.map((item) => (
                        <li
                            key={item.turno}
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
                                {item.siguioRecomendacion ? 'IA' : 'Manual'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="panel-pie">
                <span>Sugerencias IA seguidas:</span>
                <strong>
                    {seguidosIA} / {historial.length}
                </strong>
            </div>
        </article>
    );
}