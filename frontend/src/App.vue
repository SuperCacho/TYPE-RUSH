<template>
  <div id="app">
    <div id="damage-overlay" class="damage-flash"></div>

    <MainMenu 
      v-if="currentScreen === 'menu'" 
      @startGame="startGame" 
    />
    <GameCanvas 
      v-else-if="currentScreen === 'game'" 
      :difficulty="currentDifficulty"
      :volume="currentVolume"
      @gameOver="handleGameOver" 
      @exitGame="currentScreen = 'menu'"
    />
    <Results 
      v-else-if="currentScreen === 'results'" 
      :stats="finalStats"
      @restart="currentScreen = 'menu'" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MainMenu from './components/MainMenu.vue'
import GameCanvas from './components/GameCanvas.vue'
import Results from './components/Results.vue'

const currentScreen = ref('menu')
const currentDifficulty = ref('NORMAL')
const currentVolume = ref(0.5)
const finalStats = ref({})

function startGame(diff, vol) {
  currentDifficulty.value = diff
  currentVolume.value = vol
  currentScreen.value = 'game'
}
function handleGameOver(stats) {
  finalStats.value = stats
  currentScreen.value = 'results'
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0A0015; color: #FFFFFF; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }

.damage-flash {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(255, 0, 255, 0.4); pointer-events: none; z-index: 1000;
  opacity: 0; transition: opacity 0.15s ease-out;
}
.damage-flash.active { opacity: 1; }
</style>