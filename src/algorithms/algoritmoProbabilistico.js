 /**
 * Proyecto #2: Batalla Naval Probabilística 
 Curso: IC-3002 Análisis de Algoritmos — Tecnológico de Costa Rica (TEC)
 * Profesor: Ing. Joss Pecou Johnson
 *
 * Módulo de la Persona 2: Algoritmo Probabilístico Basado en Simulación Monte Carlo
 * Ubicación en el repositorio: src/algorithms/algoritmoProbabilistico.js
 *
 * REGLA FUNDAMENTAL DEL ENUNCIADO:
 * Este módulo contiene lógica pura en JavaScript, completamente separada de React UI,
 * y NO recibe en ningún momento la ubicación real de la flota del rival. Construye sus
 * decisiones exclusivamente a partir de `estadoDisparos` (matriz 10x10 con valores
 * 'desconocido' | 'agua' | 'impacto' | 'hundido').
 */

import { FLOTA } from '../utils/tiposBarcos.js';
import { TAMANO_TABLERO } from '../utils/tablero.js';

export const ESTADOS_CELDA = {
  DESCONOCIDO: 'desconocido',
  AGUA: 'agua',
  IMPACTO: 'impacto',
  HUNDIDO: 'hundido',
};

/**
 * Deduce qué tamaños de barcos de `FLOTA` siguen a flote si no se provee explícitamente
 * la lista de barcos restantes, analizando las celdas marcadas como 'hundido'.
 *
 * @param {string[][]} estadoDisparos - Matriz 10x10 del historial de disparos
 * @param {Array<number|{tamano: number}>} [barcosRestantes] - Lista opcional de barcos activos
 * @returns {number[]} Arreglo de tamaños de barcos por colocar, ordenados de mayor a menor
 */
export function obtenerTamanosBarcosActivos(estadoDisparos, barcosRestantes = null) {
  if (Array.isArray(barcosRestantes) && barcosRestantes.length > 0) {
    return barcosRestantes
      .map((b) => (typeof b === 'number' ? b : b.tamano))
      .sort((a, b) => b - a);
  }

  let celdasHundidas = 0;
  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      if (estadoDisparos[f][c] === ESTADOS_CELDA.HUNDIDO) {
        celdasHundidas++;
      }
    }
  }

  const todosLosTamanos = FLOTA.map((b) => b.tamano); // [5, 4, 3, 3, 2]
  if (celdasHundidas === 0) {
    return todosLosTamanos.sort((a, b) => b - a);
  }

  let mejorMascara = 0;
  let mejorSuma = 0;
  const n = todosLosTamanos.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    let suma = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) suma += todosLosTamanos[i];
    }
    if (suma === celdasHundidas) {
      mejorMascara = mask;
      break;
    }
    if (suma < celdasHundidas && suma > mejorSuma) {
      mejorSuma = suma;
      mejorMascara = mask;
    }
  }

  const activos = [];
  for (let i = 0; i < n; i++) {
    if (!(mejorMascara & (1 << i))) {
      activos.push(todosLosTamanos[i]);
    }
  }
  return activos.sort((a, b) => b - a);
}

/**
 * Extrae las coordenadas de impactos activos ('impacto') y celdas bloqueadas
 * ('agua' o 'hundido') a partir de la matriz 10x10 de disparos.
 * Complejidad: O(N^2) donde N = 10 (100 operaciones).
 *
 * @param {string[][]} estadoDisparos - Matriz 10x10
 * @returns {{
 *   impactos: Array<{fila: number, col: number, idx: number}>,
 *   bloqueadas: Uint8Array,
 *   mapaImpactos: Uint8Array
 * }}
 */
export function analizarEstadoTablero(estadoDisparos) {
  const impactos = [];
  const bloqueadas = new Uint8Array(TAMANO_TABLERO * TAMANO_TABLERO);
  const mapaImpactos = new Uint8Array(TAMANO_TABLERO * TAMANO_TABLERO);

  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const estado = estadoDisparos[f][c];
      const idx = f * TAMANO_TABLERO + c;
      if (estado === ESTADOS_CELDA.AGUA || estado === ESTADOS_CELDA.HUNDIDO) {
        bloqueadas[idx] = 1;
      } else if (estado === ESTADOS_CELDA.IMPACTO) {
        impactos.push({ fila: f, col: c, idx });
        mapaImpactos[idx] = 1;
      }
    }
  }

  return { impactos, bloqueadas, mapaImpactos };
}

