import '../css/PanelesInferiores.css';

/**
 * Muestra el resumen paso a paso de lo que hace el algoritmo en cada turno:
 * cuántas configuraciones válidas encontró, cuál es la probabilidad más alta,
 * qué casilla recomienda atacar y cuánto tardó en calcularlo.
 *
 * @component
 * @example
 * return (
 *   <PanelProceso
 *     validas={2306}
 *     probabilidadMax={39.3}
 *     tiempoMs={6.2}
 *     recomendacion="F8"
 *     siguienteAccion="Esperando tu disparo"
 *   />
 * )
 *
 * @param {Object} props - Propiedades del componente.
 * @param {number} [props.validas=0] - Cantidad de ubicaciones válidas de barcos que encontró la simulación.
 * @param {number} [props.probabilidadMax=0] - Porcentaje de probabilidad más alto entre las casillas sin explorar.
 * @param {number} [props.tiempoMs=0] - Tiempo que tardó en calcular el mapa de calor (en milisegundos).
 * @param {string} [props.recomendacion='—'] - Casilla sugerida para el próximo disparo (por ejemplo, 'F8').
 * @param {string} [props.siguienteAccion='Esperando tu disparo'] - Mensaje que indica qué toca hacer en el turno actual.
 * @returns {JSX.Element} Tarjeta con los pasos del cálculo de la IA y su tiempo de respuesta.
 */
export default function PanelProceso({
    validas = 0,
    probabilidadMax = 0,
    tiempoMs = 0,
    recomendacion = '—',
    siguienteAccion = 'Esperando tu disparo',
}) {
    const pasos = [
        { num: 1, label: 'Información del tablero', valor: 'Actualizada' },
        { num: 2, label: 'Configuraciones válidas', valor: validas.toLocaleString('es-CR') },
        { num: 3, label: 'Mapa de probabilidades', valor: `MAX: ${probabilidadMax}%` },
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