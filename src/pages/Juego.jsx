import { useState } from "react";
import ModalLore from "../components/IntroLore";

export default function Juego() {
    const [mostrarLore, setMostrarLore] = useState(true);

    return (
        <div>
            {mostrarLore && (
                <ModalLore onFinalizarLore={() => setMostrarLore(false)} />
            )}

            {/* resto del Juego */}
        </div>
    );
}