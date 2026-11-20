import { useState, useRef } from 'react';
import TableroNaval from './TableroNaval';
import Barco from './Barco';
import '../css/ColocarFlota.css';

/**
 * @typedef {Object} DatosBarco
 * @property {string} id - Identificador único del barco en el tablero.
 * @property {string} nombre - Nombre del barco (por ejemplo, 'Portaaviones').
 * @property {number} tamano - Cantidad de casillas que ocupa el barco.
 * @property {number} fila - Fila inicial del barco (0 a 9).
 * @property {number} col - Columna inicial del barco (0 a 9).
 * @property {boolean} horizontal - Indica si el barco está colocado en horizontal (`true`) o vertical (`false`).
 */

/**
 * @typedef {Object} EstadoArrastre
 * @property {string} id - Identificador del barco que se está moviendo.
 * @property {number} fila - Fila actual mientras se arrastra el barco.
 * @property {number} col - Columna actual mientras se arrastra el barco.
 * @property {number} offsetFila - Distancia vertical desde la esquina del barco hasta donde hiciste clic.
 * @property {number} offsetCol - Distancia horizontal desde la esquina del barco hasta donde hiciste clic.
 * @property {boolean} choca - Indica si el barco está chocando con otro en la casilla actual.
 */

/**
 * Pantalla previa a la batalla donde el jugador acomoda sus barcos en el tablero,
 * ya sea arrastrándolos, rotándolos o generándolos de forma aleatoria.
 *
 * @component
 * @example
 * return (
 *   <ColocarFlota
 *     estadosPropios={matrizVacia}
 *     flotaPropia={listaBarcos}
 *     onIniciarBatalla={() => {}}
 *     onPosicionAleatoria={() => {}}
 *     onRotarBarco={(id) => {}}
 *     onMoverBarco={(id, fila, col) => {}}
 *   />
 * )
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string[][]} props.estadosPropios - Matriz de 10x10 con el estado visual del tablero del jugador.
 * @param {DatosBarco[]} props.flotaPropia - Lista de barcos del jugador que aparecen en el tablero.
 * @param {Function} props.onIniciarBatalla - Función que se ejecuta al confirmar la posición y empezar a jugar.
 * @param {Function} [props.onPosicionAleatoria] - Función que acomoda todos los barcos al azar.
 * @param {Function} [props.onRotarBarco] - Función que gira un barco; recibe su ID.
 * @param {Function} [props.onMoverBarco] - Función que guarda la nueva posición al soltar un barco; recibe `(id, nuevaFila, nuevaCol)`.
 * @returns {JSX.Element} Vista de preparación para acomodar la flota.
 */
