import { calcularProbabilidades } from '../algorithms/algoritmoProbabilistico.js';
import { TAMANO_TABLERO } from './tablero.js';


 //Agente computacional que usa el algoritmo probabilístico 

export function crearAgente() {
  return {
    historial: [], // array de { fila, col, resultado, hundido }
    nSimulaciones: 5000,

    /**
     * Analiza el estado del tablero enemigo y decide dónde disparar
     * @param {string[][]} estadosEnemigo - Matriz 10x10 con 'desconocido' | 'agua' | 'impacto' | 'hundido'
     * @returns {Object} { fila, col, probabilidad, infoProceso }
     */
    analizar: function(estadosEnemigo) {

      // Usar el algoritmo probabilístico 
      const infoProceso = calcularProbabilidades(estadosEnemigo, this.nSimulaciones);
      
      if (infoProceso.recomendada) {
        return {
          fila: infoProceso.recomendada.fila,
          col: infoProceso.recomendada.col,
          probabilidad: infoProceso.recomendada.prob,
          infoProceso: infoProceso,
        };
      }
      
      // Si no hay recomendación, disparar aleatorio
      return this.dispararAleatorio(estadosEnemigo);
    },

    // Disparo aleatorio en celda desconocida
    
    dispararAleatorio: function(estadosEnemigo) {
      const disponibles = [];
      
      for (let f = 0; f < TAMANO_TABLERO; f++) {
        for (let c = 0; c < TAMANO_TABLERO; c++) {
          if (estadosEnemigo[f][c] === 'desconocido') {
            disponibles.push({ fila: f, col: c });
          }
        }
      }

      if (disponibles.length === 0) return null;

      const index = Math.floor(Math.random() * disponibles.length);
      return { 
        fila: disponibles[index].fila, 
        col: disponibles[index].col, 
        probabilidad: 0,
        infoProceso: null,
      };
    },

    //Registra el resultado de un disparo
   
    registrarResultado: function(fila, col, resultado, hundido) {
      this.historial.push({
        fila: fila,
        col: col,
        resultado: resultado,
        hundido: hundido,
      });
    },

    //Reinicia el agente
  
    reiniciar: function() {
      this.historial = [];
    },

    //Cambia el número de simulaciones
    
    setSimulaciones: function(n) {
      this.nSimulaciones = n;
    },
  };
}