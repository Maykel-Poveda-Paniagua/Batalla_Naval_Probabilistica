import '../css/PanelesInferiores.css';

export default function PanelProceso({
    validas = 0,
    tiempoMs = 0,
    recomendacion = '—',
    siguienteAccion = 'Esperando tu disparo',
}) {
    const pasos = [
        { num: 1, label: 'Información del tablero', valor: 'Actualizada' },
        { num: 2, label: 'Configuraciones válidas', valor: validas.toLocaleString('es-CR') },
        { num: 3, label: 'Mapa de probabilidades', valor: 'Calculado' },
        { num: 4, label: 'Celda recomendada', valor: recomendacion, destacado: true },
        { num: 5, label: 'Siguiente acción', valor: siguienteAccion },
    ];

    return (
        <article className="tarjeta-panel">
            <h3>Proceso</h3>

            <ol className="lista-proceso">
                {pasos.map((p) => (
                    <li
                        key={p.num}
                        className={`paso-fila${p.destacado ? ' paso-fila--destacado' : ''}`}
                    >
                        <span className="paso-num">{p.num}</span>
                        <span className="paso-nombre">{p.label}</span>
                        <strong className="paso-valor">{p.valor}</strong>
                    </li>
                ))}
            </ol>

            <div className="proceso-pie">
                <span>Tiempo de ejecución:</span>
                <strong>{tiempoMs} ms</strong>
            </div>
        </article>
    );
}