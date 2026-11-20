import '../css/PanelesInferiores.css';

export default function PanelEstadisticas({
    statsJugador = { disparos: 0, impactos: 0, fallos: 0, hundidos: 0, restantes: 5 },
    statsAgente = { disparos: 0, impactos: 0, fallos: 0, hundidos: 0, restantes: 5 },
    usoIA = { seguidas: 0, total: 0 },
    tiempoIA = 0,
}) {
    const precisionJugador =
        statsJugador.disparos > 0
            ? Math.round((statsJugador.impactos / statsJugador.disparos) * 100)
            : 0;

    const precisionAgente =
        statsAgente.disparos > 0
            ? Math.round((statsAgente.impactos / statsAgente.disparos) * 100)
            : 0;

    const pctUsoIA =
        usoIA.total > 0 ? Math.round((usoIA.seguidas / usoIA.total) * 100) : 0;

    return (
        <article className="tarjeta-panel">
            <h3>Estadísticas</h3>

            {/* FILA 1: JUGADOR */}
            <div className="subtitulo-grupo">
                <span className="etiqueta-bando etiqueta-bando--jugador">Jugador</span>
            </div>
            <div className="grid-estadisticas">
                <div className="stat-caja">
                    <span className="stat-etiqueta">Disparos</span>
                    <strong className="stat-numero">{statsJugador.disparos}</strong>
                </div>
                <div className="stat-caja">
                    <span className="stat-etiqueta">Impactos / Agua</span>
                    <strong className="stat-numero">
                        {statsJugador.impactos} / {statsJugador.fallos}
                    </strong>
                </div>
                <div className="stat-caja">
                    <span className="stat-etiqueta">Hundidos / Restantes</span>
                    <strong className="stat-numero">
                        {statsJugador.hundidos} / {statsJugador.restantes}
                    </strong>
                </div>
                <div className="stat-caja">
                    <span className="stat-etiqueta">Uso de IA</span>
                    <strong className="stat-numero">
                        {usoIA.seguidas}/{usoIA.total} ({pctUsoIA}%)
                    </strong>
                </div>
            </div>

            {/* FILA 2: AGENTE IA */}
            <div className="subtitulo-grupo subtitulo-grupo--agente">
                <span className="etiqueta-bando etiqueta-bando--agente">Agente IA</span>
            </div>
            <div className="grid-estadisticas">
                <div className="stat-caja stat-caja--agente">
                    <span className="stat-etiqueta">Disparos</span>
                    <strong className="stat-numero">{statsAgente.disparos}</strong>
                </div>
                <div className="stat-caja stat-caja--agente">
                    <span className="stat-etiqueta">Impactos / Agua</span>
                    <strong className="stat-numero">
                        {statsAgente.impactos} / {statsAgente.fallos}
                    </strong>
                </div>
                <div className="stat-caja stat-caja--agente">
                    <span className="stat-etiqueta">Hundidos / Restantes</span>
                    <strong className="stat-numero">
                        {statsAgente.hundidos} / {statsAgente.restantes}
                    </strong>
                </div>
                <div className="stat-caja stat-caja--agente">
                    <span className="stat-etiqueta">Tiempo cálculo IA</span>
                    <strong className="stat-numero">{tiempoIA} ms</strong>
                </div>
            </div>

            <div className="panel-pie">
                <span>Precisión de tiros:</span>
                <strong>
                    IA {precisionAgente}% • J {precisionJugador}%
                </strong>
            </div>
        </article>
    );
}