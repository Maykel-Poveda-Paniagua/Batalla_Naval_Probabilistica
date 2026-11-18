import { TAMANO_TABLERO } from './tablero.js';

/**
 * convierte el tablero interno (objetos) al formato de strings que se usa en
 * el algoritmo probabilístico y los componentes de UI.
 */
export function tableroAFormatoStrings(tablero, esPropio = false) {
  const matriz = [];
  
  for (let f = 0; f < TAMANO_TABLERO; f++) {
    const fila = [];
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const celda = tablero[f][c];
      
      if (!celda.atacado) {

        // Si no ha sido atacado
        if (esPropio && celda.barco) {
          fila.push('barco'); // Solo para visualización propia
        } else {
          fila.push('desconocido');
        }
      } else {

        // Si ya fue atacado
        if (celda.resultado === 'impacto') {

          // Verificar si el barco está hundido
          if (celda.barco) {
            const barcoId = celda.barco.id;
            const hundido = verificarBarcoHundido(tablero, barcoId);
            fila.push(hundido ? 'hundido' : 'impacto');
          } else {
            fila.push('impacto');
          }
        } else {
          fila.push('agua');
        }
      }
    }
    matriz.push(fila);
  }
  
  return matriz;
}

// Verifica si un barco está completamente hundido

function verificarBarcoHundido(tablero, barcoId) {
  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const celda = tablero[f][c];
      if (celda.barco && celda.barco.id === barcoId && !celda.atacado) {
        return false;
      }
    }
  }
  return true;
}

//Obtiene la lista de barcos en formato compatible con el componente Barco
 
export function obtenerBarcosParaUI(tablero) {
  const barcosMap = {};
  
  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const celda = tablero[f][c];
      if (celda.barco) {
        const id = celda.barco.id;
        if (!barcosMap[id]) {

          // Esta es la primera celda que se encuentra del barco = origen
          barcosMap[id] = {
            id: celda.barco.nombre.toLowerCase(), // Para buscar la imagen SVG
            nombre: celda.barco.nombre,
            tamano: celda.barco.tamano,
            fila: f,  
            col: c,    
            horizontal: celda.barco.orientacion === 'horizontal',
            hundido: false,
          };
        }
      }
    }
  }
  
  // Verificar cuáles están hundidos
  const barcos = Object.values(barcosMap);
  for (let i = 0; i < barcos.length; i++) {
    const barco = barcos[i];

    // reconstruir el ID original: "nombre-fila-col"
    const idOriginal = `${barco.nombre}-${barco.fila}-${barco.col}`;
    barco.hundido = verificarBarcoHundido(tablero, idOriginal);
  }
  
  return barcos;
}