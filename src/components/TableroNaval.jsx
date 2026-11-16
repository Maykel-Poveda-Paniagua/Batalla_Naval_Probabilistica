import { Fragment, useMemo } from 'react';
import explosion from '../assets/explosion.svg';
import '../css/TableroNaval.css';

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const TAMANO = 10;

// Matriz por defecto.
const MATRIZ_VACIA = Array.from({ length: TAMANO }, () =>
  Array(TAMANO).fill('desconocido')
);

// Escala del mapa de calor.
const PARADAS_CALOR = [
  [143, 211, 244],
  [246, 211, 74],
  [246, 141, 74],
  [197, 27, 10],
];

function colorCalor(t) {
  const x = Math.min(Math.max(t, 0), 1) * (PARADAS_CALOR.length - 1);
  const i = Math.min(PARADAS_CALOR.length - 2, Math.floor(x));
  const f = x - i;
  const [r, g, b] = PARADAS_CALOR[i].map((v, k) =>
    Math.round(v + (PARADAS_CALOR[i + 1][k] - v) * f)
  );
  return `rgba(${r}, ${g}, ${b}, ${(0.25 + 0.65 * t).toFixed(2)})`;
}

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