export class LaserProjectile {
    constructor(startX, startY, enemy, letterIndex) {
        this.startX = startX;
        this.startY = startY;
        this.enemy = enemy;
        this.letterIndex = letterIndex;
        this.progress = 0;
        this.speed = 12;
        this.isDead = false;
        this.hit = false;
    }

    update(dt) {
        if (this.hit || this.enemy.isDestroyed) { this.isDead = true; return; }
        this.progress += dt * this.speed;
        if (this.progress >= 1) { this.progress = 1; this.hit = true; this.isDead = true; }
    }

    draw(ctx) {
        if (this.isDead || this.enemy.isDestroyed) return;
        const textWidth = ctx.measureText(this.enemy.text).width;
        const startX = this.enemy.x + (this.enemy.width / 2) - (textWidth / 2);
        const targetX = startX + (this.letterIndex * 12) + 6;
        const targetY = this.enemy.y + this.enemy.height / 2;
        const currX = this.startX + (targetX - this.startX) * this.progress;
        const currY = this.startY + (targetY - this.startY) * this.progress;

        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(216, 180, 255, 0.6)';
        ctx.lineWidth = 6;
        ctx.stroke();
    }
}

export class Particle {
    constructor(x, y, color = '255, 0, 255') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 250;
        this.vy = (Math.random() - 0.5) * 250;
        this.life = 0.4;
        this.size = Math.random() * 4 + 2;
        this.color = color;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.fillStyle = `rgba(${this.color}, ${this.life / 0.4})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}