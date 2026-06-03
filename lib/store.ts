"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccessibilitySettings, Difficulty, GameMode, Language, Player, Topic } from "@/types/app";
import { xpForWin } from "@/lib/math";

type AppState = {
  language: Language;
  difficulty: Difficulty;
  topic: Topic;
  mode: GameMode;
  player: Player;
  settings: AccessibilitySettings;
  unlockedThemes: string[];
  setLanguage: (language: Language) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setTopic: (topic: Topic) => void;
  setMode: (mode: GameMode) => void;
  updateProfile: (profile: Partial<Player>) => void;
  toggleSetting: (key: keyof AccessibilitySettings) => void;
  completeChallenge: (accuracy?: number) => void;
  claimDailyReward: () => void;
};

const defaultPlayer: Player = {
  id: "local-child",
  parentName: "",
  childName: "Child",
  avatar: "rocket",
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  completedLessons: 0,
  accuracy: 0,
  bestScore: 0,
  fastestTime: 0
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: "en",
      difficulty: "easy",
      topic: "addition",
      mode: "race",
      player: defaultPlayer,
      settings: {
        dyslexiaFont: false,
        voiceSupport: true,
        largeText: false,
        highContrast: false,
        soundEffects: true
      },
      unlockedThemes: [],
      setLanguage: (language) => set({ language }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setTopic: (topic) => set({ topic }),
      setMode: (mode) => set({ mode }),
      updateProfile: (profile) => set((state) => ({ player: { ...state.player, ...profile } })),
      toggleSetting: (key) =>
        set((state) => ({ settings: { ...state.settings, [key]: !state.settings[key] } })),
      completeChallenge: (accuracy = 100) => {
        const { difficulty, player } = get();
        const gain = xpForWin(difficulty, player.streak);
        const nextXp = player.xp + gain;
        const nextLevel = player.level + Math.floor(nextXp / 1000);
        const completedLessons = player.completedLessons + 1;
        set({
          player: {
            ...player,
            xp: nextXp % 1000,
            level: nextLevel,
            coins: player.coins + Math.round(gain / 5),
            streak: player.streak + 1,
            completedLessons,
            accuracy: Math.round((player.accuracy * player.completedLessons + accuracy) / completedLessons),
            bestScore: Math.max(player.bestScore, player.bestScore + gain)
          }
        });
      },
      claimDailyReward: () => {
        const { player } = get();
        const nextXp = player.xp + 50;
        set({
          player: {
            ...player,
            xp: nextXp % 1000,
            level: player.level + Math.floor(nextXp / 1000),
            coins: player.coins + 12
          }
        });
      }
    }),
    { name: "math-quest-state-v2", skipHydration: true }
  )
);
