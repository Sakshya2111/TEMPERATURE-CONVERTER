/**
 * Neon Sound Engine - Synthesizes futuristic UI sound effects using Web Audio API
 * Zero external audio assets required. Crystal clear, ultra-low latency audio.
 */
class NeonAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.volume = 0.6; // 0.0 to 1.0
        this.initialized = false;
        
        // Load persisted settings if available
        try {
            const savedMute = localStorage.getItem('neon_temp_mute');
            if (savedMute !== null) this.isMuted = savedMute === 'true';
            
            const savedVol = localStorage.getItem('neon_temp_vol');
            if (savedVol !== null) this.volume = parseFloat(savedVol);
        } catch (e) {
            console.warn('Storage not accessible for audio preferences', e);
        }
    }

    init() {
        if (this.initialized && this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported or blocked', e);
        }
    }

    ensureContext() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        try {
            localStorage.setItem('neon_temp_vol', this.volume.toString());
        } catch(e) {}
        
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        try {
            localStorage.setItem('neon_temp_mute', this.isMuted.toString());
        } catch(e) {}
        
        if (this.masterGain && this.ctx) {
            const targetGain = this.isMuted ? 0 : this.volume;
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);
        }
        return this.isMuted;
    }

    // --- Sound Generators ---

    /**
     * Crisp neon click / button tap
     */
    playClick() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    /**
     * Unit switch sound - sci-fi harmonic sweep
     */
    playUnitSwitch() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        osc2.frequency.setValueAtTime(660, now);
        osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.13);
        osc2.stop(now + 0.13);
    }

    /**
     * Slider tick with pitch dynamically mapped to normalized temperature (0 to 1)
     */
    playSliderTick(normalizedTemp = 0.5) {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Frequency ranges from 300Hz (cold) to 1800Hz (hot)
        const baseFreq = 300 + (Math.max(0, Math.min(1, normalizedTemp)) * 1500);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.025);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    /**
     * Swap units whoosh sound
     */
    playSwap() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.linearRampToValueAtTime(400, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    /**
     * Copy confirmation chime (melodic ascending double-chime)
     */
    playCopyChime() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        const playTone = (freq, startOffset, duration) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + startOffset);

            gain.gain.setValueAtTime(0, now + startOffset);
            gain.gain.linearRampToValueAtTime(0.22, now + startOffset + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + startOffset);
            osc.stop(now + startOffset + duration + 0.02);
        };

        // E6 (1318.5 Hz) -> B6 (1975.5 Hz)
        playTone(1318.5, 0, 0.12);
        playTone(1975.5, 0.09, 0.22);
    }

    /**
     * Preset benchmark selection (futuristic triad chord/arpeggio)
     */
    playPresetSound() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6

        notes.forEach((freq, idx) => {
            const start = idx * 0.04;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + start);

            gain.gain.setValueAtTime(0.18, now + start);
            gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.18);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + start);
            osc.stop(now + start + 0.2);
        });
    }

    /**
     * Temperature state shift cue
     */
    playStateCue(isCold) {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isCold ? 'sine' : 'triangle';
        const startFreq = isCold ? 900 : 350;
        const endFreq = isCold ? 1400 : 700;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * Stepper button (+ / -) sound
     */
    playStepSound(isUp = true) {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const base = isUp ? 650 : 500;
        const target = isUp ? 850 : 400;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(base, now);
        osc.frequency.exponentialRampToValueAtTime(target, now + 0.035);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.04);
    }
}

// Global instance
window.neonAudio = new NeonAudioEngine();
