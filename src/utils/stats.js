// Crea objeto de estadísticas vacío
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