/**
 * Neon Thermometer & Particle Canvas Engine
 * Handles dynamic mercury fill, radial gauge rendering, and temperature-reactive particles
 */
class NeonVisualizer {
    constructor() {
        this.currentCelsius = 25;
        this.targetCelsius = 25;
        this.minRange = -100;
        this.maxRange = 200;
        
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.lastState = 'pleasant';
        
        this.initCanvas();
        this.initThermometer();
    }

    initCanvas() {
        this.canvas = document.getElementById('ambientCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.spawnParticles();
        this.animate();
    }

    resize() {
        if (!this.canvas) return;
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    spawnParticles() {
        this.particles = [];
        const count = 45;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * (this.width || 800),
                y: Math.random() * (this.height || 600),
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                alpha: Math.random() * 0.6 + 0.2,
                decay: Math.random() * 0.005 + 0.002,
                type: 'ambient'
            });
        }
    }

    animate() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Determine particle theme based on current temperature
        const isFreezing = this.currentCelsius <= 0;
        const isExtremelyCold = this.currentCelsius <= -70;
        const isHot = this.currentCelsius >= 60;
        const isExtremeHeat = this.currentCelsius >= 300;

        let particleColor = 'rgba(0, 240, 255, '; // default cyan
        if (isFreezing) {
            particleColor = 'rgba(160, 230, 255, '; // frosty ice cyan/white
        } else if (isExtremeHeat) {
            particleColor = 'rgba(255, 60, 30, '; // fiery red
        } else if (isHot) {
            particleColor = 'rgba(255, 140, 0, '; // amber blaze
        } else if (this.currentCelsius > 20 && this.currentCelsius < 40) {
            particleColor = 'rgba(0, 255, 170, '; // neon emerald
        }

        // Render & Update particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Motion adjustments based on thermal state
            if (isFreezing) {
                p.vy += 0.02; // falling snow / ice crystals
                p.vx += (Math.random() - 0.5) * 0.1;
                if (p.vy > 1.5) p.vy = 1.5;
            } else if (isHot) {
                p.vy -= 0.04; // rising thermal convection bubbles/sparks
                p.vx += (Math.random() - 0.5) * 0.2;
                if (p.vy < -2.2) p.vy = -2.2;
            } else {
                p.vx += (Math.random() - 0.5) * 0.02;
                p.vy += (Math.random() - 0.5) * 0.02;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            // Draw particle with neon glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particleColor + p.alpha + ')';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = particleColor + '0.8)';
            this.ctx.fill();

            // Extra crystal lines for freezing
            if (isExtremelyCold && i % 3 === 0) {
                this.ctx.strokeStyle = particleColor + (p.alpha * 0.5) + ')';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x - 3, p.y);
                this.ctx.lineTo(p.x + 3, p.y);
                this.ctx.moveTo(p.x, p.y - 3);
                this.ctx.lineTo(p.x, p.y + 3);
                this.ctx.stroke();
            }
        }

        // Ambient cyber grid pulse line
        this.ctx.shadowBlur = 0;
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    initThermometer() {
        this.tubeMercury = document.getElementById('tubeMercury');
        this.tubeBulb = document.getElementById('tubeBulb');
        this.mercuryGlow = document.getElementById('mercuryGlow');
        this.gaugeArc = document.getElementById('gaugeArc');
        this.gaugeValueText = document.getElementById('gaugeValueText');
        this.gaugeStateText = document.getElementById('gaugeStateText');
    }

    /**
     * Updates visual elements according to Celsius value
     */
    update(celsius) {
        this.currentCelsius = celsius;
        
        // Calculate fill percentage:
        // Absolute Zero is -273.15, typical max visualization scale 200°C (custom dynamic scale)
        let normalized = (celsius - (-50)) / (150 - (-50)); // standard -50°C to 150°C range
        if (celsius < -50) {
            normalized = Math.max(0.02, (celsius - (-273.15)) / (50 - (-273.15)) * 0.25);
        } else if (celsius > 150) {
            normalized = Math.min(1.0, 0.75 + (celsius - 150) / 1000 * 0.25);
        }
        normalized = Math.max(0.03, Math.min(0.98, normalized));

        // Update Mercury Height
        if (this.tubeMercury) {
            const heightPercent = normalized * 100;
            this.tubeMercury.style.height = `${heightPercent}%`;
        }

        // Update Radial Gauge Arc (0 to 180 degrees or stroke-dashoffset)
        if (this.gaugeArc) {
            const circumference = 283; // 2 * PI * r (r=45)
            const strokeOffset = circumference - (normalized * circumference * 0.75); // 270deg arc
            this.gaugeArc.style.strokeDasharray = `${circumference}`;
            this.gaugeArc.style.strokeDashoffset = `${strokeOffset}`;
        }

        // Determine thermal category and color theme
        const stateInfo = this.getThermalState(celsius);
        
        if (this.gaugeStateText) {
            this.gaugeStateText.textContent = stateInfo.label;
            this.gaugeStateText.className = `sensation-badge ${stateInfo.className}`;
        }

        // Dispatch state change sound if crossed milestone
        if (stateInfo.category !== this.lastState) {
            if (window.neonAudio) {
                window.neonAudio.playStateCue(stateInfo.category === 'freezing' || stateInfo.category === 'cold');
            }
            this.lastState = stateInfo.category;
        }

        // Apply theme color glow to body / visualizer
        document.documentElement.style.setProperty('--temp-accent', stateInfo.color);
        document.documentElement.style.setProperty('--temp-glow', stateInfo.glow);
    }

    getThermalState(celsius) {
        if (celsius <= -270) {
            return { label: '🌌 Absolute Zero', category: 'freezing', className: 'state-abs-zero', color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.6)' };
        } else if (celsius <= -50) {
            return { label: '🧊 Deep Glacial Freeze', category: 'freezing', className: 'state-freezing', color: '#54d8ff', glow: 'rgba(84, 216, 255, 0.6)' };
        } else if (celsius <= 0) {
            return { label: '❄️ Sub-Zero Freezing', category: 'freezing', className: 'state-freezing', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.6)' };
        } else if (celsius <= 15) {
            return { label: '🌬️ Chilly / Cold', category: 'cold', className: 'state-cold', color: '#00ffc4', glow: 'rgba(0, 255, 196, 0.5)' };
        } else if (celsius <= 26) {
            return { label: '🌿 Comfortable / Room Temp', category: 'pleasant', className: 'state-pleasant', color: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' };
        } else if (celsius <= 37.5) {
            return { label: '☀️ Warm / Body Temp', category: 'warm', className: 'state-warm', color: '#ffd000', glow: 'rgba(255, 208, 0, 0.6)' };
        } else if (celsius <= 60) {
            return { label: '🔥 Hot Heatwave', category: 'hot', className: 'state-hot', color: '#ff8800', glow: 'rgba(255, 136, 0, 0.6)' };
        } else if (celsius <= 100) {
            return { label: '⚡ Water Boiling Point', category: 'extreme', className: 'state-extreme', color: '#ff3366', glow: 'rgba(255, 51, 102, 0.7)' };
        } else {
            return { label: '🌋 Hyperthermic / Solar Incandescence', category: 'extreme', className: 'state-solar', color: '#ff003c', glow: 'rgba(255, 0, 60, 0.8)' };
        }
    }
}

window.NeonVisualizer = NeonVisualizer;
