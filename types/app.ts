export type Language = "en" | "uk" | "cs";
export type Difficulty = "easy" | "medium" | "hard";
export type Topic =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "fractions"
  | "geometry"
  | "logic"
  | "timed";

export type GameMode = "race" | "space" | "puzzle" | "timeAttack" | "memory" | "boss";

export type Player = {
  id: string;
  parentName: string;
  childName: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  completedLessons: number;
  accuracy: number;
  bestScore: number;
  fastestTime: number;
  lastClaimedDate: string;
  unlockedAchievements: string[];
  lastLevel: number;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  accuracy: number;
  fastestTime: number;
  medal: "gold" | "silver" | "bronze" | "none";
};

export type MissionResultPayload = {
  child_id: string;
  child_name: string;
  avatar: string;
  topic: Topic;
  difficulty: Difficulty;
  game_mode: GameMode;
  score: number;
  accuracy: number;
  fastest_time: number;
};

export type LessonAttemptRow = {
  id: string;
  child_id: string;
  topic: string;
  difficulty: string;
  game_mode: string;
  score: number;
  accuracy: number;
  fastest_time: number | null;
  created_at: string;
};

export type LeaderboardEntryRow = {
  id: string;
  child_id: string;
  child_name: string;
  avatar: string;
  score: number;
  accuracy: number;
  fastest_time: number;
  week_start: string;
  updated_at: string;
};

export type LeaderboardSaveResponse =
  | {
      mode: "demo";
      saved: false;
      payload: MissionResultPayload;
    }
  | {
      mode: "guest";
      saved: false;
    }
  | {
      mode: "saved";
      attempt: LessonAttemptRow;
      entry: LeaderboardEntryRow;
    };

export type AccessibilitySettings = {
  dyslexiaFont: boolean;
  voiceSupport: boolean;
  largeText: boolean;
  highContrast: boolean;
  soundEffects: boolean;
};
