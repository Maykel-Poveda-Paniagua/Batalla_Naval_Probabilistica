import { useState } from "react";
import fondo from "../assets/Portada.jpg";
import "../css/Portada.css";

const INTEGRANTES = ["Rashely González Thompson", "Yeinery Durán Bastos", "Maykel Poveda Paniagua"];

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
              {INTEGRANTES.map((n) => <li key={n}>{n}</li>)}
            </ul>
            <p className="detalle">
              IC-3002 Análisis de Algoritmos<br />
              Prof. Ing. Joss Pecou Johnson<br />
              Escuela de Ingeniería en Computación, TEC<br />
              Semestre 2026-II
            </p>
            <button className="btn btn--salir" onClick={() => setCreditos(false)}>
              Volver
            </button>
          </>
        ) : (
          <>
            <h1 className="titulo">Batalla Naval</h1>
            <p className="subtitulo">Probabilística</p>
            <nav className="menu" aria-label="Menú principal">
              <button className="btn btn--jugar" onClick={onJugar}>Jugar</button>
              <button className="btn btn--salir" onClick={() => setSalio(true)}>Salir</button>
              <button className="btn btn--chico" onClick={() => setCreditos(true)}>Créditos</button>
            </nav>
          </>
        )}
      </section>
    </main>
  );
}