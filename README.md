#  TYPE RUSH: Typing Invasion

**TYPE RUSH** es un videojuego arcade de mecanografía 2D inspirado en *ZType*. El objetivo es simple: destruir cuadrados con palabras que caen desde la parte superior de la pantalla antes de que crucen la línea de peligro. 

Desarrollado como proyecto académico, el juego combina la adrenalina de los arcades clásicos con un diseño visual moderno estilo Cyberpunk/Neón.

---

##  Características Principales

*   **Mecánica de Tipeo Fluida:** Dispará láseres instantáneos a los bloques escribiendo sus palabras. Si te equivocás de letra, perdés el combo.
*   **Sistema de Oleadas Infinitas:** La dificultad escala de forma progresiva. A mayor cantidad de oleadas superadas, mayor es la velocidad de caída y la cantidad de enemigos.
*   **Batallas contra Jefes:** Cada cierta cantidad de oleadas (dependiendo de la dificultad) aparece un Jefe con palabras extremadamente largas y difíciles (ej: *Electroencefalografista*).
*   **Sistema de Vidas y Recompensas:** Empezás con 3 vidas. Cada 5 palabras destruidas recuperás 1 vida (hasta un máximo de 5).
*   **Efectos Visuales y de Sonido:** Partículas al destruir enemigos, temblor de pantalla al recibir daño (Screen Shake), y efectos de sonido sintetizados en tiempo real (Web Audio API) con volumen configurable.
*   **Ranking Local:** Los mejores 5 puntajes se guardan en tu navegador (LocalStorage) para que compitas contra vos mismo.

---

##  Manual de Usuario (Cómo Jugar)

### Controles
*   **Teclado:** Escribí la palabra del enemigo para destruirlo.
*   **Escape (ESC):** Pausa el juego (permite reanudar o salir al menú principal).

### Reglas del Juego
1. Los bloques caen desde arriba. Si tocan la **línea roja/rosa neón** de abajo, perdés 1 vida y la pantalla temblará.
2. Al presionar la primera letra de una palabra, el juego selecciona automáticamente el enemigo que esté más cerca del fondo. Una vez que empezás a escribir, estás **comprometido** a terminar esa palabra (si tocás otra tecla, rompés el combo).
3. **Combos:** Destruir enemigos seguidos sin fallar aumenta tu multiplicador de puntos (hasta x5).
4. **Jefes:** Los jefes son más lentos, pero sus palabras son un desafío. ¡Tienen un sonido de explosión único al morir!

---

##  Tecnologías Utilizadas

*   **Frontend:** Vue 3 (Composition API), Vite.
*   **Gráficos:** HTML5 Canvas (Renderizado a 60 FPS mediante `requestAnimationFrame`).
*   **Escritorio:** Electron (Empaquetado con `electron-builder`).
*   **Audio:** Web Audio API (Síntesis de sonido, sin archivos externos).

---

##  Descarga e Instalación

No necesitás instalar Node.js ni nada por el estilo. 
1. Andá a la sección **[Releases](../../releases)** de este repositorio (a la derecha en GitHub).
2. Descargá el archivo **`TYPE RUSH Setup 1.0.0.exe`**.
3. Ejecutalo, instalalo y ¡a jugar!

---

##  Desarrollo (Para programadores)

Si querés clonar el código y correrlo en modo desarrollo:

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/TYPE-RUSH.git

# Entrar a la carpeta
cd TYPE-RUSH

# Instalar dependencias raíz (Electron y herramientas)
npm install

# Instalar dependencias del frontend (Vue)
npm --prefix frontend install

# Correr en modo desarrollo
npm run dev

# Crear el instalador (.exe)
npm run dist
