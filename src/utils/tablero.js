import { FLOTA } from './tiposBarcos.js';

export const TAMANO_TABLERO = 10;

// Crea un tablero vacío de 10x10
/**
 * Crea un tablero de 10 por 10 sin barcos ni disparos.
 *
 * @returns {Array<Array<Object>>} Tablero vacío.
 */
export function crearTableroVacio() {
  const tablero = [];

  for (let i = 0; i < TAMANO_TABLERO; i++) {
    const fila = [];

    for (let j = 0; j < TAMANO_TABLERO; j++) {
      fila.push({
        barco: null,      // null si no hay barco
        atacado: false,   // si ya fue disparado
        resultado: null,  // 'agua' o 'impacto'
      });
    }
    tablero.push(fila);

  }

  return tablero;
}

// Verifica si se puede colocar un barco en esa posición (ignorando opcionalmente un barco por su id)
/**
 * Comprueba si un barco cabe en la posición sin chocar con otros.
 *
 * @param {Array<Array<Object>>} tablero - Tablero donde se comprueba la posición.
 * @param {number} fila - Fila inicial.
 * @param {number} col - Columna inicial.
 * @param {number} tamano - Cantidad de casillas que ocupa el barco.
 * @param {string} orientacion - Orientación horizontal o vertical.
 * @param {string|null} idIgnorar - Barco que se puede ignorar al comprobar.
 * @returns {boolean} Verdadero si se puede colocar el barco.
 */

function puedeColocar(tablero, fila, col, tamano, orientacion, idIgnorar = null) {
  for (let i = 0; i < tamano; i++) {
    const f = orientacion === 'horizontal' ? fila : fila + i;
    const c = orientacion === 'horizontal' ? col + i : col;

    // Verificar que no se salga del tablero en ninguno de los 4 bordes
    if (f < 0 || f >= TAMANO_TABLERO || c < 0 || c >= TAMANO_TABLERO) {
      return false;
    }

    // Verificar que no haya otro barco distinto
    const ocupante = tablero[f][c].barco;
    if (ocupante !== null && ocupante.id !== idIgnorar) {
      return false;
    }
  }

  return true;

}

// Coloca un barco en el tablero
/**
 * Coloca un barco en las casillas indicadas del tablero.
 *
 * @param {Array<Array<Object>>} tablero - Tablero que se modifica.
 * @param {Object} barco - Datos del barco.
 * @param {number} fila - Fila inicial.
 * @param {number} col - Columna inicial.
 * @param {string} orientacion - Orientación del barco.
 */

function colocarBarco(tablero, barco, fila, col, orientacion) {
  const id = barco.nombre + '-' + fila + '-' + col;

  for (let i = 0; i < barco.tamano; i++) {
    const f = orientacion === 'horizontal' ? fila : fila + i;
    const c = orientacion === 'horizontal' ? col + i : col;

    tablero[f][c].barco = {
      id: id,
      nombre: barco.nombre,
      tamano: barco.tamano,
      orientacion: orientacion,
    };
  }

}

// Coloca todos los barcos aleatoriamente
/**
 * Crea un tablero e intenta colocar toda la flota aleatoriamente.
 *
 * @returns {Array<Array<Object>>} Tablero con los barcos colocados.
 */

export function colocarFlotaAleatoria() {
  const tablero = crearTableroVacio();
  const orientaciones = ['horizontal', 'vertical'];

  for (let b = 0; b < FLOTA.length; b++) {
    const barco = FLOTA[b];
    let colocado = false;
    let intentos = 0;

    while (!colocado && intentos < 1000) {
      const orientacion = orientaciones[Math.floor(Math.random() * 2)];
      const fila = Math.floor(Math.random() * TAMANO_TABLERO);
      const col = Math.floor(Math.random() * TAMANO_TABLERO);

      if (puedeColocar(tablero, fila, col, barco.tamano, orientacion)) {
        colocarBarco(tablero, barco, fila, col, orientacion);
        colocado = true;

      }

      intentos++;
    }
  }

  return tablero;
}

