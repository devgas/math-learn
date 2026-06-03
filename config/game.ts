import type { Difficulty, GameMode, LeaderboardEntry, Topic } from "@/types/app";

export const difficultyConfig: Record<Difficulty, { max: number; time: number; multiplier: number; complexity: string }> = {
  easy: { max: 20, time: 60, multiplier: 1, complexity: "singleStep" },
  medium: { max: 100, time: 45, multiplier: 1.6, complexity: "twoStep" },
  hard: { max: 500, time: 30, multiplier: 2.4, complexity: "mixedLogic" }
};

export const topics: Topic[] = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "fractions",
  "geometry",
  "logic",
  "timed"
];

export const gameModes: GameMode[] = ["race", "space", "puzzle", "timeAttack", "memory", "boss"];

export const avatars = ["rocket", "robot", "wizard", "ninja", "builder", "astronaut"];

export const achievements = [
  { id: "first-win", icon: "Star", xp: 50 },
  { id: "streak-7", icon: "Flame", xp: 120 },
  { id: "boss-clear", icon: "Crown", xp: 250 },
  { id: "geometry-pro", icon: "Shapes", xp: 180 }
];

export const leaderboard: LeaderboardEntry[] = [];
