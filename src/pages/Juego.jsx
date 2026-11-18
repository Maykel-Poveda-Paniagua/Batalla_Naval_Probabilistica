import { useState } from 'react';
import ModalLore from '../components/IntroLore';
import BarraSuperior from '../components/BarraSuperior';
import TableroNaval from '../components/TableroNaval';
import Barco from '../components/Barco';
import PanelProceso from '../components/PanelProceso';
import PanelEstadisticas from '../components/PanelEstadisticas';
import PanelHistorial from '../components/PanelHistorial';
import { calcularProbabilidades } from '../algorithms/algoritmoProbabilistico';
import { colocarFlotaAleatoria, obtenerBarcos, TAMANO_TABLERO } from '../utils/tablero';
import { realizarDisparo, verificarFinJuego } from '../utils/motorJuego';
import { LETRAS } from '../utils/DatosPruebas';
import '../css/Juego.css';

export default function Juego() {
  const [mostrarLore, setMostrarLore] = useState(true);
  const [nSimulaciones, setNSimulaciones] = useState(5000);

  // Estados iniciales del tablero (formato strings para la UI)
  const [estadosPropios, setEstadosPropios] = useState(() => {
    const tablero = colocarFlotaAleatoria();
    return tableroAStrings(tablero, true);
  });

  const [estadosEnemigo, setEstadosEnemigo] = useState(() => {
    const tablero = colocarFlotaAleatoria();
    return tableroAStrings(tablero, false);
  });

  // Tableros internos (formato objetos para la lógica)
  const [tableroJugador, setTableroJugador] = useState(() => colocarFlotaAleatoria());
  const [tableroEnemigo, setTableroEnemigo] = useState(() => colocarFlotaAleatoria());

  // Barcos propios para mostrar en el tablero
  const [barcosPropios, setBarcosPropios] = useState(() => obtenerBarcosParaUI(tableroJugador));
  const [barcosHundidos, setBarcosHundidos] = useState([]);

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    disparos: 0,
    impactos: 0,
    fallos: 0,
    barcosRestantes: 5,
  });

  // Historial de decisiones
  const [historial, setHistorial] = useState([]);
  const [turno, setTurno] = useState(0);

  // Juego terminado
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [ganador, setGanador] = useState(null);

  // Algoritmo probabilístico 
  const infoProceso = calcularProbabilidades(estadosEnemigo, nSimulaciones);
  const coordRecomendada = infoProceso.recomendada
    ? `${LETRAS[infoProceso.recomendada.fila]}${infoProceso.recomendada.col + 1}`
    : '—';

  // [INTEGRACIÓN P1]: Reemplazar por reinicio del motor
  const manejarReiniciar = () => {
    const nuevoTableroJugador = colocarFlotaAleatoria();
    const nuevoTableroEnemigo = colocarFlotaAleatoria();

    setTableroJugador(nuevoTableroJugador);
    setTableroEnemigo(nuevoTableroEnemigo);
    setEstadosPropios(tableroAStrings(nuevoTableroJugador, true));
    setEstadosEnemigo(tableroAStrings(nuevoTableroEnemigo, false));
    setBarcosPropios(obtenerBarcosParaUI(nuevoTableroJugador));
    setBarcosHundidos([]);
    setEstadisticas({
      disparos: 0,
      impactos: 0,
      fallos: 0,
      barcosRestantes: 5,
    });
    setHistorial([]);
    setTurno(0);
    setJuegoTerminado(false);
    setGanador(null);
  };

  // [INTEGRACIÓN P1 y P2]: Conectar aquí el disparo real
  const manejarDisparo = (fila, col) => {
    if (juegoTerminado) return;

    // Copiar tablero enemigo para no modificar el original
    const nuevoTablero = tableroEnemigo.map(f => f.map(c => ({ ...c })));
    const resultado = realizarDisparo(nuevoTablero, fila, col);

    if (!resultado.exito) return;

    // Actualizar tablero enemigo
    setTableroEnemigo(nuevoTablero);
    setEstadosEnemigo(tableroAStrings(nuevoTablero, false));

    // Actualizar barcos hundidos
    const barcosEnemigos = obtenerBarcos(nuevoTablero);
    const hundidos = barcosEnemigos
      .filter(b => {
        // Verificar si todas las celdas del barco están atacadas
        return b.celdas.every(celda => nuevoTablero[celda.fila][celda.col].atacado);
      })
      .map(b => ({
        id: b.nombre.toLowerCase(),
        nombre: b.nombre,
        tamano: b.tamano,
        fila: b.celdas[0].fila,
        col: b.celdas[0].col,
        horizontal: b.celdas[0].orientacion === 'horizontal',
      }));
    setBarcosHundidos(hundidos);

    // Actualizar estadísticas
    const nuevasStats = { ...estadisticas };
    nuevasStats.disparos++;
    if (resultado.resultado === 'impacto') {
      nuevasStats.impactos++;
    } else {
      nuevasStats.fallos++;
    }
    if (resultado.hundido) {
      nuevasStats.barcosRestantes--;
    }
    setEstadisticas(nuevasStats);

    // Registrar en historial
    const fueSeguida = infoProceso.recomendada &&
                       infoProceso.recomendada.fila === fila &&
                       infoProceso.recomendada.col === col;
    setHistorial(prev => [{
      turno: turno + 1,
      coord: `${LETRAS[fila]}${col + 1}`,
      resultado: resultado.hundido ? 'hundido' : resultado.resultado,
      siguioRecomendacion: fueSeguida,
    }, ...prev]);
    setTurno(prev => prev + 1);

    // Verificar si ganó
    if (verificarFinJuego(nuevoTablero)) {
      setJuegoTerminado(true);
      setGanador('jugador');
      return;
    }

    // Turno del agente después de 500ms
    setTimeout(() => turnoAgente(nuevoTablero, tableroAStrings(nuevoTablero, false)), 500);
  };

  // Turno del agente
  const turnoAgente = (tableroEnemigoActual, estadosEnemigoActual) => {
    // El agente usa el algoritmo probabilístico para decidir
    const info = calcularProbabilidades(estadosEnemigoActual, nSimulaciones);

    if (!info.recomendada) return;

    const { fila, col } = info.recomendada;

    // Copiar tablero del jugador
    const nuevoTableroJugador = tableroJugador.map(f => f.map(c => ({ ...c })));
    const resultado = realizarDisparo(nuevoTableroJugador, fila, col);

    if (!resultado.exito) return;

    // Actualizar tablero del jugador
    setTableroJugador(nuevoTableroJugador);
    setEstadosPropios(tableroAStrings(nuevoTableroJugador, true));
    setBarcosPropios(obtenerBarcosParaUI(nuevoTableroJugador));

    // Verificar si perdió
    if (verificarFinJuego(nuevoTableroJugador)) {
      setJuegoTerminado(true);
      setGanador('agente');
    }
  };

  return (
    <div className="juego-contenedor">
      {mostrarLore && (
        <ModalLore onFinalizarLore={() => setMostrarLore(false)} />
      )}

      <BarraSuperior
        nSimulaciones={nSimulaciones}
        onCambiarSimulaciones={setNSimulaciones}
        onReiniciar={manejarReiniciar}
      />

      <main className="juego-principal">
        <div className="fila-tableros">
          <TableroNaval titulo="Tu Flota" estados={estadosPropios} capaDebajo>
            {barcosPropios.map((barco) => (
              <Barco key={barco.id} barco={barco} />
            ))}
          </TableroNaval>

          <TableroNaval
            titulo="Aguas Enemigas"
            estados={estadosEnemigo}
            probabilidades={infoProceso.mapa}
            recomendada={infoProceso.recomendada}
            onCeldaClick={manejarDisparo}
            capaDebajo
          >
            {barcosHundidos.map((barco) => (
              <Barco key={barco.id} barco={barco} hundido />
            ))}
          </TableroNaval>
        </div>

        <section className="panel-inferior" aria-label="Panel de control">
          <PanelProceso
            validas={infoProceso.validas}
            tiempoMs={infoProceso.tiempoMs}
            recomendacion={coordRecomendada}
          />
          <PanelEstadisticas
            disparos={estadisticas.disparos}
            impactos={estadisticas.impactos}
            fallos={estadisticas.fallos}
            barcosRestantes={estadisticas.barcosRestantes}
          />
          <PanelHistorial historial={historial} />
        </section>
      </main>

      {juegoTerminado && (
        <div className="modal-fin-juego">
          <h2>{ganador === 'jugador' ? '¡Ganaste!' : '¡Perdiste!'}</h2>
          <button onClick={manejarReiniciar}>Nueva Partida</button>
        </div>
      )}
    </div>
  );
}

