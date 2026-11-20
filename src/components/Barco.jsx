import portaaviones from '../assets/portaaviones.svg';
import acorazado from '../assets/acorazado.svg';
import crucero from '../assets/crucero.svg';
import submarino from '../assets/submarino.svg';
import destructor from '../assets/destructor.svg';

/**
 * Imágenes SVG asociadas a cada tipo de barco.
 *
 * @type {Object.<string, string>}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const IMAGENES = { portaaviones, acorazado, crucero, submarino, destructor };

/**
 * @typedef {Object} DatosBarco
 * @property {string} id - Tipo de barco (por ejemplo, 'portaaviones').
 * @property {string} nombre - Nombre del barco que se muestra al usuario.
 * @property {number} tamano - Cantidad de casillas que mide el barco.
 * @property {number} fila - Fila donde empieza el barco (0 a 9).
 * @property {number} col - Columna donde empieza el barco (0 a 9).
 * @property {boolean} horizontal - Indica si el barco está acostado (`true`) o de pie (`false`).
 */

/**
 * Dibuja un barco encima del tablero, permitiendo moverlo y girarlo cuando
 * estás acomodando tu flota o mostrarlo fijo durante la partida.
 *
 * @component
 * @example
 * return (
 *   <Barco
 *     barco={{ id: 'destructor', nombre: 'Destructor', tamano: 2, fila: 0, col: 0, horizontal: true }}
 *     hundido={false}
 *   />
 * )
 *
 * @param {Object} props - Propiedades del componente.
 * @param {DatosBarco} props.barco - Datos de posición, tamaño y nombre del barco.
 * @param {boolean} [props.hundido=false] - Si es `true`, marca visualmente el barco como hundido.
 * @param {boolean} [props.choca=false] - Si es `true`, resalta el barco en rojo porque choca o se sale del tablero.
 * @param {boolean} [props.atenuado=false] - Si es `true`, lo muestra un poco transparente mientras mueves otro barco.
 * @param {Function} [props.onPointerDown] - Función al empezar a arrastrar el barco; si no se pasa, el barco queda fijo.
 * @param {Function} [props.onPointerMove] - Función mientras vas moviendo el barco por el tablero.
 * @param {Function} [props.onPointerUp] - Función al soltar el barco.
 * @param {Function} [props.onRotar] - Función que se ejecuta al hacer clic en el botón de girar el barco.
 * @returns {JSX.Element} El barco dibujado en su posición dentro del tablero.
 */
export default function Barco({
    barco,
    hundido = false,
    choca = false,
    atenuado = false,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onRotar,
}) {
    const { id, nombre, tamano, fila, col, horizontal } = barco;
    const largo = `calc(${tamano} * var(--celda))`;

    const clases = [
        'barco',
        !onPointerDown && 'barco--fijo',
        hundido && 'barco--hundido',
        choca && 'barco--choque',
        atenuado && 'barco--atenuado',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={clases}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
                '--n': tamano,
                left: `calc(${col} * var(--celda))`,
                top: `calc(${fila} * var(--celda))`,
                width: horizontal ? largo : 'var(--celda)',
                height: horizontal ? 'var(--celda)' : largo,
            }}
        >
            <img
                className={`barco__img${horizontal ? '' : ' barco__img--vertical'}`}
                src={IMAGENES[id]}
                alt={nombre}
                draggable={false}
            />
            {onRotar && (
                <button
                    type="button"
                    className="barco__rotar"
                    aria-label={`Rotar ${nombre}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRotar();
                    }}
                >
                    ↻
                </button>
            )}
        </div>
    );
}