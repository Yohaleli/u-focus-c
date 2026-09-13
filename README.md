# <p align="center">🎯 UFocus (Focus Desk)</p>

<p align="center">
  <b>A distraction-free, high-performance productivity environment designed to eliminate cognitive friction.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-React_%7C_Svelte_5_%7C_Tailwind_CSS-38B2AC?style=flat-square" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/Audio-Web_Audio_API-orange?style=flat-square" alt="Web Audio" />
  <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## 🌟 Overview

**UFocus** is a minimalist, dark-mode productivity workspace centered on deep focus, mindful pacing, and frictionless task execution. Built with a glassmorphic aesthetic (`#161514` canvas), fluid animations, and high-contrast typography.

---

## ✨ Key Features

### 1. ⏱️ Dynamic Focus Engine
- **Flexible Intervals**: Toggle between Deep Focus, Short Break, and Long Break cycles.
- **Visual Progress**: Responsive animated SVG decay ring tracking remaining session time.
- **Interactive Override**: Click directly on the clock interface to manually customize session duration on the fly.
- **Immersive Fullscreen**: Clean, distraction-free overlay removing peripheral noise to keep attention locked on current work.

### 2. 🎧 Ambient Audio Synthesizer
- **Procedural Soundscapes**: Continuous audio generators built natively with the **Web Audio API**—no static MP3 loops.
- **Sound Profiles**:
  - 🌧️ Rain
  - 🌊 Brown Noise
  - 🌌 Deep Drone
  - ☕ Coffee Shop
- **Dedicated Sound Controls**: Integrated volume attenuation and completion chimes.

### 3. 📋 Drag-and-Drop Task Prioritization
- **Task Management**: Quick-entry floating to-do panel with instant check-off styling.
- **Tactile Reordering**: HTML5 drag-and-drop handles (`GripVertical`) to dynamically reorder priorities during active sessions.
- **Local Persistence**: State automatically retained across browser reloads.

### 4. ⚡ Workflow Accelerators & Shortcuts
- `Space`: Instant toggle for Play/Pause.
- `Escape`: Instantly exit the immersive fullscreen overlay.
- `T`: Toggle visibility of the To-Do task tray.
- **Preset Library**: One-click custom timers (e.g., *Deep Work — 90m*, *Quick Sprint — 15m*).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React / Svelte 5 |
| **Styling & Design** | Tailwind CSS, Lucide Icons, Glassmorphism UI |
| **Audio Engine** | Native Web Audio API (`audioSynth.ts`) |
| **Backend & Sync** | Firebase Firestore, Firebase Hosting |
| **Build & Tooling** | Vite, TypeScript |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm, pnpm, or bun

### Installation
```bash
# Clone the repository
git clone https://github.com/Yohaleli/u-focus-c.git
cd u-focus-c

# Install dependencies
npm install

# Start local development server
npm run dev
```

---

## 📄 License
Distributed under the MIT License.
