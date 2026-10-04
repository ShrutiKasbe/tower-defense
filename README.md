# ⚔️ Tower Defense

A browser-based Tower Defense game built using **React, TypeScript, Vite, and HTML5 Canvas**.

The goal is to defend the base from progressively stronger enemy waves by strategically placing, upgrading, and selling towers.

## 🎮 Features

- 50 progressive enemy waves
- 3 different tower types
- 4 different enemy types
- Automatic tower targeting and attacks
- Enemy path-following system
- Tower placement
- Tower upgrades
- Tower selling
- Player health system
- Currency and reward system
- Score system
- Progressive difficulty
- Boss enemies
- Pause and Resume
- Restart
- 0.5×, 1× and 2× speed controls
- Victory and Game Over states
- Live FPS and frame-time monitoring
- High-load Stress Test mode

## 🏰 Tower Types

### 🟢 Archer
Fast single-target tower with quick attack speed.

### 🟠 Cannon
Heavy tower that deals area/splash damage to groups of enemies.

### 🔵 Frost
Support tower that damages enemies and slows their movement.

## 👾 Enemy Types

### 🔴 Basic
Balanced enemy with normal health and speed.

### 🟡 Runner
Fast enemy with lower health.

### 🟣 Tank
Slow but high-health enemy.

### 🔴 Boss
Very high-health enemy with a larger reward.

## 🌊 Wave System

The game contains **50 waves** with progressively increasing difficulty.

Enemy availability:

- Wave 1+: Basic enemies
- Wave 3+: Runner enemies
- Wave 6+: Tank enemies
- Every 10th wave: Boss enemies can appear

The number of enemies increases as the wave number increases.

After all enemies in a wave are defeated, the next wave starts after a short break.

Completing Wave 50 results in victory.

## 🎮 How to Play

1. Select a tower from the Towers panel.
2. Click an empty location on the map to place the tower.
3. Towers automatically attack enemies within their range.
4. Defeat enemies to earn currency and score.
5. Click an existing tower to select it.
6. Upgrade the selected tower to increase its power.
7. Sell towers when needed to recover part of their cost.
8. Use Pause, Restart, and Speed controls as required.
9. Survive all 50 waves to win the game.

## 🗺️ Game Flow

```text
Start Game
    ↓
Select Tower
    ↓
Place Tower
    ↓
Enemies Spawn
    ↓
Towers Automatically Attack
    ↓
Enemies Take Damage
    ↓
Enemies Defeated
    ↓
Earn Currency + Score
    ↓
Upgrade / Add Towers
    ↓
Next Wave
    ↓
Survive 50 Waves
    ↓
Victory
