import { ENEMY_DATA, TOWER_DATA } from "./data";

import type {
  Enemy,
  EnemyType,
  Point,
  Projectile,
  Tower,
  TowerType,
} from "./types";

const PATH: Point[] = [
  { x: 40, y: 120 },
  { x: 220, y: 120 },
  { x: 220, y: 300 },
  { x: 500, y: 300 },
  { x: 500, y: 160 },
  { x: 760, y: 160 },
  { x: 760, y: 420 },
  { x: 1000, y: 420 },
];

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private projectiles: Projectile[] = [];

  private enemyById = new Map<number, Enemy>();

  private readonly GRID_SIZE = 120;
  private enemyGrid = new Map<string, Enemy[]>();

  private readonly MAX_PROJECTILES = 1000;

  private nextEnemyId = 1;
  private nextTowerId = 1;
  private nextProjectileId = 1;

  private health = 100;
  private currency = 500;
  private score = 0;
  private wave = 1;

  private paused = true;
  private speedMultiplier = 1;

  private waveActive = true;
  private waveSpawnRemaining = 8;
  private waveSpawnTimer = 0;
  private waveBreakTimer = 0;

  private victory = false;
  private gameOver = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context unavailable");
    }

    this.ctx = context;

    this.spawnInitialEnemies();
  }

  private spawnInitialEnemies() {
    for (let i = 0; i < 8; i++) {
      this.spawnEnemy("basic", i * 40);
    }
  }

  private spawnEnemy(
    type: EnemyType,
    offset = 0
  ) {
    const data = ENEMY_DATA[type];
    const start = PATH[0];

    this.enemies.push({
      id: this.nextEnemyId++,
      type,
      x: start.x - offset,
      y: start.y,
      waypoint: 1,

      hp: data.hp,
      maxHp: data.hp,
      speed: data.speed,
      reward: data.reward,
      radius: data.radius,

      slowMultiplier: 1,
      slowTimer: 0,
    });
  }

  update(deltaTime: number) {
    if (this.paused) {
      return;
    }

    const dt =
      deltaTime * this.speedMultiplier;

    this.updateEnemies(dt);

    this.buildEnemyGrid();

    this.updateTowers(dt);
    this.updateProjectiles(dt);
    this.updateWaveSystem(dt);
  }

  private buildEnemyGrid() {
    this.enemyGrid.clear();
    this.enemyById.clear();

    for (const enemy of this.enemies) {
      this.enemyById.set(
        enemy.id,
        enemy
      );

      const cellX = Math.floor(
        enemy.x / this.GRID_SIZE
      );

      const cellY = Math.floor(
        enemy.y / this.GRID_SIZE
      );

      const key =
        `${cellX},${cellY}`;

      let cell =
        this.enemyGrid.get(key);

      if (!cell) {
        cell = [];
        this.enemyGrid.set(
          key,
          cell
        );
      }

      cell.push(enemy);
    }
  }

  private updateWaveSystem(dt: number) {
    if (
      this.victory ||
      this.gameOver
    ) {
      return;
    }

    if (
      this.waveActive &&
      this.waveSpawnRemaining > 0
    ) {
      this.waveSpawnTimer -= dt;

      if (
        this.waveSpawnTimer <= 0
      ) {
        const enemyType =
          this.getWaveEnemyType();

        this.spawnEnemy(
          enemyType
        );

        this.waveSpawnRemaining--;

        this.waveSpawnTimer = 0.45;
      }

      return;
    }

    if (
      this.waveActive &&
      this.waveSpawnRemaining === 0 &&
      this.enemies.length === 0
    ) {
      this.waveActive = false;
      this.waveBreakTimer = 2;
    }

    if (!this.waveActive) {
      this.waveBreakTimer -= dt;

      if (
        this.waveBreakTimer <= 0
      ) {
        if (this.wave >= 50) {
          this.victory = true;
          this.paused = true;
          return;
        }

        this.wave++;

        this.waveSpawnRemaining =
          8 + this.wave * 2;

        this.waveSpawnTimer = 0;
        this.waveActive = true;
      }
    }
  }

  private getWaveEnemyType(): EnemyType {
    const random =
      Math.random();

    if (
      this.wave % 10 === 0 &&
      random < 0.12
    ) {
      return "boss";
    }

    if (
      this.wave >= 6 &&
      random < 0.2
    ) {
      return "tank";
    }

    if (
      this.wave >= 3 &&
      random < 0.35
    ) {
      return "runner";
    }

    return "basic";
  }

  private updateEnemies(dt: number) {
    for (
      let i =
        this.enemies.length - 1;
      i >= 0;
      i--
    ) {
      const enemy =
        this.enemies[i];

      if (
        enemy.slowTimer > 0
      ) {
        enemy.slowTimer -= dt;

        if (
          enemy.slowTimer <= 0
        ) {
          enemy.slowTimer = 0;
          enemy.slowMultiplier = 1;
        }
      }

      if (
        enemy.waypoint >=
        PATH.length
      ) {
        this.health -= 10;

        this.enemies.splice(
          i,
          1
        );

        if (this.health <= 0) {
          this.health = 0;
          this.gameOver = true;
          this.paused = true;
        }

        continue;
      }

      const target =
        PATH[enemy.waypoint];

      const dx =
        target.x - enemy.x;

      const dy =
        target.y - enemy.y;

      const distanceSquared =
        dx * dx + dy * dy;

      const distance =
        Math.sqrt(
          distanceSquared
        );

      const moveSpeed =
        enemy.speed *
        enemy.slowMultiplier;

      const movement =
        moveSpeed * dt;

      if (
        distance <= movement
      ) {
        enemy.x = target.x;
        enemy.y = target.y;
        enemy.waypoint++;
      } else if (
        distance > 0
      ) {
        enemy.x +=
          (dx / distance) *
          movement;

        enemy.y +=
          (dy / distance) *
          movement;
      }
    }
  }

  private updateTowers(dt: number) {
    for (const tower of this.towers) {
      tower.cooldown -= dt;

      if (tower.cooldown > 0) {
        continue;
      }

      if (
        this.projectiles.length >=
        this.MAX_PROJECTILES
      ) {
        continue;
      }

      const target =
        this.findNearestEnemy(
          tower
        );

      if (!target) {
        continue;
      }

      this.projectiles.push({
        id: this.nextProjectileId++,

        x: tower.x,
        y: tower.y,

        targetId: target.id,

        damage: tower.damage,
        speed: 420,

        towerType: tower.type,

        splashRadius:
          tower.type === "cannon"
            ? 55
            : 0,

        slowAmount:
          tower.type === "frost"
            ? 0.45
            : 1,
      });

      tower.cooldown =
        tower.fireRate;
    }
  }

  private findNearestEnemy(
    tower: Tower
  ): Enemy | null {
    let nearest: Enemy | null =
      null;

    let nearestDistance =
      Infinity;

    const cellX =
      Math.floor(
        tower.x /
          this.GRID_SIZE
      );

    const cellY =
      Math.floor(
        tower.y /
          this.GRID_SIZE
      );

    const cellRange =
      Math.ceil(
        tower.range /
          this.GRID_SIZE
      );

    const rangeSquared =
      tower.range *
      tower.range;

    for (
      let gx =
        cellX - cellRange;
      gx <=
        cellX + cellRange;
      gx++
    ) {
      for (
        let gy =
          cellY - cellRange;
        gy <=
          cellY + cellRange;
        gy++
      ) {
        const cell =
          this.enemyGrid.get(
            `${gx},${gy}`
          );

        if (!cell) {
          continue;
        }

        for (
          const enemy of cell
        ) {
          const dx =
            enemy.x - tower.x;

          const dy =
            enemy.y - tower.y;

          const distanceSquared =
            dx * dx +
            dy * dy;

          if (
            distanceSquared <=
              rangeSquared &&
            distanceSquared <
              nearestDistance
          ) {
            nearest = enemy;

            nearestDistance =
              distanceSquared;
          }
        }
      }
    }

    return nearest;
  }

  private updateProjectiles(
    dt: number
  ) {
    for (
      let i =
        this.projectiles.length - 1;
      i >= 0;
      i--
    ) {
      const projectile =
        this.projectiles[i];

      const target =
        this.enemyById.get(
          projectile.targetId
        );

      if (!target) {
        this.projectiles.splice(
          i,
          1
        );

        continue;
      }

      const dx =
        target.x -
        projectile.x;

      const dy =
        target.y -
        projectile.y;

      const distanceSquared =
        dx * dx + dy * dy;

      const movement =
        projectile.speed * dt;

      const hitDistance =
        movement +
        target.radius;

      if (
        distanceSquared <=
        hitDistance *
          hitDistance
      ) {
        this.hitEnemy(
          projectile,
          target
        );

        this.projectiles.splice(
          i,
          1
        );
      } else if (
        distanceSquared > 0
      ) {
        const distance =
          Math.sqrt(
            distanceSquared
          );

        projectile.x +=
          (dx / distance) *
          movement;

        projectile.y +=
          (dy / distance) *
          movement;
      }
    }
  }

  private hitEnemy(
    projectile: Projectile,
    target: Enemy
  ) {
    if (
      projectile.towerType ===
      "cannon"
    ) {
      const cellX =
        Math.floor(
          target.x /
            this.GRID_SIZE
        );

      const cellY =
        Math.floor(
          target.y /
            this.GRID_SIZE
        );

      const radius =
        projectile.splashRadius;

      const radiusSquared =
        radius * radius;

      const cellRange =
        Math.ceil(
          radius /
            this.GRID_SIZE
        );

      for (
        let gx =
          cellX - cellRange;
        gx <=
          cellX + cellRange;
        gx++
      ) {
        for (
          let gy =
            cellY - cellRange;
          gy <=
            cellY + cellRange;
          gy++
        ) {
          const cell =
            this.enemyGrid.get(
              `${gx},${gy}`
            );

          if (!cell) {
            continue;
          }

          for (
            const enemy of cell
          ) {
            const dx =
              enemy.x -
              target.x;

            const dy =
              enemy.y -
              target.y;

            const distanceSquared =
              dx * dx +
              dy * dy;

            if (
              distanceSquared <=
              radiusSquared
            ) {
              enemy.hp -=
                projectile.damage;
            }
          }
        }
      }
    } else {
      target.hp -=
        projectile.damage;
    }

    if (
      projectile.towerType ===
      "frost"
    ) {
      target.slowMultiplier =
        projectile.slowAmount;

      target.slowTimer = 2;
    }

    this.removeDeadEnemies();
  }

  private removeDeadEnemies() {
    for (
      let i =
        this.enemies.length - 1;
      i >= 0;
      i--
    ) {
      const enemy =
        this.enemies[i];

      if (enemy.hp <= 0) {
        this.currency +=
          enemy.reward;

        this.score +=
          enemy.reward * 10;

        this.enemies.splice(
          i,
          1
        );
      }
    }
  }

  placeTower(
    type: TowerType,
    x: number,
    y: number
  ): boolean {
    const data =
      TOWER_DATA[type];

    if (
      this.currency <
      data.cost
    ) {
      return false;
    }

    if (
      !this.canPlaceTower(
        x,
        y
      )
    ) {
      return false;
    }

    const tower: Tower = {
      id: this.nextTowerId++,

      type,
      x,
      y,

      level: 1,

      range: data.range,
      damage: data.damage,
      fireRate: data.fireRate,

      cooldown: 0,

      upgradeCost:
        Math.floor(
          data.cost * 0.75
        ),

      totalSpent:
        data.cost,
    };

    this.currency -=
      data.cost;

    this.towers.push(
      tower
    );

    return true;
  }

  private canPlaceTower(
    x: number,
    y: number
  ): boolean {
    if (
      x < 30 ||
      x >
        this.canvas.width - 30
    ) {
      return false;
    }

    if (
      y < 30 ||
      y >
        this.canvas.height - 30
    ) {
      return false;
    }

    for (
      const tower of this.towers
    ) {
      const dx =
        tower.x - x;

      const dy =
        tower.y - y;

      if (
        dx * dx +
          dy * dy <
        45 * 45
      ) {
        return false;
      }
    }

    for (
      let i = 0;
      i < PATH.length - 1;
      i++
    ) {
      const distance =
        this.distanceToSegment(
          x,
          y,
          PATH[i].x,
          PATH[i].y,
          PATH[i + 1].x,
          PATH[i + 1].y
        );

      if (distance < 45) {
        return false;
      }
    }

    return true;
  }

  private distanceToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx =
      x2 - x1;

    const dy =
      y2 - y1;

    if (
      dx === 0 &&
      dy === 0
    ) {
      return Math.hypot(
        px - x1,
        py - y1
      );
    }

    const t =
      Math.max(
        0,
        Math.min(
          1,
          (
            (px - x1) *
              dx +
            (py - y1) *
              dy
          ) /
            (dx * dx +
              dy * dy)
        )
      );

    const closestX =
      x1 + t * dx;

    const closestY =
      y1 + t * dy;

    return Math.hypot(
      px - closestX,
      py - closestY
    );
  }

  upgradeTower(
    towerId: number
  ): boolean {
    const tower =
      this.towers.find(
        (t) =>
          t.id === towerId
      );

    if (!tower) {
      return false;
    }

    if (
      this.currency <
      tower.upgradeCost
    ) {
      return false;
    }

    this.currency -=
      tower.upgradeCost;

    tower.level++;

    tower.damage *= 1.35;

    tower.range += 12;

    tower.fireRate *= 0.92;

    tower.totalSpent +=
      tower.upgradeCost;

    tower.upgradeCost =
      Math.floor(
        tower.upgradeCost *
          1.5
      );

    return true;
  }

  sellTower(
    towerId: number
  ): boolean {
    const index =
      this.towers.findIndex(
        (t) =>
          t.id === towerId
      );

    if (index === -1) {
      return false;
    }

    const tower =
      this.towers[index];

    this.currency +=
      Math.floor(
        tower.totalSpent *
          0.6
      );

    this.towers.splice(
      index,
      1
    );

    return true;
  }

  startStressTest() {
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];

    this.enemyGrid.clear();
    this.enemyById.clear();

    this.health = 100;
    this.currency = 100000;
    this.score = 0;
    this.wave = 1;

    this.victory = false;
    this.gameOver = false;

    this.waveActive = false;
    this.waveSpawnRemaining = 0;
    this.waveSpawnTimer = 0;
    this.waveBreakTimer = 0;

    this.nextEnemyId = 1;
    this.nextTowerId = 1;
    this.nextProjectileId = 1;

    this.paused = false;

    // 5,000 enemies
    for (
      let i = 0;
      i < 5000;
      i++
    ) {
      let type: EnemyType =
        "basic";

      if (
        i % 10 === 0
      ) {
        type = "tank";
      } else if (
        i % 5 === 0
      ) {
        type = "runner";
      }

      const data =
        ENEMY_DATA[type];

      this.enemies.push({
        id: this.nextEnemyId++,
        type,

        x:
          40 +
          (i % 100) * 8,

        y:
          120 +
          Math.floor(
            i / 100
          ) * 7,

        waypoint: 1,

        hp: data.hp,
        maxHp: data.hp,

        speed: data.speed,
        reward: data.reward,
        radius: data.radius,

        slowMultiplier: 1,
        slowTimer: 0,
      });
    }

    // 100 towers
    const towerTypes:
      TowerType[] = [
        "archer",
        "cannon",
        "frost",
      ];

    for (
      let i = 0;
      i < 100;
      i++
    ) {
      const type =
        towerTypes[
          i %
            towerTypes.length
        ];

      const data =
        TOWER_DATA[type];

      this.towers.push({
        id:
          this.nextTowerId++,

        type,

        x:
          70 +
          (i % 10) * 95,

        y:
          50 +
          Math.floor(
            i / 10
          ) * 42,

        level: 1,

        range: data.range,
        damage: data.damage,
        fireRate: data.fireRate,

        cooldown: 0,

        upgradeCost:
          Math.floor(
            data.cost * 0.75
          ),

        totalSpent:
          data.cost,
      });
    }

    // 1,000 projectiles
    for (
      let i = 0;
      i < 1000;
      i++
    ) {
      const target =
        this.enemies[
          i %
            this.enemies.length
        ];

      this.projectiles.push({
        id:
          this.nextProjectileId++,

        x: 500,
        y: 250,

        targetId:
          target.id,

        damage: 10,
        speed: 420,

        towerType:
          "archer",

        splashRadius: 0,
        slowAmount: 1,
      });
    }

    this.buildEnemyGrid();
  }

  start() {
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  restart() {
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];

    this.enemyGrid.clear();
    this.enemyById.clear();

    this.nextEnemyId = 1;
    this.nextTowerId = 1;
    this.nextProjectileId = 1;

    this.health = 100;
    this.currency = 500;
    this.score = 0;
    this.wave = 1;

    this.waveActive = true;
    this.waveSpawnRemaining = 8;
    this.waveSpawnTimer = 0;
    this.waveBreakTimer = 0;

    this.victory = false;
    this.gameOver = false;

    this.paused = true;

    this.spawnInitialEnemies();
  }

  setSpeed(speed: number) {
    this.speedMultiplier =
      speed;
  }

  getTowerAt(
    x: number,
    y: number
  ): Tower | null {
    for (
      const tower of this.towers
    ) {
      const dx =
        tower.x - x;

      const dy =
        tower.y - y;

      if (
        dx * dx +
          dy * dy <=
        30 * 30
      ) {
        return tower;
      }
    }

    return null;
  }

  getTower(
    towerId: number
  ): Tower | null {
    return (
      this.towers.find(
        (tower) =>
          tower.id === towerId
      ) ?? null
    );
  }

  getState() {
    return {
      health: this.health,
      currency: this.currency,
      score: this.score,
      wave: this.wave,

      paused: this.paused,
      victory: this.victory,
      gameOver: this.gameOver,

      enemies:
        this.enemies.length,

      towers:
        this.towers.length,

      projectiles:
        this.projectiles.length,
    };
  }

  render() {
    const ctx = this.ctx;

    ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    ctx.fillStyle =
      "#0f172a";

    ctx.fillRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    this.drawPath();
    this.drawTowers();
    this.drawProjectiles();
    this.drawEnemies();
    this.drawBase();
  }

  private drawPath() {
    const ctx = this.ctx;

    ctx.beginPath();

    ctx.moveTo(
      PATH[0].x,
      PATH[0].y
    );

    for (
      let i = 1;
      i < PATH.length;
      i++
    ) {
      ctx.lineTo(
        PATH[i].x,
        PATH[i].y
      );
    }

    ctx.strokeStyle =
      "#334155";

    ctx.lineWidth = 60;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.stroke();

    ctx.strokeStyle =
      "#64748b";

    ctx.lineWidth = 48;

    ctx.stroke();
  }

  private drawTowers() {
    const ctx = this.ctx;

    for (
      const tower of this.towers
    ) {
      const data =
        TOWER_DATA[
          tower.type
        ];

      ctx.beginPath();

      ctx.arc(
        tower.x,
        tower.y,
        22,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        data.color;

      ctx.fill();

      ctx.strokeStyle =
        "#ffffff";

      ctx.lineWidth = 2;

      ctx.stroke();

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 11px Arial";

      ctx.textAlign =
        "center";

      ctx.fillText(
        `L${tower.level}`,
        tower.x,
        tower.y + 4
      );
    }
  }

  private drawProjectiles() {
    const ctx = this.ctx;

    for (
      const projectile of
        this.projectiles
    ) {
      ctx.beginPath();

      ctx.arc(
        projectile.x,
        projectile.y,
        5,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        projectile.towerType ===
        "frost"
          ? "#38bdf8"
          : "#facc15";

      ctx.fill();
    }
  }

  private drawEnemies() {
    const ctx = this.ctx;

    for (
      const enemy of this.enemies
    ) {
      const data =
        ENEMY_DATA[
          enemy.type
        ];

      ctx.beginPath();

      ctx.arc(
        enemy.x,
        enemy.y,
        enemy.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        data.color;

      ctx.fill();

      ctx.strokeStyle =
        "#ffffff";

      ctx.lineWidth = 1;

      ctx.stroke();

      const barWidth =
        enemy.radius *
        2.5;

      ctx.fillStyle =
        "#111827";

      ctx.fillRect(
        enemy.x -
          barWidth / 2,
        enemy.y -
          enemy.radius -
          9,
        barWidth,
        5
      );

      ctx.fillStyle =
        "#22c55e";

      ctx.fillRect(
        enemy.x -
          barWidth / 2,
        enemy.y -
          enemy.radius -
          9,
        barWidth *
          Math.max(
            0,
            enemy.hp /
              enemy.maxHp
          ),
        5
      );
    }
  }

  private drawBase() {
    const ctx = this.ctx;

    const base =
      PATH[
        PATH.length - 1
      ];

    ctx.fillStyle =
      "#2563eb";

    ctx.fillRect(
      base.x - 30,
      base.y - 30,
      60,
      60
    );

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "bold 14px Arial";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "BASE",
      base.x,
      base.y + 5
    );
  }
}