<template>
  <div class="menu-container">
    <div class="bg-stars"></div>

    <div v-if="currentView === 'main'" class="view-container">
      <header class="menu-header centered">
        <div class="logo-area">
          <img :src="iconUrl" alt="TYPE RUSH" class="main-logo" />
          <h1>TYPE RUSH</h1>
        </div>
        <p class="subtitle">PON A PRUEBA TU VELOCIDAD</p>
      </header>

      <main class="menu-main">
        <button class="menu-btn primary" @click="playAndGo('play')">JUGAR AHORA</button>
        <button class="menu-btn" @click="playAndGo(null, true)">OPCIONES</button>
        <button class="menu-btn" @click="playAndGo('leaderboard')">MEJORES PUNTAJES</button>
      </main>
    </div>

    <div v-if="currentView === 'play'" class="view-container">
      <h2 class="view-title">SELECCIONA DIFICULTAD</h2>
      <div class="difficulty-options">
        <button class="menu-btn" @click="startGame('EASY')">FÁCIL</button>
        <button class="menu-btn primary" @click="startGame('NORMAL')">NORMAL</button>
        <button class="menu-btn danger" @click="startGame('HARD')">DIFÍCIL</button>
      </div>
      <button class="back-btn" @click="playAndGo('main')">VOLVER AL MENÚ</button>
    </div>

    <div v-if="currentView === 'leaderboard'" class="view-container">
      <h2 class="view-title">MEJORES PUNTAJES</h2>
      <ul class="lb-list">
        <li v-for="(entry, index) in topScores" :key="index" :class="{ 'you-row': index === 0 }">
          <span class="rank">0{{ index + 1 }}</span> 
          <span class="name">{{ entry.name || '---' }}</span> 
          <span class="wpm">{{ entry.score ? entry.score + ' PTS' : '--- PTS' }}</span>
        </li>
      </ul>
      <button class="back-btn" @click="playAndGo('main')">VOLVER AL MENÚ</button>
    </div>

    <!-- Modal de Opciones con DOS barras -->
    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="settings-modal">
        <h3>OPCIONES</h3>
        
        <div class="setting-item">
          <label>Volumen del Juego (Láseres y Daño)</label>
          <input 
            type="range" min="0" max="1" step="0.1" 
            v-model="gameVolume" 
            @change="soundManager.playShoot()" 
          />
          <span class="vol-val">{{ Math.round(gameVolume * 100) }}%</span>
        </div>

        <div class="setting-item">
          <label>Volumen del Menú (Clics)</label>
          <input 
            type="range" min="0" max="1" step="0.1" 
            v-model="uiVolume" 
            @change="soundManager.playClick()" 
          />
          <span class="vol-val">{{ Math.round(uiVolume * 100) }}%</span>
        </div>

        <button class="close-btn" @click="showSettings = false; soundManager.playClick()">CERRAR</button>
      </div>
    </div>

    <footer class="menu-footer">
      <p>TYPE RUSH VERSIÓN 1.0</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import iconUrl from '../assets/icon.png'
import { soundManager } from '../game/sound.js'

const emit = defineEmits(['startGame'])
const currentView = ref('main')
const topScores = ref([])
const showSettings = ref(false)

// Variables de volumen separadas
const gameVolume = ref(parseFloat(localStorage.getItem('typeRushGameVol') || '0.5'))
const uiVolume = ref(parseFloat(localStorage.getItem('typeRushUiVol') || '0.5'))

// Guardar y actualizar sonidos en tiempo real
watch(gameVolume, (newVal) => {
  localStorage.setItem('typeRushGameVol', newVal)
  soundManager.setGameVolume(newVal)
})

watch(uiVolume, (newVal) => {
  localStorage.setItem('typeRushUiVol', newVal)
  soundManager.setUiVolume(newVal)
})

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('typeRushScores') || '[]')
  const padded = [...saved, ...Array(5).fill({ name: '---', score: 0 })].slice(0, 5)
  topScores.value = padded
})

function playAndGo(view, settings = false) {
  soundManager.playClick()
  if (view) currentView.value = view
  if (settings) showSettings.value = true
}

function startGame(diff) {
  soundManager.playClick()
  // Le pasamos el gameVolume al juego
  emit('startGame', diff, gameVolume.value)
}
</script>