// Función auxiliar para convertir tablero de objetos a strings
function tableroAStrings(tablero, esPropio) {
  const matriz = [];
  for (let f = 0; f < TAMANO_TABLERO; f++) {
    const fila = [];
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const celda = tablero[f][c];
      if (!celda.atacado) {
        if (esPropio && celda.barco) {
          fila.push('barco');
        } else {
          fila.push('desconocido');
        }
      } else {
        if (celda.resultado === 'impacto') {
          fila.push('impacto');
        } else {
          fila.push('agua');
        }
      }
    }
    matriz.push(fila);
  }
  return matriz;
}

// Función auxiliar para obtener barcos en formato UI
function obtenerBarcosParaUI(tablero) {
  const barcosMap = {};
  for (let f = 0; f < TAMANO_TABLERO; f++) {
    for (let c = 0; c < TAMANO_TABLERO; c++) {
      const celda = tablero[f][c];
      if (celda.barco) {
        const id = celda.barco.id;
        if (!barcosMap[id]) {
          barcosMap[id] = {
            id: celda.barco.nombre.toLowerCase(),
            nombre: celda.barco.nombre,
            tamano: celda.barco.tamano,
            fila: f,
            col: c,
            horizontal: celda.barco.orientacion === 'horizontal',
          };
        }
      }
    }
  }
  return Object.values(barcosMap);
}