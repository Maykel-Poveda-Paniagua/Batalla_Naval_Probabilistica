import { useState } from "react";
import Portada from "./pages/Portada";
import Juego from "./pages/Juego";

export default function App() {
	const [jugando, setJugando] = useState(false);
  	if (!jugando) return <Portada onJugar={() => setJugando(true)} />;
 
  	return <Juego />; 
}