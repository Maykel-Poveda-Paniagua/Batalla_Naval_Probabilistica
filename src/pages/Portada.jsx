import { useState } from "react";
import fondo from "../assets/Portada.jpg";
import "../css/Portada.css";

/**
 * Nombres de los integrantes del equipo que aparecen en la pantalla de créditos.
 *
 * @type {string[]}
 */
const INTEGRANTES = [
	"Rashely González Thompson",
	"Yeinery Durán Bastos",
	"Maykel Poveda Paniagua",
];

/**
 * Pantalla de inicio del juego con el menú principal, que permite empezar la partida,
 * ver los créditos del curso y del equipo o mostrar un mensaje de despedida al salir.
 *
 * @component
 * @example
 * return (
 *   <Portada onJugar={() => console.log('Iniciando juego')} />
 * )
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Function} [props.onJugar=() => {}] - Función que se ejecuta al hacer clic en el botón "Jugar".
 * @returns {JSX.Element} Vista de portada con navegación entre menú principal, créditos y salida.
 */
export default function Portada({ onJugar = () => {} }) {
  	const [salio, setSalio] = useState(false);
  	const [creditos, setCreditos] = useState(false);

	return (
		<main className="portada" style={{ backgroundImage: `url(${fondo})` }}>
		<section className="tarjeta">
			{salio ? (
			<>
				<h1 className="titulo">¡Gracias por jugar!</h1>
				<p className="subtitulo">Hasta la próxima batalla</p>
				<button className="btn btn--jugar" onClick={() => setSalio(false)}>
				Volver
				</button>
			</>
			) : creditos ? (
			<>
				<h1 className="titulo">Créditos</h1>
				<ul className="creditos">
				{INTEGRANTES.map((n) => (
					<li key={n}>{n}</li>
				))}
				</ul>
				<p className="detalle">
				IC-3002 Análisis de Algoritmos
				<br />
				Prof. Ing. Joss Pecou Johnson
				<br />
				Escuela de Ingeniería en Computación, TEC
				<br />
				Semestre II-2026
				</p>
				<button
				className="btn btn--salir"
				onClick={() => setCreditos(false)}
				>
				Volver
				</button>
			</>
			) : (
			<>
				<h1 className="titulo">Batalla Naval</h1>
				<p className="subtitulo">Probabilística</p>
				<nav className="menu" aria-label="Menú principal">
				<button className="btn btn--jugar" onClick={onJugar}>
					Jugar
				</button>
				<button className="btn btn--salir" onClick={() => setSalio(true)}>
					Salir
				</button>
				<button
					className="btn btn--chico"
					onClick={() => setCreditos(true)}
				>
					Créditos
				</button>
				</nav>
			</>
			)}
		</section>
		</main>
	);
}