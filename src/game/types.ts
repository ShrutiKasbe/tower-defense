export type TowerType = "archer" | "cannon" | "frost";

export type EnemyType = "basic" | "runner" | "tank" | "boss";

export type Point = {
  x: number;
  y: number;
};

export type Enemy = {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  waypoint: number;

  hp: number;
  maxHp: number;
  speed: number;

  reward: number;
  radius: number;
  slowMultiplier: number;
  slowTimer: number;
};

export type Tower = {
  id: number;
  type: TowerType;

  x: number;
  y: number;

  level: number;
  range: number;
  damage: number;
  fireRate: number;
  cooldown: number;

  upgradeCost: number;
  totalSpent: number;
};

export type Projectile = {
  id: number;

  x: number;
  y: number;

  targetId: number;

  damage: number;
  speed: number;

  towerType: TowerType;
  splashRadius: number;
  slowAmount: number;
};