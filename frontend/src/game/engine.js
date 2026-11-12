import { getRandomWord, getBossWord } from './words.js';
import { LaserProjectile, Particle } from './effects.js';
import { soundManager } from './sound.js';

export class GameEngine {
  constructor(canvas, difficulty = 'NORMAL', volume = 0.5) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;

    this.isRunning = false;
    this.isPaused = false;
    this.animationId = null;
    this.difficulty = difficulty;
    this.timeElapsed = 0;

    soundManager.setGameVolume(volume);

    this.enemies = [];
    this.lasers = [];
    this.particles = [];
    this.spawnTimer = 0;

    this.currentEnemy = null;
    this.currentTypedText = "";

    this.score = 0;
    this.lives = 3;
    this.maxLives = 5;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctLetters = 0;
    this.totalTypedLetters = 0;
    this.destroyedEnemies = 0;
    this.wordsDestroyed = 0;

    this.wave = 1;
    this.enemiesInWave = 0;
    this.enemiesPerWave = 8;
    this.isBossWave = false;
    this.bossSpawned = false;
    this.bossEnemy = null;

    this.shakeIntensity = 0;

    this.lastTime = 0;
    this.onGameOver = null;
    this.loop = this.loop.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    window.addEventListener('keydown', this.handleKeyDown);
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    window.dispatchEvent(new CustomEvent('game-pause', { detail: this.isPaused }));
    soundManager.playClick();
  }

  checkIfBossWave() {
    if (this.difficulty === 'EASY') return this.wave % 3 === 0;
    if (this.difficulty === 'NORMAL') return this.wave % 5 === 0;
    return this.wave % 7 === 0;
  }

  getCurrentDifficulty() {
    const mult = this.difficulty === 'HARD' ? 1.3 : (this.difficulty === 'EASY' ? 0.7 : 1.0);
    const baseSpeed = 40 + (this.wave * 10);
    const spawnRate = Math.max(0.5, 1.8 - (this.wave * 0.1));
    return { speed: baseSpeed * mult, spawnRate: spawnRate / mult };
  }

  spawnEnemy() {
    if (this.isBossWave && !this.bossSpawned) { this.spawnBoss(); return; }
    if (this.isBossWave) return;

    const word = getRandomWord();
    const boxWidth = Math.max(100, word.length * 20 + 40);
    const diff = this.getCurrentDifficulty();

    this.enemies.push({
      x: Math.random() * (this.width - boxWidth),
      y: -60, width: boxWidth, height: 60, speed: diff.speed,
      text: word, visualTypedText: "", flashTimer: 0, isDestroyed: false, isBoss: false
    });
    this.enemiesInWave++;
  }

  spawnBoss() {
    const word = getBossWord();
    const boxWidth = Math.max(300, word.length * 18 + 60);
    const boss = {
      x: (this.width / 2) - (boxWidth / 2),
      y: -100, width: boxWidth, height: 80,
      speed: 15,
      text: word, visualTypedText: "", flashTimer: 0, isDestroyed: false, isBoss: true
    };
    this.enemies.push(boss);
    this.bossEnemy = boss;
    this.bossSpawned = true;
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.togglePause();
      return;
    }

    if (e.key.length > 1 || !this.isRunning || this.isPaused) return;

    const key = e.key.toUpperCase();
    this.totalTypedLetters++;

    if (this.currentEnemy) {
      const expected = this.currentEnemy.text[this.currentTypedText.length];
      if (key === expected) {
        this.correctLetters++;
        const idx = this.currentTypedText.length;
        this.currentTypedText += key;
        this.lasers.push(new LaserProjectile(this.width / 2, this.height - 30, this.currentEnemy, idx));
        soundManager.playShoot();
      } else {
        this.combo = 0;
      }
      return;
    }

    const targets = this.enemies.filter(en => en.text.startsWith(key));
    if (targets.length > 0) {
      this.correctLetters++;
      const bossTarget = targets.find(t => t.isBoss);
      if (bossTarget) this.currentEnemy = bossTarget;
      else {
        targets.sort((a, b) => b.y - a.y);
        this.currentEnemy = targets[0];
      }
      this.currentTypedText = key;
      this.lasers.push(new LaserProjectile(this.width / 2, this.height - 30, this.currentEnemy, 0));
      soundManager.playShoot();
    } else {
      this.combo = 0;
    }
  }

  destroyEnemy(enemy) {
    if (enemy.isDestroyed) return;
    enemy.isDestroyed = true;

    if (enemy.isBoss) { soundManager.playBossDeath(); this.bossEnemy = null; }
    else { soundManager.playDestroy(); }

    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height / 2;
    for (let i = 0; i < (enemy.isBoss ? 40 : 12); i++) {
      const color = enemy.isBoss ? '255, 0, 255' : '138, 0, 255';
      this.particles.push(new Particle(cx, cy, color));
    }

    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const points = enemy.isBoss ? (enemy.text.length * 50) : (enemy.text.length * 10);
    this.score += points * Math.min(5, 1 + Math.floor(this.combo / 3));
    this.destroyedEnemies++;
    this.wordsDestroyed++;

    if (this.wordsDestroyed % 5 === 0 && this.lives < this.maxLives) {
      this.lives++;
      for (let i = 0; i < 10; i++) this.particles.push(new Particle(this.width / 2, this.height - 30, '255, 255, 255'));
    }

    this.enemies = this.enemies.filter(en => en !== enemy);
    if (this.currentEnemy === enemy) { this.currentEnemy = null; this.currentTypedText = ""; }

    if (enemy.isBoss) {
      this.wave++;
      this.enemiesPerWave += 2;
      this.enemiesInWave = 0;
      this.isBossWave = this.checkIfBossWave();
      this.bossSpawned = false;
      this.timeElapsed = 0;
    } else if (this.enemiesInWave >= this.enemiesPerWave) {
      this.isBossWave = true;
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (dt < 1 && !this.isPaused) {
      this.timeElapsed += dt;
      this.update(dt);
    }

    this.draw();
    this.animationId = requestAnimationFrame(this.loop);
  }

  update(dt) {
    const diff = this.getCurrentDifficulty();
    this.spawnTimer += dt;

    const canSpawn = this.isBossWave ? !this.bossSpawned : this.enemiesInWave < this.enemiesPerWave;
    if (this.spawnTimer >= diff.spawnRate && canSpawn) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.speed = enemy.isBoss ? 15 + (this.wave * 2) : diff.speed;
      enemy.y += enemy.speed * dt;
      if (enemy.flashTimer > 0) enemy.flashTimer -= dt;

      const redLineY = this.height - 10;
      if (enemy.y + enemy.height >= redLineY) {
        enemy.isDestroyed = true;
        soundManager.playDamage();

        for (let j = 0; j < 15; j++) this.particles.push(new Particle(enemy.x + enemy.width / 2, redLineY, '255, 0, 255'));

        if (enemy === this.currentEnemy) { this.currentEnemy = null; this.currentTypedText = ""; }

        this.enemies.splice(i, 1);
        this.lives--;
        this.combo = 0;

        if (enemy.isBoss) { this.bossEnemy = null; this.bossSpawned = false; }

        this.shakeIntensity = 15;
        window.dispatchEvent(new CustomEvent('player-damage'));

        if (this.lives <= 0) {
          this.stop();
          if (this.onGameOver) {
            const wpm = Math.round((this.correctLetters / 5) / (this.timeElapsed / 60)) || 0;
            const accuracy = this.totalTypedLetters > 0 ? (this.correctLetters / this.totalTypedLetters) : 0;
            this.onGameOver({ score: this.score, wpm, accuracy, maxCombo: this.maxCombo, enemiesDestroyed: this.destroyedEnemies });
          }
          return;
        }
      }
    }

    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.update(dt);
      if (l.hit) {
        if (!l.enemy.isDestroyed) {
          l.enemy.visualTypedText += l.enemy.text[l.letterIndex];
          l.enemy.flashTimer = 0.1;
          if (l.enemy.visualTypedText === l.enemy.text) this.destroyEnemy(l.enemy);
        }
        this.lasers.splice(i, 1);
      } else if (l.isDead) {
        this.lasers.splice(i, 1);
      }
    }

    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => p.life > 0);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.shakeIntensity > 0) {
      this.ctx.save();
      this.ctx.translate((Math.random() - 0.5) * this.shakeIntensity, (Math.random() - 0.5) * this.shakeIntensity);
      this.shakeIntensity *= 0.9;
      if (this.shakeIntensity < 0.5) this.shakeIntensity = 0;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height - 5);
    this.ctx.lineTo(this.width, this.height - 5);
    this.ctx.strokeStyle = '#FF00FF';
    this.ctx.lineWidth = 6;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#FF00FF';
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    for (const enemy of this.enemies) {
      if (enemy.isBoss) {
        this.ctx.fillStyle = 'rgba(58, 0, 102, 0.9)';
        this.ctx.strokeStyle = '#FF00FF';
        this.ctx.lineWidth = 4;
      } else if (enemy.flashTimer > 0) {
        this.ctx.fillStyle = '#3A0066';
        this.ctx.strokeStyle = '#FF00FF';
        this.ctx.lineWidth = 3;
      } else {
        this.ctx.fillStyle = '#0A0015';
        this.ctx.strokeStyle = '#8A00FF';
        this.ctx.lineWidth = 2;
      }

      this.ctx.beginPath();
      this.ctx.roundRect(enemy.x, enemy.y, enemy.width, enemy.height, 8);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.font = 'bold 20px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const cx = enemy.x + enemy.width / 2;
      const cy = enemy.y + enemy.height / 2;

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(enemy.text, cx, cy);

      if (enemy.visualTypedText.length > 0) {
        const tw = this.ctx.measureText(enemy.text).width;
        this.ctx.fillStyle = '#FF00FF';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(enemy.visualTypedText, cx - (tw / 2), cy);
      }
    }

    this.lasers.forEach(l => l.draw(this.ctx));
    this.particles.forEach(p => p.draw(this.ctx));

    this.drawPlayerShip();

    if (this.shakeIntensity > 0) this.ctx.restore();

    this.drawHUD();
  }

  drawPlayerShip() {
    const sx = this.width / 2;
    const sy = this.height - 30;
    this.ctx.beginPath();
    this.ctx.moveTo(sx, sy - 15);
    this.ctx.lineTo(sx - 12, sy + 10);
    this.ctx.lineTo(sx + 12, sy + 10);
    this.ctx.closePath();
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#FF00FF';
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  drawHUD() {
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.font = 'bold 24px monospace';

    this.ctx.fillStyle = '#FF00FF';
    this.ctx.fillText(`PUNTOS: ${this.score}`, 20, 20);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`VIDAS: ${this.lives}`, 20, 60);

    this.ctx.fillStyle = '#D8B4FF';
    this.ctx.font = 'bold 18px monospace';
    const waveText = this.isBossWave ? `OLEADA ${this.wave} - JEFE` : `OLEADA ${this.wave} (${this.enemiesInWave}/${this.enemiesPerWave})`;
    this.ctx.fillText(waveText, 20, 100);

    if (this.combo > 1) {
      this.ctx.fillStyle = '#8A00FF';
      this.ctx.font = 'bold 18px monospace';
      this.ctx.fillText(`COMBO x${Math.min(5, 1 + Math.floor(this.combo / 3))}`, 20, 130);
    }
  }
}