// Obtiene la lista de barcos en el tablero con sus coordenadas y orientación
/**
 * Obtiene los barcos del tablero con sus posiciones y orientación.
 *
 * @param {Array<Array<Object>>} tablero - Tablero que contiene los barcos.
 * @returns {Array<Object>} Lista de barcos encontrados.
 */

export function obtenerBarcos(tablero) {
  const barcosMap = {};

  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const celda = tablero[f][c];

      if (celda.barco) {
        const id = celda.barco.id;

        if (!barcosMap[id]) {
          barcosMap[id] = {
            id: id,
            nombre: celda.barco.nombre,
            tamano: celda.barco.tamano,
            orientacion: celda.barco.orientacion,
            celdas: [],
          };
        }

        barcosMap[id].celdas.push({ fila: f, col: c });
      }
    }

  }

  return Object.values(barcosMap).map((b) => {
    const primera = b.celdas[0];
    // Determinar si es horizontal comparando celdas o leyendo orientacion
    const esHorizontal =
      b.orientacion === 'horizontal' ||
      (b.celdas.length > 1 && b.celdas[0].fila === b.celdas[1].fila);

    return {
      ...b,
      fila: primera.fila,
      col: primera.col,
      horizontal: esHorizontal,
      orientacion: esHorizontal ? 'horizontal' : 'vertical',
    };
  });
}

// Verifica si un barco está hundido
/**
 * Comprueba si todas las casillas de un barco fueron atacadas.
 *
 * @param {Array<Array<Object>>} tablero - Tablero donde está el barco.
 * @param {string} barcoId - Identificador del barco.
 * @returns {boolean} Verdadero si el barco está hundido.
 */
export function barcoHundido(tablero, barcoId) {
  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const celda = tablero[f][c];

      if (celda.barco && celda.barco.id === barcoId && !celda.atacado) {
        return false; // Todavía hay una celda sin atacar
      }
    }
  }
  return true; // Todas las celdas fueron atacadas
}

// Para localizar un barco tanto por su id exacto como por nombre en minúsculas
/**
 * Busca un barco por su identificador o nombre y obtiene su posición inicial.
 *
 * @param {Array<Array<Object>>} tablero - Tablero donde se busca.
 * @param {string} idBarco - Identificador o nombre del barco.
 * @returns {Object|null} Barco y coordenadas mínimas, o null si no aparece.
 */
function buscarBarcoEnTablero(tablero, idBarco) {
  let barcoObj = null;
  let minFila = TAMANO_TABLERO;
  let minCol = TAMANO_TABLERO;

  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const b = tablero[f][c].barco;
      if (b && (b.id === idBarco || b.nombre?.toLowerCase() === idBarco)) {
        barcoObj = b;
        if (f < minFila) minFila = f;
        if (c < minCol) minCol = c;

      }
    }

  }

  return barcoObj ? { barcoObj, minFila, minCol } : null;
}

// Rota el barco alrededor de su centro y lo ajusta si está pegado a un borde
/**
 * Intenta girar un barco y ajusta su posición si está cerca de un borde.
 *
 * @param {Array<Array<Object>>} tableroJugador - Tablero actual del jugador.
 * @param {string} idBarco - Barco que se quiere girar.
 * @param {number} tamanoTablero - Tamaño del tablero.
 * @returns {Array<Array<Object>>} Tablero con el giro, o el original si no se puede.
 */