/**
 * Verifica si un barco de longitud `tamano` puede colocarse en (fila, col) con orientación
 * horizontal (`0`), vertical (`1`), diagonal principal (`2`) o diagonal secundaria (`3`),
 * sin salirse del tablero, sin pisar celdas de 'agua'/'hundido' y sin superponerse con otro barco.
 */
export function puedeColocarBarco(ocupadas, bloqueadas, fila, col, tamano, orientacion) {
  let df = 0;
  let dc = 0;
  if (orientacion === 0) {
    dc = 1;
    if (col + tamano > TAMANO_TABLERO) return false;
  } else if (orientacion === 1) {
    df = 1;
    if (fila + tamano > TAMANO_TABLERO) return false;
  } else if (orientacion === 2) {
    df = 1;
    dc = 1;
    if (fila + tamano > TAMANO_TABLERO || col + tamano > TAMANO_TABLERO) return false;
  } else if (orientacion === 3) {
    df = 1;
    dc = -1;
    if (fila + tamano > TAMANO_TABLERO || col - (tamano - 1) < 0) return false;
  }

  for (let k = 0; k < tamano; k++) {
    const nf = fila + k * df;
    const nc = col + k * dc;
    const idx = nf * TAMANO_TABLERO + nc;
    if (bloqueadas[idx] === 1 || ocupadas[idx] === 1) {
      return false;
    }
  }
  return true;
}

/**
 * Marca las celdas de un barco sobre el tablero plano de la simulación actual.
 */
function escribirBarco(ocupadas, fila, col, tamano, orientacion, valor) {
  const df = orientacion === 0 ? 0 : 1;
  const dc = orientacion === 0 ? 1 : orientacion === 1 ? 0 : orientacion === 2 ? 1 : -1;
  for (let k = 0; k < tamano; k++) {
    const idx = (fila + k * df) * TAMANO_TABLERO + (col + k * dc);
    ocupadas[idx] = valor;
  }
}

/**
 * Enumera todas las colocaciones válidas para un barco de longitud `tamano` que pasan por
 * una celda de impacto `(filaObj, colObj)` y prioriza alineaciones colineales cuando hay
 * múltiples impactos adyacentes (como D6 y D7).
 */
function obtenerColocacionesQueCubrenImpacto(
  ocupadas,
  bloqueadas,
  mapaImpactos,
  filaObj,
  colObj,
  tamano,
  permitirDiagonal = false
) {
  const colocaciones = [];
  const orientaciones = permitirDiagonal ? [0, 1, 2, 3] : [0, 1];
  let maxImpactosCubiertos = 1;

  for (const orientacion of orientaciones) {
    const df = orientacion === 0 ? 0 : 1;
    const dc = orientacion === 0 ? 1 : orientacion === 1 ? 0 : orientacion === 2 ? 1 : -1;

    for (let offset = 0; offset < tamano; offset++) {
      const filaInicio = filaObj - offset * df;
      const colInicio = colObj - offset * dc;
      if (
        filaInicio >= 0 &&
        filaInicio < TAMANO_TABLERO &&
        colInicio >= 0 &&
        colInicio < TAMANO_TABLERO &&
        puedeColocarBarco(ocupadas, bloqueadas, filaInicio, colInicio, tamano, orientacion)
      ) {
        let impactosCubiertos = 0;
        for (let k = 0; k < tamano; k++) {
          const idx = (filaInicio + k * df) * TAMANO_TABLERO + (colInicio + k * dc);
          if (mapaImpactos[idx] === 1) impactosCubiertos++;
        }
        if (impactosCubiertos > maxImpactosCubiertos) {
          maxImpactosCubiertos = impactosCubiertos;
        }
        colocaciones.push({
          fila: filaInicio,
          col: colInicio,
          orientacion,
          impactosCubiertos,
        });
      }
    }
  }

  if (maxImpactosCubiertos > 1 && Math.random() < 0.85) {
    return colocaciones.filter((c) => c.impactosCubiertos === maxImpactosCubiertos);
  }
  return colocaciones;
}

/**
 * Generador / Muestreador de una configuración de la flota (1 simulación Monte Carlo).
 */
