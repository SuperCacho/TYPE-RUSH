<template>
  <div class="game-wrapper">
    <canvas ref="canvasRef" class="game-canvas"></canvas>

    <!-- Menú de Pausa -->
    <div v-if="isPaused" class="overlay">
      <div class="pause-menu">
        <h2>PAUSA</h2>
        <button @click="resumeGame" class="menu-btn primary">
          REGRESAR AL JUEGO
        </button>
        <button @click="tryExit" class="menu-btn danger">
          VOLVER AL MENÚ PRINCIPAL
        </button>
      </div>

      <!-- Confirmación de Salida -->
      <div v-if="showExitConfirm" class="overlay confirm-overlay">
        <div class="confirm-box">
          <h3>¿ESTÁS SEGURO?</h3>
          <p>La partida actual no se guardará.</p>
          <div class="confirm-buttons">
            <button @click="confirmExit" class="menu-btn danger">SÍ, SALIR</button>
            <button @click="showExitConfirm = false" class="menu-btn">NO, SEGUIR</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { GameEngine } from '../game/engine.js'
import { soundManager } from '../game/sound.js'

const props = defineProps({ difficulty: String, volume: Number })
const emit = defineEmits(['gameOver', 'exitGame'])

const canvasRef = ref(null)
let engine = null

const isPaused = ref(false)
const showExitConfirm = ref(false)

const handleDamageFlash = () => {
  const overlay = document.getElementById('damage-overlay');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 150);
  }
}

const handlePauseEvent = (e) => {
  isPaused.value = e.detail;
  if (!isPaused.value) showExitConfirm.value = false;
}

onMounted(() => {
  if (canvasRef.value) {
    engine = new GameEngine(canvasRef.value, props.difficulty, props.volume)
    engine.onGameOver = (stats) => emit('gameOver', stats)
    engine.start()
    window.addEventListener('player-damage', handleDamageFlash)
    window.addEventListener('game-pause', handlePauseEvent)
  }
})

onUnmounted(() => {
  if (engine) engine.stop()
  window.removeEventListener('player-damage', handleDamageFlash)
  window.removeEventListener('game-pause', handlePauseEvent)
})

function resumeGame() {
  soundManager.playClick();
  engine.togglePause();
}

function tryExit() {
  soundManager.playClick();
  showExitConfirm.value = true;
}

function confirmExit() {
  soundManager.playClick();
  emit('exitGame');
}
</script>

<style scoped>
.game-wrapper { width: 100vw; height: 100vh; position: relative; }
.game-canvas { display: block; width: 100%; height: 100%; }

.overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 0, 21, 0.7); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 10;
}
.pause-menu {
  background: #111E33; border: 2px solid #38BDF8;
  padding: 3rem; border-radius: 16px; text-align: center;
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.3);
  display: flex; flex-direction: column; gap: 1.5rem;
}
.pause-menu h2 { color: #FFFFFF; letter-spacing: 4px; margin-top: 0; text-shadow: 0 0 10px #38BDF8; }
.pause-menu button { padding: 1rem 2rem; font-size: 1.1rem; cursor: pointer; border-radius: 8px; font-weight: bold; transition: all 0.3s; }

.menu-btn { background: rgba(58, 0, 102, 0.6); border: 2px solid #8A00FF; color: #D8B4FF; }
.menu-btn:hover { border-color: #FF00FF; color: #FFFFFF; box-shadow: 0 0 15px rgba(255, 0, 255, 0.4); }
.menu-btn.primary { border-color: #FF00FF; color: #FFFFFF; }
.menu-btn.primary:hover { background: #FF00FF; color: #0A0015; }
.menu-btn.danger { border-color: #FB7185; color: #FB7185; }
.menu-btn.danger:hover { background: #FB7185; color: #0A0015; }

.confirm-overlay { background: rgba(10, 0, 21, 0.85); z-index: 20; }
.confirm-box {
  background: #2D112B; border: 2px solid #FB7185;
  padding: 2rem; border-radius: 16px; text-align: center;
  box-shadow: 0 0 30px rgba(251, 113, 133, 0.3);
}
.confirm-box h3 { color: #FB7185; margin-top: 0; font-size: 1.5rem; margin-bottom: 1rem; }
.confirm-box p { color: #D8B4FF; margin-bottom: 2rem; }
.confirm-buttons { display: flex; gap: 1rem; justify-content: center; }
.confirm-buttons button { padding: 0.8rem 1.5rem; }
</style>