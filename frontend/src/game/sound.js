class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Carga los volúmenes guardados o usa 0.5 por defecto
        this.uiVolume = parseFloat(localStorage.getItem('typeRushUiVol') || '0.5');
        this.gameVolume = parseFloat(localStorage.getItem('typeRushGameVol') || '0.5');
    }

    setUiVolume(val) {
        this.uiVolume = Math.max(0, Math.min(1, val));
    }

    setGameVolume(val) {
        this.gameVolume = Math.max(0, Math.min(1, val));
    }

    playTone(startFreq, endFreq, type, duration, volMultiplier = 1, channel = 'game') {
        // Selecciona el volumen según el canal
        const currentVol = channel === 'ui' ? this.uiVolume : this.gameVolume;
        if (currentVol <= 0) return;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        gainNode.gain.setValueAtTime(currentVol * volMultiplier, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // Sonidos del Menú (channel: 'ui')
    playClick() { this.playTone(800, 600, 'square', 0.08, 0.4, 'ui'); }

    // Sonidos del Juego (channel: 'game')
    playShoot() { this.playTone(800, 300, 'sine', 0.08, 0.3, 'game'); }
    playDamage() { this.playTone(200, 50, 'sawtooth', 0.4, 0.8, 'game'); }
    playDestroy() { this.playTone(600, 200, 'triangle', 0.15, 0.6, 'game'); }

    playBossDeath() {
        this.playTone(400, 100, 'sawtooth', 1.0, 0.8, 'game');
        this.playTone(600, 150, 'square', 0.8, 0.5, 'game');
        setTimeout(() => { this.playTone(150, 30, 'sawtooth', 1.2, 1.0, 'game'); }, 100);
    }
}

export const soundManager = new SoundManager();