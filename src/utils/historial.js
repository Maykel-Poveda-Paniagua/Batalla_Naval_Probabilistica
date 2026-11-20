// Crea historial vacío
/**
 * Crea el historial de decisiones de ambos participantes.
 *
 * @returns {Object} Historial con las listas de decisiones vacías.
 */
export function crearHistorial() {
  return {
    decisionesAgente: [],
    decisionesJugador: [],
  };
}

// Registra decisión del agente
/**
 * Guarda un disparo del agente con su probabilidad y fecha.
 *
 * @param {Object} historial - Historial donde se guarda la decisión.
 * @param {number} fila - Fila del disparo.
 * @param {number} col - Columna del disparo.
 * @param {number} probabilidad - Probabilidad calculada para la celda.
 */

export function registrarAgente(historial, fila, col, probabilidad) {
  historial.decisionesAgente.push({
    fila: fila,
    col: col,
    probabilidad: probabilidad,
    timestamp: Date.now(),
  });
}

// Registra decisión del jugador

/**
 * Guarda el disparo del jugador y si siguió la recomendación.
 *
 * @param {Object} historial - Historial donde se guarda la decisión.
 * @param {number} fila - Fila elegida por el jugador.
 * @param {number} col - Columna elegida por el jugador.
 * @param {number} recomendacionFila - Fila recomendada por el algoritmo.
 * @param {number} recomendacionCol - Columna recomendada por el algoritmo.
 * @param {boolean} seguida - Indica si se siguió la recomendación.
 */

export function registrarJugador(historial, fila, col, recomendacionFila, recomendacionCol, seguida) {
  historial.decisionesJugador.push({
    fila: fila,
    col: col,
    recomendacionFila: recomendacionFila,
    recomendacionCol: recomendacionCol,
    seguida: seguida,
    timestamp: Date.now(),
  });
}