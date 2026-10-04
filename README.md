# ⚔️ Tower Defense

A browser-based Tower Defense game built with React, TypeScript, Vite, and HTML5 Canvas.

The objective is to defend the base against 50 progressive enemy waves by strategically placing, upgrading, and selling towers.

## 🎮 Live Demo

Add the deployed URL here after deployment:

`https://YOUR-DEPLOYED-URL.vercel.app`

## 🎥 Demo Video

Add the Loom/video URL here:

`YOUR-VIDEO-LINK`

---

## ✨ Features

- 50 enemy waves
- 3 different tower types
- 4 different enemy types
- Automatic tower targeting and attacks
- Enemy path-following system
- Tower placement
- Tower upgrades
- Tower selling
- Player health system
- Currency/reward system
- Score system
- Progressive wave difficulty
- Boss enemies
- Pause and resume
- Restart game
- 0.5x, 1x and 2x game speed
- Victory and Game Over states
- Live FPS and frame-time monitor
- Stress Test mode
- Support for 5,000 active enemies
- Support for 100 towers
- Support for 1,000 projectiles

---

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- HTML5 Canvas
- CSS

No backend or external service is required to play the game.

---

# 🏗️ Architecture

The project uses a simple separation between the React UI and the game simulation.

```text
src/
├── App.tsx
├── App.css
└── game/
    ├── data.ts
    ├── types.ts
    └── GameEngine.ts