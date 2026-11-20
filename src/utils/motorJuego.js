import { TAMANO_TABLERO, barcoHundido, obtenerBarcos } from './tablero.js';

// Realiza un disparo en el tablero
/**
 * Realiza un disparo y devuelve si fue agua, impacto o barco hundido.
 *
 * @param {Array<Array<Object>>} tablero - Tablero donde se realiza el disparo.
 * @param {number} fila - Fila que se quiere atacar.
 * @param {number} col - Columna que se quiere atacar.
 * @returns {Object} Resultado del disparo o mensaje si no se pudo realizar.
 */
export function realizarDisparo(tablero, fila, col) {

  // Validar coordenadas
  if (fila < 0 || fila >= TAMANO_TABLERO || col < 0 || col >= TAMANO_TABLERO) {
    return { exito: false, mensaje: 'Coordenadas fuera del tablero' };
  }

  const celda = tablero[fila][col];

  // Verificar si ya fue atacada
  if (celda.atacado) {
    return { exito: false, mensaje: 'Celda ya atacada' };
  }

  // Marcar como atacada
  celda.atacado = true;

  // Determinar resultado
  if (celda.barco) {
    celda.resultado = 'impacto';
    const idBarco = celda.barco.id;
    const hundido = barcoHundido(tablero, idBarco);

    return {
      exito: true,
      resultado: 'impacto',
      barco: celda.barco.nombre,
      hundido: hundido,
      fila: fila,
      col: col,
    };


  } else {
    celda.resultado = 'agua';
    return {
      exito: true,
      resultado: 'agua',
      fila: fila,
      col: col,
    };
    
  }

}

// verifica si el juego terminó
/**
 * Revisa si todos los barcos del tablero ya están hundidos.
 *
 * @param {Array<Array<Object>>} tablero - Tablero que se revisa.
 * @returns {boolean} Verdadero si ya no quedan barcos sin hundir.
 */
export function verificarFinJuego(tablero) {
  const barcos = obtenerBarcos(tablero);
  
  for (let i = 0; i < barcos.length; i++) {
    if (!barcoHundido(tablero, barcos[i].id)) {
      return false; // Todavía hay barcos sin hundir
    }
  }
  return true; // todos los barcos están hundidos
}