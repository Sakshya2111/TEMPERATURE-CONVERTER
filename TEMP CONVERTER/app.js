/**
 * Main Application Logic - Neon Temperature Converter
 */

// Unit Definitions & Meta
const UNITS = {
    celsius: { name: 'Celsius', symbol: '°C', key: 'celsius', desc: 'Metric standard scale' },
    fahrenheit: { name: 'Fahrenheit', symbol: '°F', key: 'fahrenheit', desc: 'Imperial / US customary scale' },
    kelvin: { name: 'Kelvin', symbol: 'K', key: 'kelvin', desc: 'SI thermodynamic absolute scale' },
    rankine: { name: 'Rankine', symbol: '°R', key: 'rankine', desc: 'Absolute Fahrenheit thermodynamic scale' },
    reaumur: { name: 'Réaumur', symbol: '°Ré', key: 'reaumur', desc: 'Historic 0-80 octogesimal scale' }
};

// Real-world benchmark presets
const PRESETS = [
    { name: 'Absolute Zero', tempC: -273.15, icon: '🌌', desc: 'Zero thermal energy, molecular motion ceases' },
    { name: 'Liquid Nitrogen', tempC: -195.79, icon: '🧪', desc: 'Cryogenic fluid used in superconductor cooling' },
    { name: 'Dry Ice (CO₂)', tempC: -78.5, icon: '🧊', desc: 'Solid carbon dioxide sublimation temperature' },
    { name: 'Water Freezing', tempC: 0, icon: '❄️', desc: 'Pure water phase transition point (ice to water)' },
    { name: 'Room Temperature', tempC: 21, icon: '🛋️', desc: 'Standard comfortable ambient human indoor climate' },
    { name: 'Human Body', tempC: 37, icon: '🫀', desc: 'Average human core basal body temperature' },
    { name: 'Water Boiling', tempC: 100, icon: '♨️', desc: 'Pure water boiling point at 1 atm sea level' },
    { name: 'Oven Baking', tempC: 180, icon: '🥧', desc: 'Standard culinary pastry and roasting heat' },
    { name: 'Sun Surface', tempC: 5505, icon: '☀️', desc: 'Photosphere surface temperature of the Sun' }
];

class TemperatureConverterApp {
    constructor() {
        this.fromUnit = 'celsius';
        this.toUnit = 'fahrenheit';
        this.inputValue = 25;
        this.precision = 2; // decimal places
        this.history = [];
        this.visualizer = null;
        
        // DOM Elements
        this.inputField = document.getElementById('tempInput');
        this.fromSelect = document.getElementById('fromUnitSelect');
        this.toSelect = document.getElementById('toUnitSelect');
        this.resultValue = document.getElementById('resultValue');
        this.resultUnit = document.getElementById('resultUnit');
        this.resultDesc = document.getElementById('resultDesc');
        this.slider = document.getElementById('tempSlider');
        this.sliderMinLabel = document.getElementById('sliderMinLabel');
        this.sliderMaxLabel = document.getElementById('sliderMaxLabel');
        this.swapBtn = document.getElementById('swapBtn');
        this.stepUpBtn = document.getElementById('stepUpBtn');
        this.stepDownBtn = document.getElementById('stepDownBtn');
        this.precisionBtns = document.querySelectorAll('.precision-btn');
        this.formulaBreakdown = document.getElementById('formulaBreakdown');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.toastEl = document.getElementById('neonToast');
        
        this.init();
    }

    init() {
        // Initialize visualizer
        this.visualizer = new window.NeonVisualizer();

        // Load History
        this.loadHistory();

        // Setup Event Listeners
        this.setupEventListeners();

        // Populate Presets Grid
        this.renderPresets();

        // Initial Calculation
        this.updateAll(false);

        // Theme picker setup
        this.setupThemes();

        // Audio controls setup
        this.setupAudioControls();
    }

