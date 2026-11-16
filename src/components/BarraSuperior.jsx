import '../css/BarraSuperior.css';

const OPCIONES_SIMULACIONES = [100, 1000, 5000, 10000];

export default function BarraSuperior({
    nSimulaciones,
    onCambiarSimulaciones,
    onReiniciar,
}) {
    return (
        <header className="barra-superior">
            <button
                type="button"
                className="btn-reiniciar"
                onClick={onReiniciar}
            >
                ↻ REINICIAR
            </button>

            <div className="controles-simulacion">
                <span className="etiqueta-sim">SIMULACIONES:</span>
                <div className="grupo-simulaciones">
                    {OPCIONES_SIMULACIONES.map((cant) => (
                        <button
                            key={cant}
                            type="button"
                            className={`btn-sim${nSimulaciones === cant ? ' activo' : ''}`}
                            onClick={() => onCambiarSimulaciones(cant)}
                        >
                            {cant.toLocaleString('es-CR')}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}