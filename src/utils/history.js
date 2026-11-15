// Crea historial vacío
export function crearHistorial() {
  return {
    decisionesAgente: [],
    decisionesJugador: [],
  };
}

// Registra decisión del agente
export function registrarAgente(historial, fila, col, probabilidad) {
  historial.decisionesAgente.push({
    fila: fila,
    col: col,
    probabilidad: probabilidad,
    timestamp: Date.now(),
  });
}

// Registra decisión del jugador
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