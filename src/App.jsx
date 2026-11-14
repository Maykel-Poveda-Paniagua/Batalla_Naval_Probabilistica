import { useState } from "react";
import Portada from "./components/Portada";
import Juego from "./components/Juego";

export default function App() {
  const [jugando, setJugando] = useState(false);
  if (!jugando) return <Portada onJugar={() => setJugando(true)} />;
 
  return <Juego />; 
}