export const LETRAS = 'ABCDEFGHIJ';
export const TAMANO = 10;

export const crearMatriz = (valor = 'desconocido') =>
    Array.from({ length: TAMANO }, () => Array(TAMANO).fill(valor));

// Flota de muestra para visualizar tus SVGs en "Tu Flota"
export const MOCK_FLOTA_PROPIA = [
    { id: 'portaaviones', nombre: 'Portaaviones', tamano: 5, horizontal: true, fila: 0, col: 1 },
    { id: 'acorazado', nombre: 'Acorazado', tamano: 4, horizontal: false, fila: 4, col: 5 },
    { id: 'crucero', nombre: 'Crucero', tamano: 3, horizontal: true, fila: 1, col: 6 },
    { id: 'submarino', nombre: 'Submarino', tamano: 3, horizontal: false, fila: 2, col: 3 },
    { id: 'destructor', nombre: 'Destructor', tamano: 2, horizontal: true, fila: 8, col: 7 },
];

// Disparos iniciales de ejemplo en el tablero enemigo
export const MOCK_ESTADOS_ENEMIGO = (() => {
    const m = crearMatriz('desconocido');
    m[1][2] = 'agua';     // B3
    m[3][5] = 'impacto';  // D6
    m[3][6] = 'impacto';  // D7
    m[7][1] = 'hundido';  // H2
    m[7][2] = 'hundido';  // H3
    return m;
})();

// Simula calcularProbabilidades(estadoDisparos, nSimulaciones) con valores 0 - 100
export function mockCalcularProbabilidades(estados, nSimulaciones = 5000) {
    const mapa = Array.from({ length: TAMANO }, (_, f) =>
        Array.from({ length: TAMANO }, (_, c) => {
            if (estados[f][c] !== 'desconocido') return 0;
            if (f === 3 && c === 7) return 63.4; // D8 (63.4 %)
            if (f === 3 && c === 4) return 51.2; // D5 (51.2 %)
            if (f === 2 && c === 6) return 31.0; // C7 (31.0 %)
            if (f === 4 && c === 6) return 28.5; // E7 (28.5 %)
            return Number((Math.random() * 12).toFixed(1));
        })
    );

    return {
        mapa,
        recomendada: { fila: 3, col: 7, prob: 63.4 },
        validas: nSimulaciones === 100 ? 34 : nSimulaciones === 1000 ? 312 : 1428,
        simulaciones: nSimulaciones,
        tiempoMs: Number((nSimulaciones * 0.0085).toFixed(1)),
    };
}

export const MOCK_ESTADISTICAS = {
    disparos: 5,
    impactos: 4,
    fallos: 1,
    barcosRestantes: 4,
};

export const MOCK_HISTORIAL = [
    { turno: 5, coord: 'D7', resultado: 'impacto', siguioRecomendacion: true },
    { turno: 4, coord: 'D6', resultado: 'impacto', siguioRecomendacion: false },
    { turno: 3, coord: 'H3', resultado: 'hundido', siguioRecomendacion: true },
    { turno: 2, coord: 'H2', resultado: 'impacto', siguioRecomendacion: true },
    { turno: 1, coord: 'B3', resultado: 'agua', siguioRecomendacion: true },
];

// Barcos enemigos que ya fueron hundidos (H2-H3 = Destructor)
export const MOCK_BARCOS_HUNDIDOS = [
    { id: 'destructor', nombre: 'Destructor', tamano: 2, horizontal: true, fila: 7, col: 1 },
];