<style scoped>
/* Los estilos quedan exactamente iguales a los del mensaje anterior */
.menu-container { min-height: 100vh; display: flex; flex-direction: column; background: #0A0015; background-image: radial-gradient(circle at 50% 50%, #3A0066 0%, #0A0015 70%); color: #FFFFFF; font-family: 'Inter', system-ui, sans-serif; position: relative; overflow: hidden; }
.bg-stars { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(#D8B4FF 1px, transparent 1px); background-size: 40px 40px; opacity: 0.05; animation: moveStars 10s linear infinite; pointer-events: none; }
@keyframes moveStars { from { background-position: 0 0; } to { background-position: 0 40px; } }
.view-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; padding: 2rem; width: 100%; max-width: 600px; margin: 0 auto; }
.menu-header.centered { text-align: center; margin-bottom: 3rem; }
.logo-area { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem; }
.main-logo { width: 120px; height: 120px; filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.4)); }
.menu-header h1 { font-size: 3rem; letter-spacing: 4px; margin: 0; text-shadow: 0 0 15px rgba(255, 0, 255, 0.6); }
.subtitle { color: #FF00FF; font-size: 1rem; font-weight: bold; letter-spacing: 3px; text-shadow: 0 0 8px #FF00FF; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
.menu-main { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 350px; }
.menu-btn { background: rgba(58, 0, 102, 0.6); backdrop-filter: blur(10px); border: 2px solid #8A00FF; color: #D8B4FF; padding: 1.2rem; border-radius: 12px; font-size: 1.2rem; font-weight: bold; letter-spacing: 1px; cursor: pointer; transition: all 0.3s; }
.menu-btn:hover { border-color: #FF00FF; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(255, 0, 255, 0.2); color: #FFFFFF; }
.menu-btn.primary { border-color: #FF00FF; color: #FFFFFF; box-shadow: 0 0 15px rgba(255, 0, 255, 0.2); }
.menu-btn.primary:hover { background: #FF00FF; color: #0A0015; box-shadow: 0 0 25px rgba(255, 0, 255, 0.6); }
.menu-btn.danger { border-color: #FF00FF; color: #FF00FF; }
.menu-btn.danger:hover { background: #FF00FF; color: #0A0015; }
.view-title { font-size: 2rem; margin-bottom: 2rem; letter-spacing: 2px; text-align: center; color: #FFFFFF; text-shadow: 0 0 10px rgba(138, 0, 255, 0.5); }
.difficulty-options { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 300px; }
.back-btn { margin-top: 3rem; background: none; border: none; color: #D8B4FF; font-size: 1rem; cursor: pointer; transition: color 0.3s; }
.back-btn:hover { color: #FF00FF; text-shadow: 0 0 8px #FF00FF; }
.lb-list { list-style: none; padding: 0; width: 100%; max-width: 400px; background: rgba(58, 0, 102, 0.4); border-radius: 12px; border: 1px solid #8A00FF; }
.lb-list li { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid rgba(138, 0, 255, 0.3); font-family: monospace; font-size: 1.1rem; }
.lb-list li:last-child { border-bottom: none; }
.lb-list .rank { color: #FF00FF; font-weight: bold; }
.lb-list .name { flex: 1; margin-left: 1rem; color: #FFFFFF; }
.lb-list .wpm { color: #D8B4FF; }
.you-row .name { color: #FF00FF; font-weight: bold; text-shadow: 0 0 5px #FF00FF; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10, 0, 21, 0.85); display: flex; align-items: center; justify-content: center; z-index: 100; }
.settings-modal { background: #3A0066; border: 2px solid #FF00FF; padding: 2rem; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: 0 0 30px rgba(255, 0, 255, 0.3); }
.settings-modal h3 { margin-top: 0; color: #FFFFFF; letter-spacing: 2px; text-shadow: 0 0 8px #FF00FF; }
.setting-item { margin: 1.5rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
.setting-item label { font-weight: bold; color: #D8B4FF; font-size: 0.9rem; }
input[type=range] { width: 100%; accent-color: #FF00FF; }
.vol-val { color: #FF00FF; text-align: right; font-family: monospace; font-weight: bold; }
.close-btn { width: 100%; background: #FF00FF; color: #0A0015; border: none; padding: 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.3s; margin-top: 1rem;}
.close-btn:hover { background: #D8B4FF; }
.menu-footer { text-align: center; color: #8A00FF; font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 1rem; z-index: 1; }
</style>