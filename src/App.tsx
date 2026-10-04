import { useEffect, useRef, useState } from "react";
import "./App.css";

import { GameEngine } from "./game/GameEngine";
import { TOWER_DATA } from "./game/data";
import type { TowerType } from "./game/types";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [selectedTower, setSelectedTower] =
    useState<TowerType>("archer");

  const [selectedTowerId, setSelectedTowerId] =
    useState<number | null>(null);

  const [performanceStats, setPerformanceStats] =
    useState({
      fps: 0,
      frameTime: 0,
    });

  const [gameState, setGameState] = useState({
    health: 100,
    currency: 500,
    score: 0,
    wave: 1,
    paused: true,
    victory: false,
    gameOver: false,
    enemies: 0,
    towers: 0,
    projectiles: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1000;
    canvas.height = 500;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    let animationFrame = 0;
    let lastTime = performance.now();
    let lastUIUpdate = 0;

    let fpsTime = performance.now();
    let frameCount = 0;

    const gameLoop = (time: number) => {
      const deltaTime = Math.min(
        (time - lastTime) / 1000,
        0.05
      );

      lastTime = time;

      engine.update(deltaTime);
      engine.render();

      frameCount++;

      if (time - fpsTime >= 500) {
        const elapsed =
          (time - fpsTime) / 1000;

        const fps = frameCount / elapsed;
        const frameTime = 1000 / fps;

        setPerformanceStats({
          fps: Math.round(fps),
          frameTime: Number(
            frameTime.toFixed(1)
          ),
        });

        frameCount = 0;
        fpsTime = time;
      }

      if (time - lastUIUpdate > 100) {
        setGameState(engine.getState());
        lastUIUpdate = time;
      }

      animationFrame =
        requestAnimationFrame(gameLoop);
    };

    animationFrame =
      requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handleCanvasClick = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;

    if (!canvas || !engine) return;

    const rect =
      canvas.getBoundingClientRect();

    const scaleX =
      canvas.width / rect.width;

    const scaleY =
      canvas.height / rect.height;

    const x =
      (event.clientX - rect.left) *
      scaleX;

    const y =
      (event.clientY - rect.top) *
      scaleY;

    const existingTower =
      engine.getTowerAt(x, y);

    if (existingTower) {
      setSelectedTowerId(
        existingTower.id
      );

      setGameState(
        engine.getState()
      );

      return;
    }

    const placed =
      engine.placeTower(
        selectedTower,
        x,
        y
      );

    if (placed) {
      setGameState(
        engine.getState()
      );
    }
  };

  const startGame = () => {
    engineRef.current?.start();

    if (engineRef.current) {
      setGameState(
        engineRef.current.getState()
      );
    }
  };

  const pauseGame = () => {
    engineRef.current?.pause();

    if (engineRef.current) {
      setGameState(
        engineRef.current.getState()
      );
    }
  };

  const restartGame = () => {
    engineRef.current?.restart();
    setSelectedTowerId(null);

    if (engineRef.current) {
      setGameState(
        engineRef.current.getState()
      );
    }
  };

  const changeSpeed = (speed: number) => {
    engineRef.current?.setSpeed(speed);
  };

  const startStressTest = () => {
    engineRef.current?.startStressTest();
    setSelectedTowerId(null);

    if (engineRef.current) {
      setGameState(
        engineRef.current.getState()
      );
    }
  };

  const upgradeSelectedTower = () => {
    if (
      selectedTowerId === null ||
      !engineRef.current
    ) {
      return;
    }

    const upgraded =
      engineRef.current.upgradeTower(
        selectedTowerId
      );

    if (upgraded) {
      setGameState(
        engineRef.current.getState()
      );
    }
  };

  const sellSelectedTower = () => {
    if (
      selectedTowerId === null ||
      !engineRef.current
    ) {
      return;
    }

    const sold =
      engineRef.current.sellTower(
        selectedTowerId
      );

    if (sold) {
      setSelectedTowerId(null);

      setGameState(
        engineRef.current.getState()
      );
    }
  };

  const selectedTowerObject =
    selectedTowerId !== null
      ? engineRef.current?.getTower(
          selectedTowerId
        )
      : null;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>⚔️ Tower Defense</h1>
          <p>
            Defend your base through 50 enemy waves
          </p>
        </div>

        <div className="stats">
          <div>
            ❤️ <strong>{gameState.health}</strong>
          </div>

          <div>
            💰 <strong>{gameState.currency}</strong>
          </div>

          <div>
            ⭐ <strong>{gameState.score}</strong>
          </div>

          <div>
            🌊{" "}
            <strong>
              Wave {gameState.wave}/50
            </strong>
          </div>
        </div>
      </header>

      <main className="game-layout">
        <section className="game-section">
          <div className="game-header">
            <span>
              {gameState.victory
                ? "🏆 VICTORY"
                : gameState.gameOver
                ? "💀 GAME OVER"
                : gameState.paused
                ? "⏸️ PAUSED"
                : "🟢 RUNNING"}
            </span>

            <span>
              Enemies: {gameState.enemies}
              {" | "}
              Towers: {gameState.towers}
              {" | "}
              Projectiles: {gameState.projectiles}
            </span>
          </div>

          <div className="performance-panel">
            <span>
              ⚡ FPS:{" "}
              <strong>
                {performanceStats.fps}
              </strong>
            </span>

            <span>
              ⏱ Frame:{" "}
              <strong>
                {performanceStats.frameTime} ms
              </strong>
            </span>

            <span>
              👾 {gameState.enemies}
            </span>

            <span>
              🏰 {gameState.towers}
            </span>

            <span>
              🎯 {gameState.projectiles}
            </span>
          </div>

          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="game-canvas"
          />

          <div className="controls">
            <button onClick={startGame}>
              ▶ Start
            </button>

            <button onClick={pauseGame}>
              ⏸ Pause
            </button>

            <button onClick={restartGame}>
              ↻ Restart
            </button>

            <button
              onClick={() =>
                changeSpeed(0.5)
              }
            >
              0.5×
            </button>

            <button
              onClick={() =>
                changeSpeed(1)
              }
            >
              1×
            </button>

            <button
              onClick={() =>
                changeSpeed(2)
              }
            >
              2×
            </button>

            <button
              className="stress-button"
              onClick={startStressTest}
            >
              🧪 Stress Test
            </button>
          </div>
        </section>

        <aside className="tower-panel">
          <h2>🏰 Towers</h2>

          <p className="hint">
            Select a tower and click the map
            to place it.
          </p>

          {(Object.keys(
            TOWER_DATA
          ) as TowerType[]).map((type) => {
            const tower =
              TOWER_DATA[type];

            return (
              <button
                key={type}
                className={`tower-button ${
                  selectedTower === type
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedTower(type)
                }
              >
                <span
                  className="tower-color"
                  style={{
                    backgroundColor:
                      tower.color,
                  }}
                />

                <div>
                  <strong>
                    {tower.name}
                  </strong>

                  <small>
                    💰 {tower.cost} • ⚔️{" "}
                    {tower.damage}
                  </small>

                  <small>
                    {tower.description}
                  </small>
                </div>
              </button>
            );
          })}

          <div className="selected-info">
            {selectedTowerObject ? (
              <>
                <h3>
                  🏰{" "}
                  {
                    TOWER_DATA[
                      selectedTowerObject.type
                    ].name
                  }
                </h3>

                <p>
                  Level:{" "}
                  <strong>
                    {selectedTowerObject.level}
                  </strong>
                </p>

                <p>
                  Damage:{" "}
                  <strong>
                    {Math.round(
                      selectedTowerObject.damage
                    )}
                  </strong>
                </p>

                <p>
                  Range:{" "}
                  <strong>
                    {Math.round(
                      selectedTowerObject.range
                    )}
                  </strong>
                </p>

                <p>
                  Upgrade Cost: 💰{" "}
                  <strong>
                    {
                      selectedTowerObject.upgradeCost
                    }
                  </strong>
                </p>

                <div className="tower-actions">
                  <button
                    onClick={
                      upgradeSelectedTower
                    }
                    disabled={
                      gameState.currency <
                      selectedTowerObject.upgradeCost
                    }
                  >
                    ⬆ Upgrade
                  </button>

                  <button
                    onClick={
                      sellSelectedTower
                    }
                  >
                    💰 Sell
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>
                  Selected:{" "}
                  {
                    TOWER_DATA[
                      selectedTower
                    ].name
                  }
                </h3>

                <p>
                  Cost: 💰{" "}
                  {
                    TOWER_DATA[
                      selectedTower
                    ].cost
                  }
                </p>

                <p>
                  Range:{" "}
                  {
                    TOWER_DATA[
                      selectedTower
                    ].range
                  }
                </p>

                <p>
                  Damage:{" "}
                  {
                    TOWER_DATA[
                      selectedTower
                    ].damage
                  }
                </p>

                <p className="selection-hint">
                  💡 Click an existing tower
                  to upgrade or sell it.
                </p>
              </>
            )}
          </div>

          <div className="instructions">
            <h3>How to play</h3>
            <p>1. Select a tower.</p>
            <p>2. Click on the map.</p>
            <p>3. Towers attack automatically.</p>
            <p>4. Upgrade or sell towers.</p>
            <p>5. Survive all 50 waves.</p>
          </div>
        </aside>
      </main>

      {(gameState.victory ||
        gameState.gameOver) && (
        <div className="result-overlay">
          <div className="result-card">
            <div className="result-icon">
              {gameState.victory
                ? "🏆"
                : "💀"}
            </div>

            <h2>
              {gameState.victory
                ? "Victory!"
                : "Game Over"}
            </h2>

            <p>
              {gameState.victory
                ? "You successfully defended the base through all 50 waves!"
                : "The enemy reached your base."}
            </p>

            <p>
              Final Score:{" "}
              <strong>
                {gameState.score}
              </strong>
            </p>

            <button
              onClick={restartGame}
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;