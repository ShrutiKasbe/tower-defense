import type { EnemyType, TowerType } from "./types";

export const TOWER_DATA: Record<
  TowerType,
  {
    name: string;
    cost: number;
    range: number;
    damage: number;
    fireRate: number;
    color: string;
    description: string;
  }
> = {
  archer: {
    name: "Archer",
    cost: 100,
    range: 170,
    damage: 25,
    fireRate: 0.55,
    color: "#22c55e",
    description: "Fast single-target damage",
  },

  cannon: {
    name: "Cannon",
    cost: 180,
    range: 140,
    damage: 70,
    fireRate: 1.6,
    color: "#f97316",
    description: "Heavy area damage",
  },

  frost: {
    name: "Frost",
    cost: 150,
    range: 150,
    damage: 12,
    fireRate: 0.8,
    color: "#38bdf8",
    description: "Slows enemies",
  },
};

export const ENEMY_DATA: Record<
  EnemyType,
  {
    hp: number;
    speed: number;
    reward: number;
    radius: number;
    color: string;
  }
> = {
  basic: {
    hp: 100,
    speed: 65,
    reward: 20,
    radius: 14,
    color: "#ef4444",
  },

  runner: {
    hp: 70,
    speed: 110,
    reward: 25,
    radius: 11,
    color: "#facc15",
  },

  tank: {
    hp: 350,
    speed: 38,
    reward: 60,
    radius: 19,
    color: "#a855f7",
  },

  boss: {
    hp: 1500,
    speed: 28,
    reward: 250,
    radius: 28,
    color: "#dc2626",
  },
};