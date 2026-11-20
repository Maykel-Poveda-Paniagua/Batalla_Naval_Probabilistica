# Batalla Naval Probabilística

- Proyecto · IC-3002 Análisis de Algoritmos · Escuela de Ingeniería en Computación, TEC
- Profesor: Ing. Joss Pecou Johnson

## Integrantes

- Rashely González Thompson
- Yeinery Durán Bastos
- Maykel Poveda Paniagua

## Aplicación desplegada

[https://maykel-poveda-paniagua.github.io/Proyecto1_Ruteo_PlanificacionDeCargas/](https://maykel-poveda-paniagua.github.io/Batalla_Naval_Probabilistica/)

## Descripción

Aplicación web hecha con React del clásico juego de **Batalla Naval** (Battleship), donde el jugador coloca su flota en un tablero de 10x10 y compite por turnos contra un agente basado en simulaciones probabilísticas (Monte Carlo) para localizar y hundir los barcos enemigos con ayuda de un mapa de calor.

## Algoritmo y enfoque

La lógica probabilística evalúa configuraciones válidas de la flota según el estado conocido del tablero (casillas sin explorar, agua, impactos y barcos hundidos):

1. **Simulación de configuraciones:** genera y filtra ubicaciones posibles para los barcos restantes respetando los límites del tablero, la no superposición y la información ya revelada.
2. **Mapa de calor y recomendación:** acumula la frecuencia de cada casilla en configuraciones válidas para estimar probabilidades, colorear el tablero enemigo y destacar la casilla recomendada para atacar.

El detalle matemático, el análisis de complejidad y los resultados experimentales están en el documento externo.

## Cómo usar la interfaz

1. Avanza desde la introducción narrativa (o sáltala) hacia la **Fase de Despliegue**.
2. Arrastra, gira o genera aleatoriamente tus barcos en tu tablero y presiona **¡INICIAR BATALLA!**.
3. En la barra superior selecciona la **cantidad de simulaciones** (100, 1,000, 5,000 o 10,000) o usa **Reiniciar** cuando la partida esté activa.
4. Durante el combate:
   - **Tablero "Tu Flota":** muestra tus barcos, los impactos recibidos y los ataques del agente IA.
   - **Tablero "Aguas Enemigas":** muestra el estado de tus disparos, el mapa de calor de probabilidades y la casilla recomendada.
   - **Panel de proceso:** muestra los pasos del cálculo del turno, configuraciones válidas, probabilidad máxima, celda recomendada, siguiente acción y tiempo en milisegundos.
   - **Panel de estadísticas:** compara disparos, impactos/agua, hundidos/restantes, precisión de ambos bandos, seguimiento de recomendaciones de la IA y tiempo del último cálculo del agente.
   - **Panel de historial:** detalla el historial por turno del jugador (incluyendo si siguió la recomendación de la IA) y del agente IA.

## Flujo de trabajo

1. La rama **main** guarda el código estable.
2. La rama **dev** es la de integración donde se consolidan y prueban los cambios.
3. Cada funcionalidad o mejora se trabaja en su propia rama creada a partir de **dev** (por ejemplo, `feat/interfaz-juego-jugabilidad` o `docs/documentación-interna`).
4. Los cambios se integran a **dev** mediante Pull Request revisado por el equipo, y luego a **main** cuando la versión está lista.