export function muestrearConfiguracionFlota(
  tamanosBarcos,
  impactos,
  bloqueadas,
  mapaImpactos,
  permitirDiagonal = false
) {
  const ocupadas = new Uint8Array(TAMANO_TABLERO * TAMANO_TABLERO);
  const barcosDisponibles = [...tamanosBarcos];
  const numOrientaciones = permitirDiagonal ? 4 : 2;

  if (impactos.length > 0) {
    for (let i = barcosDisponibles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = barcosDisponibles[i];
      barcosDisponibles[i] = barcosDisponibles[j];
      barcosDisponibles[j] = tmp;
    }
  }

  // Fase 1: Cubrir impactos activos conocidos con barcos de la flota
  for (let i = 0; i < impactos.length; i++) {
    const imp = impactos[i];
    if (ocupadas[imp.idx] === 1) {
      continue;
    }

    if (barcosDisponibles.length === 0) {
      return { esValida: false, ocupadas };
    }

    let colocado = false;
    for (let bIdx = 0; bIdx < barcosDisponibles.length; bIdx++) {
      const tamano = barcosDisponibles[bIdx];
      const opciones = obtenerColocacionesQueCubrenImpacto(
        ocupadas,
        bloqueadas,
        mapaImpactos,
        imp.fila,
        imp.col,
        tamano,
        permitirDiagonal
      );

      if (opciones.length > 0) {
        const elegida = opciones[Math.floor(Math.random() * opciones.length)];
        escribirBarco(ocupadas, elegida.fila, elegida.col, tamano, elegida.orientacion, 1);
        barcosDisponibles.splice(bIdx, 1);
        colocado = true;
        break;
      }
    }

    if (!colocado) {
      return { esValida: false, ocupadas };
    }
  }

  // Fase 2: Colocar el resto de los barcos aleatoriamente sin superposición ni pisar agua/hundidos
  barcosDisponibles.sort((a, b) => b - a);

  const INTENTOS_MUESTREO = impactos.length > 0 ? 2 : 4;
  for (let b = 0; b < barcosDisponibles.length; b++) {
    const tamano = barcosDisponibles[b];
    let exito = false;

    for (let intento = 0; intento < INTENTOS_MUESTREO; intento++) {
      const orientacion = Math.floor(Math.random() * numOrientaciones);
      const fila = Math.floor(Math.random() * TAMANO_TABLERO);
      const col = Math.floor(Math.random() * TAMANO_TABLERO);

      if (puedeColocarBarco(ocupadas, bloqueadas, fila, col, tamano, orientacion)) {
        escribirBarco(ocupadas, fila, col, tamano, orientacion, 1);
        exito = true;
        break;
      }
    }

    if (!exito) {
      return { esValida: false, ocupadas };
    }
  }

  // Fase 3: Validación estricta contra toda la información conocida (agua, impactos, hundidos)
  if (!validarConfiguracionCompleta(ocupadas, impactos, bloqueadas)) {
    return { esValida: false, ocupadas };
  }

  return { esValida: true, ocupadas };
}

/**
 * Verifica que la configuración candidata sea 100 % compatible con la información conocida:
 * 1. Ninguna celda de 'agua' o 'hundido' contiene un barco activo.
 * 2. Todas las celdas marcadas como 'impacto' están cubiertas por un barco.
 */
export function validarConfiguracionCompleta(ocupadas, impactos, bloqueadas) {
  for (let i = 0; i < 100; i++) {
    if (bloqueadas[i] === 1 && ocupadas[i] === 1) {
      return false;
    }
  }
  for (let k = 0; k < impactos.length; k++) {
    if (ocupadas[impactos[k].idx] !== 1) {
      return false;
    }
  }
  return true;
}

/**
 * Función principal del contrato entre capas (Persona 1, Persona 2 y Persona 3).
 *
 * Compatible exactamente con `DatosPruebas.js` y `Juego.jsx`:
 *   calcularProbabilidades(estadoDisparos, nSimulaciones) ->
 *     {
 *       mapa: number[10][10],            // Valores en porcentaje 0 - 100 (ej. 61.8)
 *       recomendada: { fila, col, prob }, // Celda objetivo con desempate aleatorio
 *       validas: number,                 // Configuraciones válidas
 *       simulaciones: number,            // 100 | 1000 | 5000 | 10000
 *       tiempoMs: number                 // Tiempo real en milisegundos
 *     }
 *
 * @param {string[][]} estadoDisparos - Matriz 10x10 con 'desconocido' | 'agua' | 'impacto' | 'hundido'
 * @param {number} [nSimulaciones=5000] - Cantidad de simulaciones (100, 1000, 5000, 10000)
 * @param {object} [opciones={}] - Opciones adicionales (`barcosRestantes`, `permitirDiagonal`)
 */
