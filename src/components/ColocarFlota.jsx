import { useState, useRef } from 'react';
import TableroNaval from './TableroNaval';
import Barco from './Barco';
import '../css/ColocarFlota.css';

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