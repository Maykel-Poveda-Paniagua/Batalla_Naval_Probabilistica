import '../css/BarraSuperior.css';

/**
 * Opciones disponibles para elegir cuántas simulaciones hará la IA por turno.
 *
 * @type {number[]}
 */
const OPCIONES_SIMULACIONES = [100, 1000, 5000, 10000];

/**
 * Barra superior del juego con el botón para reiniciar la partida
 * y los botones para elegir cuántas simulaciones debe calcular la IA en cada turno.
 *
 * @component
 * @example
 * return (
 *   <BarraSuperior
 *     nSimulaciones={5000}
 *     onCambiarSimulaciones={(cantidad) => console.log(cantidad)}
 *     onReiniciar={() => console.log('Reiniciar')}
 *     apagado={false}
 *   />
 * )
 *
 * @param {Object} props - Propiedades del componente.
 * @param {number} props.nSimulaciones - Cantidad de simulaciones que está seleccionada actualmente.
 * @param {Function} props.onCambiarSimulaciones - Función que se ejecuta al elegir otra cantidad de simulaciones.
 * @param {Function} props.onReiniciar - Función que se ejecuta al presionar el botón de reiniciar partida.
 * @param {boolean} [props.apagado=false] - Si es `true`, muestra el botón de reinicio atenuado.
 * @returns {JSX.Element} Barra superior con los controles de reinicio y simulaciones.
 */
export default function BarraSuperior({
    nSimulaciones,
    onCambiarSimulaciones,
    onReiniciar,
    apagado = false,
}) {
    return (
        <header className="barra-superior">
            <button
                type="button"
                className="btn-reiniciar"
                onClick={onReiniciar}
                apagado={apagado}
                style={apagado ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
                ↻ REINICIAR
            </button>

            <div className="controles-simulacion">
                <span className="etiqueta-sim">SIMULACIONES:</span>
                <div className="grupo-simulaciones">
                    {OPCIONES_SIMULACIONES.map((cant) => (
                        <button
                            key={cant}
                            type="button"
                            className={`btn-sim${nSimulaciones === cant ? ' activo' : ''}`}
                            onClick={() => onCambiarSimulaciones(cant)}
                        >
                            {cant.toLocaleString('es-CR')}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}