export function calcularProbabilidades(estadoDisparos, nSimulaciones = 5000, opciones = {}) {
  const inicioTiempo =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

  const { barcosRestantes = null, permitirDiagonal = false } = opciones;
  const tamanosBarcos = obtenerTamanosBarcosActivos(estadoDisparos, barcosRestantes);
  const { impactos, bloqueadas, mapaImpactos } = analizarEstadoTablero(estadoDisparos);

  const conteoPorCelda = new Uint32Array(TAMANO_TABLERO * TAMANO_TABLERO);
  let configuracionesValidas = 0;

  // Ejecutar las N simulaciones solicitadas
  for (let s = 0; s < nSimulaciones; s++) {
    const resultado = muestrearConfiguracionFlota(
      tamanosBarcos,
      impactos,
      bloqueadas,
      mapaImpactos,
      permitirDiagonal
    );

    if (resultado.esValida) {
      configuracionesValidas++;
      const { ocupadas } = resultado;
      for (let idx = 0; idx < 100; idx++) {
        if (ocupadas[idx] === 1) {
          conteoPorCelda[idx]++;
        }
      }
    }
  }

  // Construir matriz 10x10 de probabilidades P(c) en escala 0 - 100 (igual que mockCalcularProbabilidades)
  const mapa = Array.from({ length: TAMANO_TABLERO }, () => Array(TAMANO_TABLERO).fill(0));
  let maxProb = -1;
  let candidatasMaximas = [];

  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const estado = estadoDisparos[f][c];
      if (estado !== ESTADOS_CELDA.DESCONOCIDO) {
        mapa[f][c] = 0;
        continue;
      }

      const idx = f * TAMANO_TABLERO + c;
      const probPct =
        configuracionesValidas > 0
          ? Number(((conteoPorCelda[idx] / configuracionesValidas) * 100).toFixed(1))
          : 0;
      mapa[f][c] = probPct;

      const EPSILON = 1e-6;
      if (probPct > maxProb + EPSILON) {
        maxProb = probPct;
        candidatasMaximas = [{ fila: f, col: c, prob: probPct }];
      } else if (Math.abs(probPct - maxProb) <= EPSILON && maxProb >= 0) {
        candidatasMaximas.push({ fila: f, col: c, prob: probPct });
      }
    }
  }

  if (configuracionesValidas === 0 || maxProb === 0) {
    candidatasMaximas = obtenerCeldasRespaldo(estadoDisparos, impactos);
  }

  // Selección de la celda recomendada con desempate aleatorio uniforme
  let recomendada = null;
  if (candidatasMaximas.length > 0) {
    const indiceElegido = Math.floor(Math.random() * candidatasMaximas.length);
    const ganadora = candidatasMaximas[indiceElegido];
    recomendada = {
      fila: ganadora.fila,
      col: ganadora.col,
      prob: ganadora.prob,
    };
  }

  const finTiempo =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  const tiempoMs = Number((finTiempo - inicioTiempo).toFixed(1));

  return {
    mapa,
    recomendada,
    validas: configuracionesValidas,
    simulaciones: nSimulaciones,
    tiempoMs,
  };
}

/**
 * Respaldo en caso extremo de que 0 simulaciones converjan en un turno con N=100.
 */
function obtenerCeldasRespaldo(estadoDisparos, impactos) {
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const vecinas = [];
  for (const imp of impactos) {
    for (const [df, dc] of dirs) {
      const nf = imp.fila + df;
      const nc = imp.col + dc;
      if (
        nf >= 0 &&
        nf < TAMANO_TABLERO &&
        nc >= 0 &&
        nc < TAMANO_TABLERO &&
        estadoDisparos[nf][nc] === ESTADOS_CELDA.DESCONOCIDO
      ) {
        vecinas.push({ fila: nf, col: nc, prob: 0 });
      }
    }
  }
  if (vecinas.length > 0) return vecinas;

  const desconocidas = [];
  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      if (estadoDisparos[f][c] === ESTADOS_CELDA.DESCONOCIDO) {
        desconocidas.push({ fila: f, col: c, prob: 0 });
      }
    }
  }
  return desconocidas;
}