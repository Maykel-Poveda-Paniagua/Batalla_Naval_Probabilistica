/**
 * @fileoverview Módulo del algoritmo probabilístico
 * @module algoritmoProbabilistico
 */

import { FLOTA } from '../utils/tiposBarcos.js';
import { TAMANO_TABLERO } from '../utils/tablero.js';

/**
 * Posibles estados observacionales de cada celda en la matriz del historial de disparos.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADOS_CELDA = {
  DESCONOCIDO: 'desconocido',
  AGUA: 'agua',
  IMPACTO: 'impacto',
  HUNDIDO: 'hundido',
};

/**
 * @typedef {Object} CeldaImpacto
 * @property {number} fila - Índice de la fila en el tablero (0 a 9).
 * @property {number} col - Índice de la columna en el tablero (0 a 9).
 * @property {number} idx - Índice lineal equivalente en el arreglo plano (`fila * 10 + col`).
 */

/**
 * @typedef {Object} AnalisisTablero
 * @property {CeldaImpacto[]} impactos - Lista de celdas actualmente marcadas como `'impacto'`.
 * @property {Uint8Array} bloqueadas - Mapa plano de 100 posiciones con `1` en celdas de `'agua'` o `'hundido'`.
 * @property {Uint8Array} mapaImpactos - Mapa plano de 100 posiciones con `1` en celdas de `'impacto'`.
 */

/**
 * @typedef {Object} ColocacionCandidata
 * @property {number} fila - Fila inicial del barco.
 * @property {number} col - Columna inicial del barco.
 * @property {number} orientacion - Orientación (`0`: horizontal, `1`: vertical).
 * @property {number} impactosCubiertos - Cantidad de impactos activos que cubre esta colocación.
 */

/**
 * @typedef {Object} ConfiguracionMuestreada
 * @property {boolean} esValida - Indica si la configuración superó todas las restricciones del tablero.
 * @property {Uint8Array} ocupadas - Tablero plano de 100 posiciones con `1` en las celdas ocupadas por la flota simulada.
 */

/**
 * @typedef {Object} CeldaRecomendada
 * @property {number} fila - Índice de la fila recomendada (0 a 9).
 * @property {number} col - Índice de la columna recomendada (0 a 9).
 * @property {number} prob - Probabilidad estimada en escala de `0` a `100` (porcentaje).
 */

/**
 * @typedef {Object} OpcionesSimulacion
 * @property {Array<number|{tamano: number}>|null} [barcosRestantes=null] - Lista opcional de barcos que aún siguen a flote.
 */

/**
 * @typedef {Object} ResultadoProbabilistico
 * @property {number[][]} mapa - Matriz 10x10 con la probabilidad porcentual `P(c)` de cada celda (`0` a `100`).
 * @property {CeldaRecomendada|null} recomendada - Celda objetivo con mayor probabilidad (con desempate aleatorio).
 * @property {number} validas - Cantidad total de configuraciones simuladas que resultaron válidas.
 * @property {number} simulaciones - Cantidad total de simulaciones ejecutadas en el turno.
 * @property {number} tiempoMs - Tiempo real de ejecución del cálculo en milisegundos.
 */

