import portaaviones from '../assets/portaaviones.svg';
import acorazado from '../assets/acorazado.svg';
import crucero from '../assets/crucero.svg';
import submarino from '../assets/submarino.svg';
import destructor from '../assets/destructor.svg';

// eslint-disable-next-line react-refresh/only-export-components
export const IMAGENES = { portaaviones, acorazado, crucero, submarino, destructor };

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