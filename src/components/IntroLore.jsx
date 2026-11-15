import { useState, useEffect } from "react";
import "../css/IntroLore.css";
import oficial from "../assets/PrimerOficial.svg";

const MENSAJES_LORE = [
    {
        emisor: "PRIMER OFICIAL",
        texto: "¡JEFE! Nos quieren atacar. El radar acaba de detectar una flota enemiga entrando en silencio al cuadrante 10x10. ¡Hay que golpear primero antes de que nos fijen en su mira!",
        boton: "CONTINUAR ▸",
    },
    {
        emisor: "PRIMER OFICIAL",
        texto: "Tenga cuidado, Jefe: el enemigo usa un algoritmo probabilístico para deducir nuestra posición. Activamos nuestro propio mapa de calor para guiar sus disparos. ¡Despliegue la flota!",
        boton: "¡A SUS PUESTOS! ⚓",
    },
];

export default function IntroLore({ onFinalizarLore }) {
    const [paso, setPaso] = useState(0);
    const [textoVisible, setTextoVisible] = useState("");
    const mensajeActual = MENSAJES_LORE[paso];

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTextoVisible("");
        let indice = 0;
        const intervalo = setInterval(() => {
            indice++;
            setTextoVisible(mensajeActual.texto.slice(0, indice));
            if (indice >= mensajeActual.texto.length) {
                clearInterval(intervalo);
            }
        }, 25);

        return () => clearInterval(intervalo);
    }, [paso, mensajeActual.texto]);

    const manejarSiguiente = () => {
        if (textoVisible.length < mensajeActual.texto.length) {
            setTextoVisible(mensajeActual.texto);
            return;
        }

        if (paso < MENSAJES_LORE.length - 1) {
            setPaso(paso + 1);
        } else {
            onFinalizarLore();
        }
    };

    return (
        <div className="lore-overlay">
            <div className="lore-ventana">
                <div className="lore-header">
                    <span className="lore-punto-alerta"></span>
                    <span>ALERTA ROJA - TRANSMISIÓN ENTRANTE</span>
                </div>

                <div className="lore-cuerpo">
                    <div className="lore-avatar">
                    <img
                        src={oficial}
                        alt="Oficial de Radar"
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                    />
                    </div>

                    <div className="lore-dialogo">
                        <h4 className="lore-emisor">{mensajeActual.emisor}</h4>
                        <p className="lore-texto">
                            {textoVisible}
                            <span className="lore-cursor">█</span>
                        </p>
                    </div>
                </div>

                <div className="lore-footer">
                    <button className="btn-saltar" onClick={onFinalizarLore}>
                        SALTAR INTRO
                    </button>
                    <button className="btn-accion-lore" onClick={manejarSiguiente}>
                        {textoVisible.length < mensajeActual.texto.length
                            ? "LEER TODO"
                            : mensajeActual.boton}
                    </button>
                </div>
            </div>
        </div>
    );
}