export function rotarBarcoEnTablero(tableroJugador, idBarco, tamanoTablero = TAMANO_TABLERO) {
  const nuevoTablero = tableroJugador.map((f) => f.map((c) => ({ ...c })));
  const encontrado = buscarBarcoEnTablero(nuevoTablero, idBarco);

  if (!encontrado) return tableroJugador;

  const { barcoObj, minFila, minCol } = encontrado;
  const eraHorizontal = barcoObj.orientacion === 'horizontal';
  const nuevaOrientacion = eraHorizontal ? 'vertical' : 'horizontal';
  const tamano = barcoObj.tamano;

  // 1. Calcular el centro geométrico del barco
  const desplazamientoCentro = Math.floor((tamano - 1) / 2);
  const centroFila = eraHorizontal ? minFila : minFila + desplazamientoCentro;
  const centroCol = eraHorizontal ? minCol + desplazamientoCentro : minCol;

  // 2. Proyectar la nueva esquina superior-izquierda desde ese centro
  let nuevaFila = nuevaOrientacion === 'horizontal' ? centroFila : centroFila - desplazamientoCentro;
  let nuevaCol = nuevaOrientacion === 'horizontal' ? centroCol - desplazamientoCentro : centroCol;

  // 3. Ajuste contra paredes: empujar hacia adentro si toca algún borde
  if (nuevaOrientacion === 'horizontal') {
    if (nuevaCol < 0) nuevaCol = 0;
    if (nuevaCol + tamano > tamanoTablero) nuevaCol = tamanoTablero - tamano;
  } else {
    if (nuevaFila < 0) nuevaFila = 0;
    if (nuevaFila + tamano > tamanoTablero) nuevaFila = tamanoTablero - tamano;
  }

  // 4. Validar que no choque con otros barcos en su nueva posición
  if (!puedeColocar(nuevoTablero, nuevaFila, nuevaCol, tamano, nuevaOrientacion, barcoObj.id)) {
    return tableroJugador;
  }

  // 5. Limpiar las celdas anteriores del barco
  for (let f = 0; f < tamanoTablero; f++) {
    for (let c = 0; c < tamanoTablero; c++) {
      if (nuevoTablero[f][c].barco?.id === barcoObj.id) {
        nuevoTablero[f][c].barco = null;
      }
    }


  }

  // 6. Escribir el barco en su nueva orientación
  for (let i = 0; i < tamano; i++) {
    const f = nuevaOrientacion === 'horizontal' ? nuevaFila : nuevaFila + i;
    const c = nuevaOrientacion === 'horizontal' ? nuevaCol + i : nuevaCol;

    nuevoTablero[f][c].barco = {
      ...barcoObj,
      orientacion: nuevaOrientacion,
    };
  }

  return nuevoTablero;


}

// Mueve un barco a (nuevaFila, nuevaCol) si no se sale ni pisa otro barco
/**
 * Intenta mover un barco sin salir del tablero ni superponerlo.
 *
 * @param {Array<Array<Object>>} tableroJugador - Tablero actual del jugador.
 * @param {string} idBarco - Barco que se quiere mover.
 * @param {number} nuevaFila - Nueva fila inicial.
 * @param {number} nuevaCol - Nueva columna inicial.
 * @param {number} tamanoTablero - Tamaño del tablero.
 * @returns {Array<Array<Object>>} Tablero actualizado, o el original si no se puede mover.
 */

export function moverBarcoEnTablero(tableroJugador, idBarco, nuevaFila, nuevaCol, tamanoTablero = TAMANO_TABLERO) {
  const nuevoTablero = tableroJugador.map((f) => f.map((c) => ({ ...c })));
  const encontrado = buscarBarcoEnTablero(nuevoTablero, idBarco);

  if (!encontrado) return tableroJugador;

  const { barcoObj } = encontrado;

  if (!puedeColocar(nuevoTablero, nuevaFila, nuevaCol, barcoObj.tamano, barcoObj.orientacion, barcoObj.id)) {
    return tableroJugador;
  }

  // Limpiar celdas anteriores
  for (let f = 0; f < tamanoTablero; f++) {
    for (let c = 0; c < tamanoTablero; c++) {
      if (nuevoTablero[f][c].barco?.id === barcoObj.id) {
        nuevoTablero[f][c].barco = null;
      }
    }
  }

  // Colocar en la nueva coordenada
  for (let i = 0; i < barcoObj.tamano; i++) {
    const f = barcoObj.orientacion === 'horizontal' ? nuevaFila : nuevaFila + i;
    const c = barcoObj.orientacion === 'horizontal' ? nuevaCol + i : nuevaCol;

    nuevoTablero[f][c].barco = {
      ...barcoObj,
    };
  }

  return nuevoTablero;
}