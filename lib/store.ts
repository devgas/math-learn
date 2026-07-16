"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccessibilitySettings, Difficulty, GameMode, Language, Player, Topic } from "@/types/app";
import { achievements } from "@/config/game";
import { xpForWin } from "@/lib/math";

type AppState = {
  language: Language;
  difficulty: Difficulty;
  topic: Topic;
  mode: GameMode;
  player: Player;
  settings: AccessibilitySettings;
  unlockedThemes: string[];
  missionCorrect: number;
  missionStart: number;
  setLanguage: (language: Language) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setTopic: (topic: Topic) => void;
  setMode: (mode: GameMode) => void;
  updateProfile: (profile: Partial<Player>) => void;
  toggleSetting: (key: keyof AccessibilitySettings) => void;
  startMission: () => void;
  recordAttempt: (correct: boolean) => number;
  finishMission: () => { leveledUp: boolean; newAchievements: string[] };
  claimDailyReward: () => boolean;
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
  fastestTime: 0,
  lastClaimedDate: "",
  unlockedAchievements: [],
  lastLevel: 1
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

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
      missionCorrect: 0,
      missionStart: 0,
      setLanguage: (language) => set({ language }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setTopic: (topic) => set({ topic }),
      setMode: (mode) => set({ mode }),
      updateProfile: (profile) => set((state) => ({ player: { ...state.player, ...profile } })),
      toggleSetting: (key) =>
        set((state) => ({ settings: { ...state.settings, [key]: !state.settings[key] } })),
      startMission: () => set({ missionCorrect: 0, missionStart: Date.now() }),
      recordAttempt: (correct) => {
        const { difficulty, player, missionCorrect } = get();
        if (!correct) {
          const completedLessons = player.completedLessons + 1;
          set({
            player: {
              ...player,
              completedLessons,
              accuracy: Math.round((player.accuracy * (completedLessons - 1)) / completedLessons)
            }
          });
          return player.streak;
        }

        const gain = xpForWin(difficulty, player.streak);
        const nextXp = player.xp + gain;
        const nextLevel = Math.floor(nextXp / 1000) + 1;
        const completedLessons = player.completedLessons + 1;
        const prevCorrect = missionCorrect + 1;
        set({
          missionCorrect: prevCorrect,
          player: {
            ...player,
            xp: nextXp % 1000,
            level: nextLevel,
            coins: player.coins + Math.round(gain / 5),
            streak: player.streak + 1,
            completedLessons,
            accuracy: Math.round((player.accuracy * (completedLessons - 1) + 100) / completedLessons)
          }
        });
        return player.streak + 1;
      },
      finishMission: () => {
        const { player, missionCorrect, missionStart } = get();
        const score = missionCorrect * 100;
        const elapsed = Math.max(1, Math.round((Date.now() - missionStart) / 1000));

        const nextBest = Math.max(player.bestScore, score);
        const nextFastest = player.fastestTime === 0 ? elapsed : Math.min(player.fastestTime, elapsed);

        const unlocked = achievements
          .filter((item) => !player.unlockedAchievements.includes(item.id) && isAchievementEarned(item.id, player))
          .map((item) => item.id);

        const leveledUp = player.level > player.lastLevel;

        set({
          player: {
            ...player,
            bestScore: nextBest,
            fastestTime: nextFastest,
            lastLevel: player.level,
            unlockedAchievements: [...player.unlockedAchievements, ...unlocked]
          }
        });

        return { leveledUp, newAchievements: unlocked };
      },
      claimDailyReward: () => {
        const { player } = get();
        const key = todayKey();
        if (player.lastClaimedDate === key) {
          return false;
        }
        const nextXp = player.xp + 50;
        set({
          player: {
            ...player,
            xp: nextXp % 1000,
            level: Math.floor(nextXp / 1000) + 1,
            coins: player.coins + 12,
            lastClaimedDate: key
          }
        });
        return true;
      }
    }),
    { name: "math-quest-state-v2", skipHydration: true }
  )
);

function isAchievementEarned(id: string, player: Player) {
  if (id === "first-win") return player.completedLessons >= 1;
  if (id === "streak-7") return player.streak >= 7;
  if (id === "boss-clear") return player.completedLessons >= 10;
  if (id === "geometry-pro") return player.completedLessons >= 5;
  return false;
}
