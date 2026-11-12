<template>
  <div class="results-screen">
    <div class="game-over-box">
      <img :src="iconUrl" alt="Game Over" class="result-icon" />
      <h1>FIN DEL JUEGO</h1>
      
      <div class="main-score">
        <p>PUNTUACIÓN FINAL</p>
        <h2>{{ stats.score }}</h2>
      </div>

      <div class="stats-grid">
        <div class="stat-item"><span class="stat-label">WPM</span><span class="stat-value">{{ stats.wpm }}</span></div>
        <div class="stat-item"><span class="stat-label">PRECISIÓN</span><span class="stat-value">{{ Math.round(stats.accuracy * 100) }}%</span></div>
        <div class="stat-item"><span class="stat-label">COMBO MÁX</span><span class="stat-value">x{{ stats.maxCombo }}</span></div>
        <div class="stat-item"><span class="stat-label">DESTRUIDOS</span><span class="stat-value">{{ stats.enemiesDestroyed }}</span></div>
      </div>

      <div v-if="!hasSaved" class="save-score-form">
        <input 
          v-model="playerName" 
          type="text" 
          placeholder="TU NOMBRE (MÁX 10)" 
          maxlength="10"
          @keyup.enter="saveScore"
        />
        <button @click="saveScore" :disabled="!playerName.trim()">GUARDAR</button>
      </div>
      <p v-else class="saved-msg">RÉCORD GUARDADO</p>

      <button class="restart-btn" @click="goToMenu">VOLVER AL MENÚ</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import iconUrl from '../assets/icon.png'
import { soundManager } from '../game/sound.js'

const props = defineProps({ stats: Object })
const emit = defineEmits(['restart'])

const playerName = ref('')
const hasSaved = ref(false)

function saveScore() {
  if (!playerName.value.trim() || hasSaved.value) return;
  soundManager.playClick();
  
  const saved = JSON.parse(localStorage.getItem('typeRushScores') || '[]')
  saved.push({ 
    name: playerName.value.trim().toUpperCase(), 
    score: props.stats.score, 
    wpm: props.stats.wpm 
  })
  saved.sort((a, b) => b.score - a.score)
  localStorage.setItem('typeRushScores', JSON.stringify(saved.slice(0, 5)))
  
  hasSaved.value = true
}

function goToMenu() {
  soundManager.playClick();
  emit('restart');
}
</script>

<style scoped>
.results-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #0A0015; background-image: radial-gradient(circle at 50% 50%, #3A0066 0%, #0A0015 70%); color: #FFFFFF; }
.game-over-box { background: rgba(58, 0, 102, 0.6); border: 2px solid #FF00FF; box-shadow: 0 0 30px rgba(255, 0, 255, 0.3); padding: 2rem; border-radius: 16px; text-align: center; max-width: 90%; width: 500px; }
.result-icon { width: 80px; height: 80px; margin-bottom: 1rem; filter: drop-shadow(0 0 10px rgba(255, 0, 255, 0.5)); }
h1 { color: #FFFFFF; font-size: 2rem; letter-spacing: 2px; margin-top: 0; margin-bottom: 1.5rem; text-shadow: 0 0 10px #FF00FF; }
.main-score { margin-bottom: 2rem; }
.main-score p { color: #D8B4FF; letter-spacing: 2px; font-size: 0.8rem; margin-bottom: 0.5rem; }
.main-score h2 { font-size: 4rem; color: #FF00FF; margin: 0; line-height: 1; text-shadow: 0 0 15px rgba(255,0,255,0.5); }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
.stat-item { display: flex; flex-direction: column; background: rgba(10, 0, 21, 0.5); padding: 0.8rem; border-radius: 8px; border: 1px solid #8A00FF; }
.stat-label { color: #D8B4FF; font-size: 0.7rem; letter-spacing: 1px; margin-bottom: 0.3rem; }
.stat-value { color: #FFFFFF; font-size: 1.3rem; font-weight: bold; font-family: monospace; }
.save-score-form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.save-score-form input { flex: 1; background: #0A0015; border: 1px solid #8A00FF; color: #FFFFFF; padding: 0.8rem; border-radius: 8px; font-family: monospace; text-transform: uppercase; outline: none; }
.save-score-form input:focus { border-color: #FF00FF; box-shadow: 0 0 10px rgba(255,0,255,0.3); }
.save-score-form button { background: #FF00FF; color: #0A0015; border: none; padding: 0.8rem 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
.save-score-form button:hover:not(:disabled) { background: #D8B4FF; }
.save-score-form button:disabled { opacity: 0.3; cursor: not-allowed; }
.saved-msg { color: #FF00FF; font-weight: bold; margin-bottom: 1.5rem; text-shadow: 0 0 8px rgba(255,0,255,0.5); }
.restart-btn { background: transparent; color: #D8B4FF; border: 2px solid #8A00FF; padding: 1rem 3rem; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: all 0.3s; }
.restart-btn:hover { background: #8A00FF; color: #FFFFFF; box-shadow: 0 0 20px #8A00FF; }
</style>