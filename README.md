NAME : SAKSHYA SHARMA

INTERN-ID : CITS8549

DOMAIN - JAVA PROGRAMMING

# TEMPERATURE-CONVERTER
## Temperature Converter   # 🌌 THERMO.NEON — Project Description & Feature Overview

**THERMO.NEON** (Neon Pulse Temperature Converter) is a futuristic, cyberpunk dark-theme web application designed with high-impact visual aesthetics, real-time procedural sound synthesis, and an interactive atmospheric thermal engine.

---

## 🎨 1. Dark Theme & Neon Aesthetics

* **Deep Obsidian Glassmorphism**: Built on a deep space dark background (`#05070e`) using semi-transparent frosted glass panels (`backdrop-filter: blur(18px)`) with multi-layer glowing borders and scanline highlights.
* **🌡️ Dynamic Temperature-Reactive Atmosphere**: The entire application's ambient lighting and glow dynamically shift depending on the current temperature:
  * 🧊 **Sub-Zero / Glacial Freeze ($\le 0^\circ\text{C}$)**: Frosty Cyan glow with falling ice crystal snow particles.
  * 🌿 **Comfortable / Room Temp ($15\text{--}26^\circ\text{C}$)**: Radiant Emerald Green glow with calm ambient dust motes.
  * ☀️ **Warm / Body Temp ($27\text{--}40^\circ\text{C}$)**: Radiant Solar Amber glow.
  * 🔥 **Water Boiling / Extreme Heat ($>60^\circ\text{C}$)**: Blazing Hot Red-Orange glow with rising thermal bubble sparks.
  * 🌋 **Hyperthermic / Solar Incandescence ($>300^\circ\text{C}$)**: Deep Plasma Crimson glow.
* **5 Neon Palette Presets**: Switch instantly between **Cyber Cyan**, **Neon Magenta**, **Acid Emerald**, **Solar Amber**, and **UV Violet** via the top HUD palette selector.

---

## 🔊 2. Real-Time Web Audio Synthesizer Engine ([audio.js](file:///c:/Users/sharm/OneDrive/Desktop/TEMP%20CONVERTER/audio.js))

Instead of relying on heavy audio files that can fail or lag, the app uses a custom built-in **Web Audio API sound synthesizer** that procedurally generates crisp futuristic audio in real time:

| Action | Synthesized Sound Effect |
| :--- | :--- |
| **Numeric Slider Dragging** | **Pitch-adaptive frequency ticks** that dynamically rise in tone (300 Hz $\to$ 1800 Hz) as the temperature gets hotter |
| **Unit Dropdown Selection** | **Dual-tone harmonic frequency sweep** |
| **Unit Swap Button (⇄)** | **Frequency modulation reverse whoosh** |
| **Button Clicks & Steppers** | **Crisp sub-millisecond resonant pulse** with directional pitch (higher on `▲`, lower on `▼`) |
| **Copy Result (📋)** | **Ascending melodic double-chime** ($E_6 \to B_6$) |
| **Thermal Benchmarks** | **Futuristic 4-note arpeggio chord** ($D_5 \to F^\sharp_5 \to A_5 \to D_6$) |
| **Audio Controls Dock** | Includes a master **Mute Toggle** with visual waveform indicator and a smooth **Volume Slider** |

---

## ⚡ 3. Conversion Capabilities & Core Features

### 🔄 Multi-Scale Temperature Support
Seamlessly converts between **5 primary scientific and international temperature scales**:
1. **Celsius (°C)** — Standard metric scale
2. **Fahrenheit (°F)** — US customary / imperial scale
3. **Kelvin (K)** — SI thermodynamic absolute zero scale
4. **Rankine (°R)** — Absolute Fahrenheit thermodynamic scale
5. **Réaumur (°Ré)** — Historic 80-degree octogesimal scale

### 📊 Live Synchronous Spectrum Matrix
As you type or scrub the slider, all 5 temperature units update simultaneously across dedicated glowing glass cards with 1-click clipboard copy buttons.

### 📐 Step-by-Step Mathematical Formula Breakdown
Displays the exact algebraic formula being applied alongside step-by-step arithmetic substitution so users can see how the result was calculated.

### 🧪 Real-World Thermal Benchmarks (Presets)
One-click presets for physical temperature points across the universe:
* **Absolute Zero** ($-273.15^\circ\text{C}$) — Molecular motion stops
* **Liquid Nitrogen** ($-195.79^\circ\text{C}$) — Cryogenic cooling
* **Dry Ice** ($-78.5^\circ\text{C}$) — Solid carbon dioxide sublimation
* **Water Freezing Point** ($0^\circ\text{C}$)
* **Room Temperature** ($21^\circ\text{C}$) — Standard ambient climate
* **Human Body Temp** ($37^\circ\text{C}$)
* **Water Boiling Point** ($100^\circ\text{C}$)
* **Oven Baking** ($180^\circ\text{C}$)
* **Surface of the Sun** ($5505^\circ\text{C}$) — Photosphere heat

### 🎛️ Interactive Controls & History
* **Precision Controls**: Instantly switch between `.0`, `.1`, `.2`, or `.4` decimal places.
* **Stepper Buttons**: `▲` / `▼` increments (+10 step when holding Shift).
* **Recent Conversion History**: Automatically records recent calculations with timestamps and copy shortcuts.

---

## 📁 4. Project Architecture

* [index.html](file:///c:/Users/sharm/OneDrive/Desktop/TEMP%20CONVERTER/index.html) — Semantic HTML5 dashboard structure with accessible HUD and cards.
* [style.css](file:///c:/Users/sharm/OneDrive/Desktop/TEMP%20CONVERTER/style.css) — Custom CSS3 design system, neon glow variables, and responsive grid layouts.
* [audio.js](file:///c:/Users/sharm/OneDrive/Desktop/TEMP%20CONVERTER/audio.js) — Pure Web Audio API synthesizer for all sound effects.
* [thermometer.js](file:///c:/Users/sharm/OneDrive/Desktop/TEMP%20CONVERTER/thermometer.js) — Interactive mercury tube, radial gauge, and dynamic canvas particle system.
* [app.js](file:///c:/Users/sharm/OneDrive/Desktop/TEMP%20CONVERTER/app.js) — Bi-directional math conversion logic, formula generator, presets, and history storage.