    setupEventListeners() {
        // Direct input change
        this.inputField.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                this.inputValue = val;
                this.updateAll(true);
            }
        });

        // Unit dropdowns
        this.fromSelect.addEventListener('change', (e) => {
            this.fromUnit = e.target.value;
            window.neonAudio.playUnitSwitch();
            this.syncSliderRange();
            this.updateAll(false);
        });

        this.toSelect.addEventListener('change', (e) => {
            this.toUnit = e.target.value;
            window.neonAudio.playUnitSwitch();
            this.updateAll(false);
        });

        // Swap button
        this.swapBtn.addEventListener('click', () => {
            const temp = this.fromUnit;
            this.fromUnit = this.toUnit;
            this.toUnit = temp;

            this.fromSelect.value = this.fromUnit;
            this.toSelect.value = this.toUnit;

            // Also convert the current numeric value to the new source unit for smooth transition
            const currentResult = this.convert(this.inputValue, temp, this.fromUnit);
            this.inputValue = parseFloat(currentResult.toFixed(this.precision));
            this.inputField.value = this.inputValue;

            window.neonAudio.playSwap();
            this.showToast(`Swapped units: ${UNITS[this.fromUnit].symbol} ⇄ ${UNITS[this.toUnit].symbol}`);
            this.syncSliderRange();
            this.updateAll(false);
        });

        // Stepper buttons
        this.stepUpBtn.addEventListener('click', () => {
            this.stepValue(1);
        });
        this.stepDownBtn.addEventListener('click', () => {
            this.stepValue(-1);
        });

        // Slider scrubbing
        this.slider.addEventListener('input', (e) => {
            this.inputValue = parseFloat(e.target.value);
            this.inputField.value = this.inputValue;
            
            // Normalize for slider sound
            const min = parseFloat(this.slider.min);
            const max = parseFloat(this.slider.max);
            const normalized = (this.inputValue - min) / (max - min);
            window.neonAudio.playSliderTick(normalized);

            this.updateAll(false);
        });

        // Precision buttons
        this.precisionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.precisionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.precision = parseInt(btn.dataset.precision, 10);
                window.neonAudio.playClick();
                this.updateAll(false);
            });
        });

        // Copy main result button
        document.getElementById('copyResultBtn').addEventListener('click', () => {
            const converted = this.convert(this.inputValue, this.fromUnit, this.toUnit);
            const formatted = `${this.inputValue} ${UNITS[this.fromUnit].symbol} = ${this.formatNumber(converted)} ${UNITS[this.toUnit].symbol}`;
            this.copyToClipboard(formatted);
        });

        // Clear history button
        this.clearHistoryBtn.addEventListener('click', () => {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            window.neonAudio.playClick();
            this.showToast('History cleared');
        });
    }

    stepValue(delta) {
        const step = (event && event.shiftKey) ? 10 : 1;
        this.inputValue = parseFloat((this.inputValue + delta * step).toFixed(this.precision));
        this.inputField.value = this.inputValue;
        window.neonAudio.playStepSound(delta > 0);
        this.updateAll(false);
    }

    syncSliderRange() {
        // Adjust slider min/max according to the chosen fromUnit
        let min = -50, max = 150;
        if (this.fromUnit === 'celsius') {
            min = -50; max = 150;
        } else if (this.fromUnit === 'fahrenheit') {
            min = -58; max = 302;
        } else if (this.fromUnit === 'kelvin') {
            min = 0; max = 450;
        } else if (this.fromUnit === 'rankine') {
            min = 0; max = 800;
        } else if (this.fromUnit === 'reaumur') {
            min = -40; max = 120;
        }
        this.slider.min = min;
        this.slider.max = max;
        this.slider.step = (max - min) > 500 ? '1' : '0.5';
        this.sliderMinLabel.textContent = `${min} ${UNITS[this.fromUnit].symbol}`;
        this.sliderMaxLabel.textContent = `${max} ${UNITS[this.fromUnit].symbol}`;
        this.slider.value = this.inputValue;
    }

    // --- Mathematical Conversions ---

    toCelsius(val, unit) {
        switch (unit) {
            case 'celsius': return val;
            case 'fahrenheit': return (val - 32) * (5 / 9);
            case 'kelvin': return val - 273.15;
            case 'rankine': return (val - 491.67) * (5 / 9);
            case 'reaumur': return val * (5 / 4);
            default: return val;
        }
    }

    fromCelsius(valInC, targetUnit) {
        switch (targetUnit) {
            case 'celsius': return valInC;
            case 'fahrenheit': return (valInC * 9 / 5) + 32;
            case 'kelvin': return valInC + 273.15;
            case 'rankine': return (valInC + 273.15) * (9 / 5);
            case 'reaumur': return valInC * (4 / 5);
            default: return valInC;
        }
    }

    convert(val, from, to) {
        if (from === to) return val;
        const inCelsius = this.toCelsius(val, from);
        return this.fromCelsius(inCelsius, to);
    }

    formatNumber(num) {
        if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.001 && num !== 0)) {
            return num.toExponential(this.precision);
        }
        return Number(num.toFixed(this.precision)).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: this.precision
        });
    }

    // --- Main UI Updater ---

    updateAll(fromTyping = false) {
        const val = this.inputValue;
        const converted = this.convert(val, this.fromUnit, this.toUnit);
        const tempInCelsius = this.toCelsius(val, this.fromUnit);

        // Update Primary Result Display
        this.resultValue.textContent = this.formatNumber(converted);
        this.resultUnit.textContent = UNITS[this.toUnit].symbol;
        this.resultDesc.textContent = `${UNITS[this.toUnit].name} (${UNITS[this.toUnit].desc})`;

        // Update Slider if not typing
        if (!fromTyping) {
            this.slider.value = Math.max(parseFloat(this.slider.min), Math.min(parseFloat(this.slider.max), val));
        }

        // Update Visualizer (Mercury tube, radial gauge, particle effects)
        if (this.visualizer) {
            this.visualizer.update(tempInCelsius);
        }

        // Update Multi-Unit Matrix Cards
        this.updateUnitMatrix(tempInCelsius);

        // Update Step-by-Step Formula Breakdown
        this.renderFormulaBreakdown(val, this.fromUnit, this.toUnit, converted);

        // Debounced history record
        this.queueHistoryEntry(val, this.fromUnit, this.toUnit, converted);
    }

    updateUnitMatrix(celsius) {
        const matrixContainer = document.getElementById('unitMatrixGrid');
        if (!matrixContainer) return;

        let html = '';
        Object.keys(UNITS).forEach(unitKey => {
            const unit = UNITS[unitKey];
            const convertedVal = this.fromCelsius(celsius, unitKey);
            const isSource = unitKey === this.fromUnit;
            const isTarget = unitKey === this.toUnit;

            let badge = '';
            if (isSource) badge = '<span class="matrix-badge badge-source">SOURCE</span>';
            else if (isTarget) badge = '<span class="matrix-badge badge-target">TARGET</span>';

            html += `
                <div class="matrix-card ${isTarget ? 'highlight-target' : ''}" data-unit="${unitKey}">
                    <div class="matrix-card-header">
                        <span class="matrix-name">${unit.name}</span>
                        ${badge}
                    </div>
                    <div class="matrix-value-row">
                        <span class="matrix-val">${this.formatNumber(convertedVal)}</span>
                        <span class="matrix-sym">${unit.symbol}</span>
                    </div>
                    <div class="matrix-footer">
                        <span class="matrix-desc">${unit.desc}</span>
                        <button class="matrix-copy-btn" title="Copy ${unit.name} value" onclick="window.tempApp.copyMatrixVal('${this.formatNumber(convertedVal)} ${unit.symbol}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        });
        matrixContainer.innerHTML = html;
    }

    copyMatrixVal(str) {
        this.copyToClipboard(str);
    }

    // --- Formula Generation ---

    renderFormulaBreakdown(val, from, to, result) {
        if (!this.formulaBreakdown) return;

        if (from === to) {
            this.formulaBreakdown.innerHTML = `
                <div class="formula-step">
                    <span class="step-num">Identity</span>
                    <p class="step-math">Both units are <strong>${UNITS[from].name}</strong>. No conversion necessary.</p>
                    <div class="formula-box">${val} ${UNITS[from].symbol} = ${val} ${UNITS[to].symbol}</div>
                </div>
            `;
            return;
        }

        let algebra = '';
        let calculationSteps = [];

        if (from === 'celsius' && to === 'fahrenheit') {
            algebra = `°F = (°C × 9/5) + 32`;
            const step1 = val * 9 / 5;
            calculationSteps = [
                `Multiply by 9/5 (1.8): ${val} × 1.8 = ${this.formatNumber(step1)}`,
                `Add 32: ${this.formatNumber(step1)} + 32 = <strong>${this.formatNumber(result)} °F</strong>`
            ];
        } else if (from === 'fahrenheit' && to === 'celsius') {
            algebra = `°C = (°F - 32) × 5/9`;
            const step1 = val - 32;
            calculationSteps = [
                `Subtract 32: ${val} - 32 = ${this.formatNumber(step1)}`,
                `Multiply by 5/9 (0.5556): ${this.formatNumber(step1)} × 5/9 = <strong>${this.formatNumber(result)} °C</strong>`
            ];
        } else if (from === 'celsius' && to === 'kelvin') {
            algebra = `K = °C + 273.15`;
            calculationSteps = [
                `Add absolute zero offset: ${val} + 273.15 = <strong>${this.formatNumber(result)} K</strong>`
            ];
        } else if (from === 'kelvin' && to === 'celsius') {
            algebra = `°C = K - 273.15`;
            calculationSteps = [
                `Subtract absolute zero offset: ${val} - 273.15 = <strong>${this.formatNumber(result)} °C</strong>`
            ];
        } else if (from === 'fahrenheit' && to === 'kelvin') {
            algebra = `K = (°F - 32) × 5/9 + 273.15`;
            const step1 = (val - 32) * 5 / 9;
            calculationSteps = [
                `Convert to Celsius: (${val} - 32) × 5/9 = ${this.formatNumber(step1)} °C`,
                `Add Kelvin offset: ${this.formatNumber(step1)} + 273.15 = <strong>${this.formatNumber(result)} K</strong>`
            ];
        } else if (from === 'kelvin' && to === 'fahrenheit') {
            algebra = `°F = (K - 273.15) × 9/5 + 32`;
            const step1 = val - 273.15;
            calculationSteps = [
                `Convert to Celsius: ${val} - 273.15 = ${this.formatNumber(step1)} °C`,
                `Convert Celsius to Fahrenheit: (${this.formatNumber(step1)} × 9/5) + 32 = <strong>${this.formatNumber(result)} °F</strong>`
            ];
        } else if (from === 'celsius' && to === 'rankine') {
            algebra = `°R = (°C + 273.15) × 9/5`;
            const step1 = val + 273.15;
            calculationSteps = [
                `Convert to Kelvin: ${val} + 273.15 = ${this.formatNumber(step1)} K`,
                `Scale to Rankine: ${this.formatNumber(step1)} × 9/5 = <strong>${this.formatNumber(result)} °R</strong>`
            ];
        } else if (from === 'celsius' && to === 'reaumur') {
            algebra = `°Ré = °C × 4/5`;
            calculationSteps = [
                `Multiply by 4/5 (0.8): ${val} × 0.8 = <strong>${this.formatNumber(result)} °Ré</strong>`
            ];
        } else {
            // General intermediate via Celsius
            const cVal = this.toCelsius(val, from);
            algebra = `${UNITS[from].symbol} ➔ [Celsius Intermediate: ${this.formatNumber(cVal)} °C] ➔ ${UNITS[to].symbol}`;
            calculationSteps = [
                `Normalize source to Celsius: ${val} ${UNITS[from].symbol} = ${this.formatNumber(cVal)} °C`,
                `Calculate target from Celsius: ${this.formatNumber(cVal)} °C = <strong>${this.formatNumber(result)} ${UNITS[to].symbol}</strong>`
            ];
        }

        let stepsHtml = calculationSteps.map((step, idx) => `
            <div class="calc-step-item">
                <span class="step-bullet">${idx + 1}</span>
                <span class="step-text">${step}</span>
            </div>
        `).join('');

        this.formulaBreakdown.innerHTML = `
            <div class="formula-header-badge">
                <code>${algebra}</code>
            </div>
            <div class="calc-steps-list">
                ${stepsHtml}
            </div>
        `;
    }

    // --- Presets ---

    renderPresets() {
        const presetsContainer = document.getElementById('presetsGrid');
        if (!presetsContainer) return;

        let html = '';
        PRESETS.forEach((preset, idx) => {
            html += `
                <button class="preset-card" onclick="window.tempApp.loadPreset(${idx})">
                    <span class="preset-icon">${preset.icon}</span>
                    <div class="preset-info">
                        <div class="preset-name">${preset.name}</div>
                        <div class="preset-val">${preset.tempC} °C</div>
                    </div>
                </button>
            `;
        });
        presetsContainer.innerHTML = html;
    }

    loadPreset(idx) {
        const preset = PRESETS[idx];
        if (!preset) return;

        // Convert preset temp (which is in Celsius) into the user's active fromUnit
        const converted = this.fromCelsius(preset.tempC, this.fromUnit);
        this.inputValue = parseFloat(converted.toFixed(this.precision));
        this.inputField.value = this.inputValue;

        window.neonAudio.playPresetSound();
        this.showToast(`Loaded Preset: ${preset.name} (${preset.tempC}°C)`);
        this.updateAll(false);
    }

    // --- History & Persistence ---

    queueHistoryEntry(fromVal, fromUnit, toUnit, toVal) {
        if (this.historyTimeout) clearTimeout(this.historyTimeout);
        this.historyTimeout = setTimeout(() => {
            const entry = {
                id: Date.now(),
                fromVal,
                fromUnit,
                toUnit,
                toVal: parseFloat(toVal.toFixed(this.precision)),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };

            // Avoid duplicating consecutive identical inputs
            if (this.history.length > 0) {
                const last = this.history[0];
                if (last.fromVal === entry.fromVal && last.fromUnit === entry.fromUnit && last.toUnit === entry.toUnit) {
                    return;
                }
            }

            this.history.unshift(entry);
            if (this.history.length > 15) this.history.pop();
            this.saveHistory();
            this.renderHistory();
        }, 1200);
    }

    saveHistory() {
        try {
            localStorage.setItem('neon_temp_history', JSON.stringify(this.history));
        } catch(e) {}
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('neon_temp_history');
            if (saved) {
                this.history = JSON.parse(saved);
                this.renderHistory();
            }
        } catch(e) {}
    }

    renderHistory() {
        if (!this.historyList) return;
        if (this.history.length === 0) {
            this.historyList.innerHTML = `<div class="history-empty">No recent conversions. Adjust inputs or pick a preset!</div>`;
            return;
        }

        let html = '';
        this.history.forEach(item => {
            html += `
                <div class="history-item">
                    <div class="history-content">
                        <span class="history-from">${item.fromVal} ${UNITS[item.fromUnit].symbol}</span>
                        <span class="history-arrow">➔</span>
                        <span class="history-to">${this.formatNumber(item.toVal)} ${UNITS[item.toUnit].symbol}</span>
                    </div>
                    <div class="history-meta">
                        <span class="history-time">${item.time}</span>
                        <button class="history-copy-btn" title="Copy conversion" onclick="window.tempApp.copyToClipboard('${item.fromVal} ${UNITS[item.fromUnit].symbol} = ${this.formatNumber(item.toVal)} ${UNITS[item.toUnit].symbol}')">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        });
        this.historyList.innerHTML = html;
    }

    // --- Toast & Clipboard ---

    showToast(msg) {
        if (!this.toastEl) return;
        this.toastEl.textContent = msg;
        this.toastEl.classList.add('visible');
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.toastEl.classList.remove('visible');
        }, 2200);
    }

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                window.neonAudio.playCopyChime();
                this.showToast(`📋 Copied: ${text}`);
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        window.neonAudio.playCopyChime();
        this.showToast(`📋 Copied: ${text}`);
    }

    // --- Theme & Sound Controls ---

    setupThemes() {
        const themePills = document.querySelectorAll('.theme-pill');
        const savedTheme = localStorage.getItem('neon_temp_theme') || 'cyan';
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        themePills.forEach(pill => {
            if (pill.dataset.theme === savedTheme) pill.classList.add('active');
            
            pill.addEventListener('click', () => {
                themePills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const themeName = pill.dataset.theme;
                document.documentElement.setAttribute('data-theme', themeName);
                try {
                    localStorage.setItem('neon_temp_theme', themeName);
                } catch(e) {}
                window.neonAudio.playClick();
                this.showToast(`Neon Palette: ${pill.dataset.themeName || themeName.toUpperCase()}`);
            });
        });
    }

    setupAudioControls() {
        const muteBtn = document.getElementById('muteToggleBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeIcon = document.getElementById('volumeIcon');

        const updateAudioUI = () => {
            if (window.neonAudio.isMuted) {
                muteBtn.classList.add('muted');
                muteBtn.setAttribute('title', 'Sound Muted (Click to enable)');
                volumeIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
            } else {
                muteBtn.classList.remove('muted');
                muteBtn.setAttribute('title', 'Sound Active (Click to mute)');
                volumeIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
            }
            if (volumeSlider) {
                volumeSlider.value = window.neonAudio.isMuted ? 0 : window.neonAudio.volume * 100;
            }
        };

        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                window.neonAudio.ensureContext();
                const isMuted = window.neonAudio.toggleMute();
                updateAudioUI();
                if (!isMuted) window.neonAudio.playClick();
                this.showToast(isMuted ? '🔇 Audio Muted' : '🔊 Audio Enabled');
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const vol = parseFloat(e.target.value) / 100;
                window.neonAudio.ensureContext();
                if (window.neonAudio.isMuted) {
                    window.neonAudio.toggleMute();
                }
                window.neonAudio.setVolume(vol);
                updateAudioUI();
                window.neonAudio.playClick();
            });
        }

        // Click anywhere once to unlock AudioContext
        document.addEventListener('click', () => {
            if (window.neonAudio) window.neonAudio.ensureContext();
        }, { once: true });

        updateAudioUI();
    }
}

// Global App Instance on load
document.addEventListener('DOMContentLoaded', () => {
    window.tempApp = new TemperatureConverterApp();
});
