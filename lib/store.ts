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
  finishMission: () => { leveledUp: boolean; newAchievements: string[]; score: number; elapsed: number };
  claimDailyReward: () => boolean;
};

const defaultPlayer: Player = {
  id: "local-child",
  parentName: "",
  childName: "Child",
  avatar: "rocket",
  level: 1,
  totalXp: 0,
  xp: 0,
  coins: 0,
  streak: 0,
  completedLessons: 0,
  totalAttempts: 0,
  accuracy: 0,
  bestScore: 0,
  fastestTime: 0,
  lastClaimedDate: "",
  unlockedAchievements: [],
  lastLevel: 1
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePlayer(value: unknown): Player {
  const storedPlayer = isRecord(value) ? value : {};
  const level = typeof storedPlayer.level === "number" ? storedPlayer.level : defaultPlayer.level;
  const xp = typeof storedPlayer.xp === "number" ? storedPlayer.xp : defaultPlayer.xp;
  const totalXp = typeof storedPlayer.totalXp === "number" ? storedPlayer.totalXp : Math.max(0, (level - 1) * 1000 + xp);
  const completedLessons =
    typeof storedPlayer.completedLessons === "number" ? storedPlayer.completedLessons : defaultPlayer.completedLessons;
  const totalAttempts =
    typeof storedPlayer.totalAttempts === "number" ? storedPlayer.totalAttempts : completedLessons;

  return {
    ...defaultPlayer,
    ...storedPlayer,
    totalXp,
    xp: totalXp % 1000,
    level: Math.floor(totalXp / 1000) + 1,
    completedLessons,
    totalAttempts,
    unlockedAchievements: Array.isArray(storedPlayer.unlockedAchievements)
      ? storedPlayer.unlockedAchievements.filter((item): item is string => typeof item === "string")
      : [],
    lastLevel: typeof storedPlayer.lastLevel === "number" ? storedPlayer.lastLevel : level
  };
}

function normalizeSettings(value: unknown): AccessibilitySettings {
  return {
    dyslexiaFont: isRecord(value) && typeof value.dyslexiaFont === "boolean" ? value.dyslexiaFont : false,
    voiceSupport: isRecord(value) && typeof value.voiceSupport === "boolean" ? value.voiceSupport : true,
    largeText: isRecord(value) && typeof value.largeText === "boolean" ? value.largeText : false,
    highContrast: isRecord(value) && typeof value.highContrast === "boolean" ? value.highContrast : false,
    soundEffects: isRecord(value) && typeof value.soundEffects === "boolean" ? value.soundEffects : true
  };
}

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
      updateProfile: (profile) => set((state) => ({ player: normalizePlayer({ ...state.player, ...profile }) })),
      toggleSetting: (key) =>
        set((state) => ({ settings: { ...state.settings, [key]: !state.settings[key] } })),
      startMission: () => set({ missionCorrect: 0, missionStart: Date.now() }),
      recordAttempt: (correct) => {
        const { difficulty, player, missionCorrect } = get();
        const totalAttempts = player.totalAttempts + 1;
        if (!correct) {
          set({
            player: {
              ...player,
              totalAttempts,
              accuracy: Math.round((player.accuracy * player.totalAttempts) / totalAttempts)
            }
          });
          return player.streak;
        }

        const gain = xpForWin(difficulty, player.streak);
        const nextTotalXp = player.totalXp + gain;
        const completedLessons = player.completedLessons + 1;
        const prevCorrect = missionCorrect + 1;
        set({
          missionCorrect: prevCorrect,
          player: {
            ...player,
            totalXp: nextTotalXp,
            xp: nextTotalXp % 1000,
            level: Math.floor(nextTotalXp / 1000) + 1,
            coins: player.coins + Math.round(gain / 5),
            streak: player.streak + 1,
            completedLessons,
            totalAttempts,
            accuracy: Math.round((player.accuracy * player.totalAttempts + 100) / totalAttempts)
          }
        });
        return player.streak + 1;
      },
      finishMission: () => {
        const { missionCorrect, missionStart } = get();
        const player = normalizePlayer(get().player);
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

        return { leveledUp, newAchievements: unlocked, score, elapsed };
      },
      claimDailyReward: () => {
        const { player } = get();
        const key = todayKey();
        if (player.lastClaimedDate === key) {
          return false;
        }
        const nextTotalXp = player.totalXp + 50;
        set({
          player: {
            ...player,
            totalXp: nextTotalXp,
            xp: nextTotalXp % 1000,
            level: Math.floor(nextTotalXp / 1000) + 1,
            coins: player.coins + 12,
            lastClaimedDate: key
          }
        });
        return true;
      }
    }),
    {
      name: "math-quest-state-v2",
      skipHydration: true,
      merge: (persistedState, currentState) => {
        const storedState = isRecord(persistedState) ? persistedState : {};
        const nextState = { ...currentState, ...storedState };

        return {
          ...nextState,
          player: normalizePlayer(nextState.player),
          settings: normalizeSettings(nextState.settings),
          unlockedThemes: Array.isArray(nextState.unlockedThemes) ? nextState.unlockedThemes.filter((item): item is string => typeof item === "string") : []
        };
      }
    }
  )
);

function isAchievementEarned(id: string, player: Player) {
  if (id === "first-win") return player.completedLessons >= 1;
  if (id === "streak-7") return player.streak >= 7;
  if (id === "boss-clear") return player.completedLessons >= 10;
  if (id === "geometry-pro") return player.completedLessons >= 5;
  return false;
}
