import { Fragment, useMemo } from 'react';
import explosion from '../assets/explosion.svg';
import '../css/TableroNaval.css';

/**
 * Letras de las filas del tablero (de la A a la J).
 *
 * @type {string[]}
 */
const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

/**
 * Números de las columnas del tablero (del 1 al 10).
 *
 * @type {number[]}
 */
const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Cantidad de filas y columnas del tablero (10x10).
 *
 * @type {number}
 */
const TAMANO = 10;

/**
 * Tablero inicial de 10x10 con todas las casillas sin explorar.
 *
 * @type {string[][]}
 */
// Matriz por defecto.
const MATRIZ_VACIA = Array.from({ length: TAMANO }, () =>
  Array(TAMANO).fill('desconocido')
);

/**
 * Colores base (en RGB) para pintar el mapa de calor, desde probabilidad baja (celeste)
 * hasta probabilidad alta (rojo oscuro).
 *
 * @type {number[][]}
 */
// Escala del mapa de calor.
const PARADAS_CALOR = [
  [143, 211, 244],
  [246, 211, 74],
  [246, 141, 74],
  [197, 27, 10],
];

/**
 * Calcula el color de fondo de una casilla según qué tan probable es que tenga un barco.
 *
 * @param {number} t - Valor entre 0 y 1 que indica qué tan cerca está de la probabilidad más alta.
 * @returns {string} Color listo para usar en CSS en formato `rgba(...)`.
 */
function colorCalor(t) {
  const x = Math.min(Math.max(t, 0), 1) * (PARADAS_CALOR.length - 1);
  const i = Math.min(PARADAS_CALOR.length - 2, Math.floor(x));
  const f = x - i;
  const [r, g, b] = PARADAS_CALOR[i].map((v, k) =>
    Math.round(v + (PARADAS_CALOR[i + 1][k] - v) * f)
  );
  return `rgba(${r}, ${g}, ${b}, ${(0.25 + 0.65 * t).toFixed(2)})`;
}

/**
 * @typedef {Object} CeldaRecomendada
 * @property {number} fila - Fila de la casilla sugerida (0 a 9).
 * @property {number} col - Columna de la casilla sugerida (0 a 9).
 */

/**
 * Dibuja un tablero de 10x10 con sus coordenadas, muestra los disparos realizados
 * (agua, impacto o hundido), pinta el mapa de calor con las probabilidades y resalta
 * la mejor casilla para atacar.
 *
 * @component
 * @example
 * return (
 *   <TableroNaval
 *     titulo="Aguas Enemigas"
 *     estados={matrizEstados}
 *     probabilidades={matrizProbabilidades}
 *     mostrarPorcentaje={true}
 *     recomendada={{ fila: 4, col: 5 }}
 *     onCeldaClick={(fila, col) => console.log(fila, col)}
 *   />
 * )
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.titulo - Título que aparece arriba del tablero.
 * @param {string[][]} [props.estados=MATRIZ_VACIA] - Matriz de 10x10 con el estado de cada casilla.
 * @param {number[][]|null} [props.probabilidades=null] - Matriz de 10x10 con los porcentajes (0 a 100) para el mapa de calor.
 * @param {boolean} [props.mostrarPorcentaje=false] - Si es `true`, muestra el número de porcentaje dentro de cada casilla.
 * @param {CeldaRecomendada|null} [props.recomendada=null] - Casilla sugerida por la IA para resaltarla con un borde especial.
 * @param {Function} [props.onCeldaClick] - Función que se ejecuta al hacer clic en una casilla sin explorar; recibe `(fila, col)`.
 * @param {React.ReactNode} [props.children] - Elementos que se dibujan encima del tablero, como los barcos.
 * @param {React.RefObject<HTMLDivElement>} [props.capaRef] - Referencia opcional para medir el área del tablero al arrastrar barcos.
 * @param {boolean} [props.capaDebajo=false] - Si es `true`, coloca la capa de barcos por debajo de las casillas.
 * @returns {JSX.Element} El tablero completo con sus coordenadas y casillas.
 */
export default function TableroNaval({
  titulo,
  estados = MATRIZ_VACIA,
  probabilidades = null,
  mostrarPorcentaje = false,
  recomendada = null,
  onCeldaClick,
  children,
  capaRef,
  capaDebajo = false,
}) {
  // El mapa de calor se normaliza contra la mayor probabilidad del tablero.
  const maximo = useMemo(
    () => (probabilidades ? Math.max(0, ...probabilidades.flat()) : 0),
    [probabilidades]
  );

  return (
    <section className="tablero-marco">
      <h2 className="tablero-titulo">{titulo}</h2>

		<div className="tablero-interior">
			<div className="tablero-mar" role="group" aria-label={titulo}>
			{/* Fila superior*/}
			<span className="coord" aria-hidden="true" />
			{NUMEROS.map((n) => (
				<span key={n} className="coord" aria-hidden="true">
				{n}
				</span>
			))}

			{/* Una letra por fila seguida de sus 10 casillas */}
			{LETRAS.map((letra, fila) => (
				<Fragment key={letra}>
				<span className="coord" aria-hidden="true">
					{letra}
				</span>
				{NUMEROS.map((numero, col) => {
					const estado = estados[fila]?.[col] ?? 'desconocido';
					const prob = probabilidades?.[fila]?.[col];
					const conCalor = estado === 'desconocido' && prob > 0 && maximo > 0;
					const esRecomendada =
						recomendada?.fila === fila && recomendada?.col === col;

					const clases = ['celda', `celda--${estado}`];
					if (esRecomendada) clases.push('celda--recomendada');

					const etiqueta = `Casilla ${letra}${numero}, ${estado}${
					prob != null ? `, ${prob.toFixed(1)} %` : ''
					}`;

					return (
					<button
						key={numero}
						type="button"
						className={clases.join(' ')}
						style={conCalor ? { backgroundColor: colorCalor(prob / maximo) } : undefined}
						disabled={!onCeldaClick || estado !== 'desconocido'}
						onClick={() => onCeldaClick?.(fila, col)}
						aria-label={etiqueta}
						title={prob != null ? `${letra}${numero} — ${prob.toFixed(1)} %` : `${letra}${numero}`}
					>
						{mostrarPorcentaje && conCalor && (
							<span className="celda__porcentaje">{prob.toFixed(1)}</span>
						)}

						{estado === 'impacto' && (
						<img
							src={explosion}
							alt="Impacto"
							className="celda__explosion"
							draggable={false}
						/>
                    )}
					</button>
					);
				})}
				</Fragment>
			))}

			{(children !== undefined || capaRef) && (
				<div
				ref={capaRef}
				className={`tablero-capa${capaDebajo ? ' tablero-capa--debajo' : ''}`}
				>
					{children}
				</div>
			)}
			</div>
		</div>
    </section>
  );
}