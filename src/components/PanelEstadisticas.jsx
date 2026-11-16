import '../css/PanelesInferiores.css';

export default function PanelEstadisticas({
    disparos = 0,
    impactos = 0,
    fallos = 0,
    barcosRestantes = 5,
}) {
    const precision = disparos > 0 ? Math.round((impactos / disparos) * 100) : 0;

    const metricas = [
        { label: 'Disparos', valor: disparos, tipo: 'neutro' },
        { label: 'Impactos', valor: impactos, tipo: 'impacto' },
        { label: 'Fallos', valor: fallos, tipo: 'agua' },
        { label: 'Flota rival', valor: `${barcosRestantes} / 5`, tipo: 'flota' },
    ];

    return (
        <article className="tarjeta-panel">
            <h3>Estadísticas</h3>

            <div className="grid-estadisticas">
                {metricas.map((m) => (
                    <div key={m.label} className={`stat-caja stat-caja--${m.tipo}`}>
                        <span className="stat-etiqueta">{m.label}</span>
                        <strong className="stat-numero">{m.valor}</strong>
                    </div>
                ))}
            </div>

            <div className="panel-pie">
                <span>Precisión de tiro:</span>
                <strong>{precision} %</strong>
            </div>
        </article>
    );
}