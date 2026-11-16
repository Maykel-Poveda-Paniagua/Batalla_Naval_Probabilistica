import { FLOTA } from './tiposBarcos.js';

export const TAMANO_TABLERO = 10;

// Crea un tablero vacío de 10x10
export function crearTableroVacio() {
  const tablero = [];

  for (let i = 0; i < TAMANO_TABLERO; i++) {
    const fila = [];

    for (let j = 0; j < TAMANO_TABLERO; j++) {
      fila.push({
        barco: null,      // null si no hay barco
        atacado: false,   // si ya fue disparado
        resultado: null,  //'agua' o 'impacto'
      });
    }
    tablero.push(fila);
  }


  return tablero;

}

// Verifica si se puede colocar un barco en esa posición
function puedeColocar(tablero, fila, col, tamano, orientacion) {

  for (let i = 0; i < tamano; i++) {
    const f = orientacion === 'horizontal' ? fila : fila + i;
    const c = orientacion === 'horizontal' ? col + i : col;

    // Verificar que no se salga del tablero
    if (f >= TAMANO_TABLERO || c >= TAMANO_TABLERO) {
      return false;
    }

    // Verificar que no haya otro barco
    if (tablero[f][c].barco !== null) {
      return false;
    }
  }

  return true;

}

// Coloca un barco en el tablero
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

// Obtiene la lista de barcos en el tablero
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
            celdas: [],
          }; 
        }

        barcosMap[id].celdas.push({ fila: f, col: c });
      }
    }

  }
  
  return Object.values(barcosMap);
}


// Verifica si un barco está hundido
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