/**
 * Deduce qué tamaños de barcos de la flota estándar siguen a flote analizando las
 * celdas marcadas como `'hundido'` cuando no se provee explícitamente la lista de barcos restantes.
 *
 * @param {string[][]} estadoDisparos - Matriz 10x10 con el historial de disparos conocidos.
 * @param {Array<number|{tamano: number}>|null} [barcosRestantes=null] - Lista opcional de barcos aún no hundidos.
 * @returns {number[]} Arreglo de tamaños de barcos activos ordenados de mayor a menor longitud.
 *
 * @example
 * const tamanos = obtenerTamanosBarcosActivos(estadoDisparos);
 * // Retorna, por ejemplo, [5, 4, 3, 3] si el Destructor (2) ya fue hundido.
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

  const todosLosTamanos = FLOTA.map((b) => b.tamano);
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
 * Extrae las coordenadas de impactos activos (`'impacto'`) y celdas bloqueadas
 * (`'agua'` o `'hundido'`) a partir de la matriz 10x10 del tablero enemigo.
 * Complejidad temporal: O(N^2), donde N = 10.
 *
 * @param {string[][]} estadoDisparos - Matriz 10x10 con el estado observable de cada celda.
 * @returns {AnalisisTablero} Objeto con la lista de impactos activos y los mapas planos de restricciones.
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
 * Verifica si un barco de longitud `tamano` puede ubicarse en `(fila, col)` con la
 * orientación indicada sin salirse del tablero, sin pisar celdas bloqueadas (`'agua'`
 * o `'hundido'`) y sin superponerse con otro barco ya colocado en la simulación actual.
 *
 * @param {Uint8Array} ocupadas - Arreglo plano de 100 elementos con los barcos ya colocados.
 * @param {Uint8Array} bloqueadas - Arreglo plano de 100 elementos con celdas prohibidas.
 * @param {number} fila - Índice de fila inicial (0 a 9).
 * @param {number} col - Índice de columna inicial (0 a 9).
 * @param {number} tamano - Longitud del barco en celdas.
 * @param {number} orientacion - `0`: horizontal, `1`: vertical.
 * @returns {boolean} `true` si la colocación es geométrica y observacionalmente válida.
 */
