import { calcularProbabilidades } from '../algorithms/algoritmoProbabilistico.js';
import { TAMANO_TABLERO } from './tablero.js';


 //Agente computacional que usa el algoritmo probabilístico 

/**
 * Crea el agente computacional con su historial y la cantidad de simulaciones.
 * @returns {Object} Agente con los métodos para analizar, disparar y guardar resultados.
 */

export function crearAgente() {
  return {
    historial: [], // array de { fila, col, resultado, hundido }
    nSimulaciones: 5000,

    /**
     * Analiza el estado del tablero enemigo y decide dónde disparar
     * @param {string[][]} estadosEnemigo - Matriz 10x10 con 'desconocido' | 'agua' | 'impacto' | 'hundido'
     * @returns {Object} { fila, col, probabilidad, infoProceso }
     */
    /**
     * Analiza el tablero enemigo y recomienda una casilla para disparar.
     * @param {string[][]} estadosEnemigo - Estados conocidos de las celdas enemigas.
     * @returns {Object} Posición recomendada, probabilidad e información del cálculo.
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
    
    /**
     * Elige al azar una casilla que todavía no ha sido atacada.
     * @param {string[][]} estadosEnemigo - Matriz con los estados del tablero enemigo.
     * @returns {Object|null} Disparo elegido o null si no quedan casillas disponibles.
     */
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
   
    /**
     * Guarda en el historial el resultado de un disparo del agente.
     * @param {number} fila - Fila atacada.
     * @param {number} col - Columna atacada.
     * @param {string} resultado - Resultado obtenido en el disparo.
     * @param {boolean} hundido - Indica si el disparo hundió un barco.
     * @returns {void}
     */
    registrarResultado: function(fila, col, resultado, hundido) {
      this.historial.push({
        fila: fila,
        col: col,
        resultado: resultado,
        hundido: hundido,
      });
    },

    //Reinicia el agente
  
    /**
     * Limpia el historial del agente para comenzar otra partida.
     * @returns {void}
     */
    reiniciar: function() {
      this.historial = [];
    },

    //Cambia el número de simulaciones
    
    /**
     * Cambia la cantidad de simulaciones que utilizará el agente.
     * @param {number} n - Nueva cantidad de simulaciones.
     * @returns {void}
     */
    setSimulaciones: function(n) {
      this.nSimulaciones = n;
    },
  };
}