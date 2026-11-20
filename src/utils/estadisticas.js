// Crea objeto de estadísticas vacío
/**
 * Crea las estadísticas iniciales de la partida.
 *
 * @returns {Object} Estadísticas con todos los contadores en cero.
 */
export function crearEstadisticas() {
  return {
    disparosJugador: 0,
    disparosAgente: 0,
    impactosJugador: 0,
    impactosAgente: 0,
    fallosJugador: 0,
    fallosAgente: 0,
    barcosHundidosJugador: 0,
    barcosHundidosAgente: 0,
  };
}

// Actualiza estadísticas después de un disparo
/**
 * Actualiza los contadores según el resultado de un disparo.
 *
 * @param {Object} stats - Estadísticas que se van a actualizar.
 * @param {string} tipo - Indica si disparó el jugador o el agente.
 * @param {string} resultado - Resultado del disparo.
 * @param {boolean} hundido - Indica si el disparo hundió un barco.
 */

export function actualizarEstadisticas(stats, tipo, resultado, hundido) {
  if (tipo === 'jugador') {
    stats.disparosJugador++;
    if (resultado === 'impacto') {
      stats.impactosJugador++;
      if (hundido) stats.barcosHundidosJugador++;
    } else {
      stats.fallosJugador++;
    }


  } else {
    stats.disparosAgente++;
    if (resultado === 'impacto') {
      stats.impactosAgente++;
      if (hundido) stats.barcosHundidosAgente++;
    } else {
      stats.fallosAgente++;
    }

    
  }
}