export function puedeColocarBarco(ocupadas, bloqueadas, fila, col, tamano, orientacion) {
  let df = 0;
  let dc = 0;
  if (orientacion === 0) {
    dc = 1;
    if (col + tamano > TAMANO_TABLERO) return false;
  } else {
    df = 1;
    if (fila + tamano > TAMANO_TABLERO) return false;
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
 * Marca las celdas ocupadas por un barco sobre el arreglo plano de la simulación actual.
 *
 * @param {Uint8Array} ocupadas - Arreglo plano de 100 elementos de la simulación actual.
 * @param {number} fila - Fila inicial del barco.
 * @param {number} col - Columna inicial del barco.
 * @param {number} tamano - Longitud del barco.
 * @param {number} orientacion - Orientación (`0`: horizontal, `1`: vertical).
 * @param {number} valor - Valor a escribir (`1` para ocupar, `0` para limpiar).
 * @returns {void}
 */
function escribirBarco(ocupadas, fila, col, tamano, orientacion, valor) {
  const df = orientacion === 0 ? 0 : 1;
  const dc = orientacion === 0 ? 1 : 0;
  for (let k = 0; k < tamano; k++) {
    const idx = (fila + k * df) * TAMANO_TABLERO + (col + k * dc);
    ocupadas[idx] = valor;
  }
}

/**
 * Enumera todas las colocaciones válidas para un barco de longitud `tamano` que pasan
 * por una celda de impacto `(filaObj, colObj)` y prioriza alineaciones colineales cuando
 * existen múltiples impactos adyacentes.
 *
 * @param {Uint8Array} ocupadas - Arreglo plano de barcos colocados en la simulación.
 * @param {Uint8Array} bloqueadas - Arreglo plano de celdas de `'agua'` o `'hundido'`.
 * @param {Uint8Array} mapaImpactos - Arreglo plano con `1` en las celdas de `'impacto'`.
 * @param {number} filaObj - Fila de la celda de impacto que se desea cubrir.
 * @param {number} colObj - Columna de la celda de impacto que se desea cubrir.
 * @param {number} tamano - Longitud del barco candidato.
 * @returns {ColocacionCandidata[]} Lista de colocaciones válidas que cubren el impacto.
 */
function obtenerColocacionesQueCubrenImpacto(
  ocupadas,
  bloqueadas,
  mapaImpactos,
  filaObj,
  colObj,
  tamano
) {
  const colocaciones = [];
  let maxImpactosCubiertos = 1;

  for (const orientacion of [0, 1]) {
    const df = orientacion === 0 ? 0 : 1;
    const dc = orientacion === 0 ? 1 : 0;

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
 * Genera y muestrea una configuración candidata completa de la flota para una simulación
 * individual de Monte Carlo.
 *
 * Fases del muestreo:
 * 1. Ancla barcos disponibles sobre las celdas con estado `'impacto'`.
 * 2. Ubica los barcos restantes en posiciones aleatorias válidas sin superposición.
 * 3. Valida la configuración resultante contra toda la evidencia conocida del tablero.
 *
 * @param {number[]} tamanosBarcos - Lista de tamaños de los barcos activos por ubicar.
 * @param {CeldaImpacto[]} impactos - Lista de impactos activos aún no hundidos.
 * @param {Uint8Array} bloqueadas - Arreglo plano de celdas de `'agua'` o `'hundido'`.
 * @param {Uint8Array} mapaImpactos - Arreglo plano de celdas de `'impacto'`.
 * @returns {ConfiguracionMuestreada} Resultado con la validez de la configuración y su mapa de ocupación.
 */
export function muestrearConfiguracionFlota(
  tamanosBarcos,
  impactos,
  bloqueadas,
  mapaImpactos
) {
  const ocupadas = new Uint8Array(TAMANO_TABLERO * TAMANO_TABLERO);
  const barcosDisponibles = [...tamanosBarcos];

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
        tamano
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
      const orientacion = Math.floor(Math.random() * 2);
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
 * Verifica que una configuración candidata sea 100 % compatible con la información
 * conocida de la partida: ninguna celda de `'agua'` o `'hundido'` puede estar ocupada
 * y todas las celdas de `'impacto'` deben estar cubiertas por algún barco.
 *
 * @param {Uint8Array} ocupadas - Tablero plano de 100 posiciones generado en la simulación.
 * @param {CeldaImpacto[]} impactos - Lista de impactos activos conocidos.
 * @param {Uint8Array} bloqueadas - Mapa plano de celdas marcadas como `'agua'` o `'hundido'`.
 * @returns {boolean} `true` si la configuración es completamente válida.
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
 * Calcula el mapa de probabilidades `P(c)` para cada celda del tablero enemigo mediante
 * simulación Monte Carlo y selecciona la celda recomendada con desempate aleatorio uniforme.
 *
 * Fórmula aplicada:
 *   `P(c) = (Configuraciones válidas con barco en c / Total de configuraciones válidas) * 100`
 *
 * @param {string[][]} estadoDisparos - Matriz 10x10 con `'desconocido' | 'agua' | 'impacto' | 'hundido'`.
 * @param {number} [nSimulaciones=5000] - Cantidad de simulaciones a ejecutar (`100`, `1000`, `5000`, `10000`).
 * @param {OpcionesSimulacion} [opciones={}] - Opciones adicionales de configuración.
 * @returns {ResultadoProbabilistico} Mapa de calor, celda recomendada, conteo de válidas y tiempo en ms.
 *
 * @example
 * const resultado = calcularProbabilidades(estadosEnemigo, 5000);
 * // resultado.recomendada -> { fila: 3, col: 7, prob: 61.8 }
 */
export function calcularProbabilidades(estadoDisparos, nSimulaciones = 5000, opciones = {}) {
  const inicioTiempo =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

  const { barcosRestantes = null } = opciones;
  const tamanosBarcos = obtenerTamanosBarcosActivos(estadoDisparos, barcosRestantes);
  const { impactos, bloqueadas, mapaImpactos } = analizarEstadoTablero(estadoDisparos);

  const conteoPorCelda = new Uint32Array(TAMANO_TABLERO * TAMANO_TABLERO);
  let configuracionesValidas = 0;

  for (let s = 0; s < nSimulaciones; s++) {
    const resultado = muestrearConfiguracionFlota(
      tamanosBarcos,
      impactos,
      bloqueadas,
      mapaImpactos
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
 * Mecanismo de respaldo seguro cuando ninguna simulación aleatoria converge en un turno
 * extremo con pocas simulaciones; prioriza celdas desconocidas adyacentes a impactos activos.
 *
 * @param {string[][]} estadoDisparos - Matriz 10x10 con el historial de disparos.
 * @param {CeldaImpacto[]} impactos - Lista de impactos activos en el tablero.
 * @returns {CeldaRecomendada[]} Lista de celdas candidatas de respaldo.
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