export default function ColocarFlota({
    estadosPropios,
    flotaPropia,
    onIniciarBatalla,
    onPosicionAleatoria,
    onRotarBarco,
    onMoverBarco,
}) {
    const [arrastre, setArrastre] = useState(null);
    const capaRef = useRef(null);

    /**
     * Revisa si mover un barco a cierta casilla hace que se salga del tablero
     * o quede encima de otro barco.
     *
     * @param {string} idBarco - ID del barco que se está moviendo.
     * @param {number} filaDestino - Fila a la que se quiere mover (0 a 9).
     * @param {number} colDestino - Columna a la que se quiere mover (0 a 9).
     * @param {number} tamano - Cantidad de casillas que mide el barco.
     * @param {boolean} horizontal - Si el barco está en horizontal o vertical.
     * @returns {boolean} `true` si choca o se sale del tablero; `false` si cabe bien.
     */
    const hayColision = (idBarco, filaDestino, colDestino, tamano, horizontal) => {
        for (let i = 0; i < tamano; i++) {
            const f = horizontal ? filaDestino : filaDestino + i;
            const c = horizontal ? colDestino + i : colDestino;

            if (f < 0 || f >= 10 || c < 0 || c >= 10) return true;

            for (const otro of flotaPropia) {
                if (otro.id === idBarco) continue;
                for (let j = 0; j < otro.tamano; j++) {
                    const of = otro.horizontal ? otro.fila : otro.fila + j;
                    const oc = otro.horizontal ? otro.col + j : otro.col;
                    if (f === of && c === oc) return true;
                }
            }
        }
        return false;
    };

    /**
     * Empieza el arrastre cuando haces clic o tocas un barco, guardando en qué parte
     * exacta del barco agarraste para moverlo con naturalidad.
     *
     * @param {React.PointerEvent<HTMLDivElement>} e - Evento al presionar sobre el barco.
     * @param {DatosBarco} barco - Barco que se empezó a arrastrar.
     * @returns {void}
     */
    const iniciarArrastre = (e, barco) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;

        // Buscamos exactamente el contenedor de 10x10 (.tablero-capa)
        const capa = e.currentTarget.closest('.tablero-capa');
        if (!capa) return;

        e.currentTarget.setPointerCapture(e.pointerId);
        capaRef.current = capa;

        const rect = capa.getBoundingClientRect();
        const tamanoCelda = rect.width / 10;

        // Guardamos el desplazamiento exacto (en celdas decimales) desde la esquina del barco hasta donde hiciste clic
        const offsetCol = (e.clientX - rect.left) / tamanoCelda - barco.col;
        const offsetFila = (e.clientY - rect.top) / tamanoCelda - barco.fila;

        setArrastre({
            id: barco.id,
            fila: barco.fila,
            col: barco.col,
            offsetFila,
            offsetCol,
            choca: false,
        });
    };

    /**
     * Calcula a qué casilla corresponde la posición actual del cursor mientras arrastras
     * el barco y revisa si hay choque con otra embarcación.
     *
     * @param {React.PointerEvent<HTMLDivElement>} e - Evento mientras se mueve el puntero.
     * @param {DatosBarco} barco - Barco que se está arrastrando.
     * @returns {void}
     */
    const moverArrastre = (e, barco) => {
        if (!arrastre || arrastre.id !== barco.id || !capaRef.current) return;

        const rect = capaRef.current.getBoundingClientRect();
        const tamanoCelda = rect.width / 10;

        const cursorCol = (e.clientX - rect.left) / tamanoCelda;
        const cursorFila = (e.clientY - rect.top) / tamanoCelda;

        const maxFila = barco.horizontal ? 9 : 10 - barco.tamano;
        const maxCol = barco.horizontal ? 10 - barco.tamano : 9;

        const nuevaFila = Math.max(0, Math.min(maxFila, Math.round(cursorFila - arrastre.offsetFila)));
        const nuevaCol = Math.max(0, Math.min(maxCol, Math.round(cursorCol - arrastre.offsetCol)));

        if (nuevaFila === arrastre.fila && nuevaCol === arrastre.col) return;

        const choca = hayColision(barco.id, nuevaFila, nuevaCol, barco.tamano, barco.horizontal);

        setArrastre((prev) => ({
            ...prev,
            fila: nuevaFila,
            col: nuevaCol,
            choca,
        }));
    };

    /**
     * Termina el arrastre al soltar el barco y guarda su nueva ubicación si no choca
     * con otro barco y realmente cambió de casilla.
     *
     * @param {React.PointerEvent<HTMLDivElement>} e - Evento al soltar el puntero.
     * @param {DatosBarco} barco - Barco que se soltó.
     * @returns {void}
     */
    const soltarArrastre = (e, barco) => {
        if (!arrastre || arrastre.id !== barco.id) return;

        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }

        if (!arrastre.choca && (arrastre.fila !== barco.fila || arrastre.col !== barco.col)) {
            onMoverBarco?.(barco.id, arrastre.fila, arrastre.col);
        }
        setArrastre(null);
    };

    return (
        <div className="despliegue-contenedor">
            <h2 className="despliegue-titulo">Fase de Despliegue</h2>
            <p className="despliegue-subtitulo">
                Arrastra tus barcos para moverlos y usa el botón para rotarlos.
            </p>

            <div className="despliegue-tablero-wrapper">
                <TableroNaval titulo="Tu Flota (Despliegue)" estados={estadosPropios} capaDebajo>
                    {flotaPropia.map((barco) => {
                        const estaArrastrando = arrastre?.id === barco.id;
                        const barcoVisual = estaArrastrando
                            ? { ...barco, fila: arrastre.fila, col: arrastre.col }
                            : barco;

                        return (
                            <Barco
                                key={barco.id}
                                barco={barcoVisual}
                                choca={estaArrastrando && arrastre.choca}
                                onPointerDown={(e) => iniciarArrastre(e, barco)}
                                onPointerMove={(e) => moverArrastre(e, barco)}
                                onPointerUp={(e) => soltarArrastre(e, barco)}
                                onRotar={() => onRotarBarco?.(barco.id)}
                            />
                        );
                    })}
                </TableroNaval>
            </div>

            <div className="despliegue-acciones">
                {onPosicionAleatoria && (
                    <button
                        type="button"
                        className="btn-despliegue btn-despliegue--secundario"
                        onClick={onPosicionAleatoria}
                    >
                        Posición Aleatoria
                    </button>
                )}

                <button
                    type="button"
                    className="btn-despliegue btn-despliegue--principal"
                    onClick={onIniciarBatalla}
                >
                    ¡INICIAR BATALLA!
                </button>
            </div>
        </div>
    );
}