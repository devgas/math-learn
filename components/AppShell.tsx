"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  Award,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Contrast,
  Crown,
  Flame,
  Gamepad2,
  Globe2,
  LockKeyhole,
  Medal,
  Mic2,
  MoonStar,
  Play,
  Puzzle,
  Rocket,
  Settings,
  Shapes,
  ShieldCheck,
  Sparkles,
  Star,
  TextCursorInput,
  Timer,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { StatCard } from "@/components/StatCard";
import { achievements, avatars, difficultyConfig, gameModes, topics } from "@/config/game";
import type { LeaderboardEntry } from "@/types/app";
import { makeEquation } from "@/lib/math";
import { useAppStore } from "@/lib/store";
import { translate } from "@/lib/i18n";
import type { Difficulty, Language, Topic } from "@/types/app";

const medalClass = {
  gold: "bg-mango text-ink",
  silver: "bg-slate-200 text-ink",
  bronze: "bg-orange-200 text-ink",
  none: "bg-slate-100 text-slate-600"
};

const modeIcon: Record<string, LucideIcon> = {
  race: Rocket,
  space: Sparkles,
  puzzle: Puzzle,
  timeAttack: Timer,
  memory: Brain,
  boss: Flame
};

const achievementIcon: Record<string, LucideIcon> = {
  Star,
  Flame,
  Crown,
  Shapes
};

function celebrate() {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.62 } });
}

export function AppShell() {
  const missionRounds = 5;
  const {
    language,
    difficulty,
    topic,
    mode,
    player,
    settings,
    setLanguage,
    setDifficulty,
    setTopic,
    setMode,
    updateProfile,
    toggleSetting,
    startMission: startMissionStats,
    recordAttempt,
    finishMission,
    claimDailyReward
  } = useAppStore();
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => translate(language, key);
  const [answer, setAnswer] = useState("");
  const answerInputRef = useRef<HTMLInputElement>(null);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  useEffect(() => {
    setDailyClaimed(player.lastClaimedDate === new Date().toISOString().slice(0, 10));
  }, [player.lastClaimedDate]);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [missionSaveState, setMissionSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [missionSaveMessage, setMissionSaveMessage] = useState("");
  const [memoryTries, setMemoryTries] = useState(0);
  const [memoryFeedback, setMemoryFeedback] = useState("");
  const [answerState, setAnswerState] = useState<"idle" | "correct" | "wrong">("idle");
  const [shakeKey, setShakeKey] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(difficultyConfig[difficulty].time);
  const [leaderboardScope, setLeaderboardScope] = useState("global");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [round, setRound] = useState(1);
  const [missionComplete, setMissionComplete] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [flowStep, setFlowStep] = useState<1 | 2 | 3>(1);
  const gamesSectionRef = useRef<HTMLElement>(null);
  const [difficultyTouched, setDifficultyTouched] = useState(false);
  const [modeTouched, setModeTouched] = useState(false);
  const [topicTouched, setTopicTouched] = useState(false);
  const equation = useMemo(() => makeEquation(topic, difficulty, round), [topic, difficulty, round]);
  const isAuthenticated = Boolean(player.parentName);

  const rootClasses = [
    "min-h-screen",
    "font-sans",
    settings.largeText ? "large-text" : "",
    settings.dyslexiaFont ? "dyslexia-font" : "",
    settings.highContrast ? "high-contrast" : ""
  ].join(" ");

  function leaderboardTabClass(scope: string) {
    return "rounded-full px-3 py-1 " + (leaderboardScope === scope ? "bg-white shadow-sm" : "");
  }

  function focusAnswerInput() {
    answerInputRef.current?.focus({ preventScroll: true });
  }

  function restartMission(nextDifficulty: Difficulty = difficulty) {
    setMissionComplete(false);
    setLevelUp(false);
    setRound(1);
    setAnswer("");
    setMissionSaveState("idle");
    setMissionSaveMessage("");
    setMemoryTries(0);
    setMemoryFeedback("");
    setAnswerState("idle");
    setTimeRemaining(difficultyConfig[nextDifficulty].time);
    requestAnimationFrame(focusAnswerInput);
  }

  function scrollGamesIntoView() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        gamesSectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    });
  }

  function changeDifficulty(nextDifficulty: Difficulty) {
    setDifficultyTouched(true);
    setDifficulty(nextDifficulty);
    setFlowStep(2);
    restartMission(nextDifficulty);
  }

  function changeMode(nextMode: typeof mode) {
    setModeTouched(true);
    setMode(nextMode);
    setFlowStep(3);
    restartMission();
  }

  function changeTopic(nextTopic: Topic) {
    setTopicTouched(true);
    setTopic(nextTopic);
    restartMission();
  }

  function startMission() {
    setFlowStep(1);
    startMissionStats();
    restartMission();
    scrollGamesIntoView();
  }

  function jumpToStep(step: 1 | 2 | 3) {
    setFlowStep(step);
    startMissionStats();
    restartMission();
  }

  function advanceRound() {
    setAnswer("");
    setAnswerState("idle");
    setMemoryTries(0);
    setMemoryFeedback("");

    if (round >= missionRounds) {
      const result = finishMission();
      if (result.leveledUp) {
        setLevelUp(result.leveledUp);
        celebrate();
      }
      setMissionComplete(true);
      return;
    }

    setRound((value) => value + 1);
    requestAnimationFrame(focusAnswerInput);
  }

  const saveMissionResult = useCallback(async () => {
    if (!isAuthenticated || missionSaveState === "saving" || player.id === "local-child") {
      return;
    }

    setMissionSaveState("saving");
    setMissionSaveMessage("");

    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: player.id,
          child_name: player.childName,
          avatar: player.avatar,
          topic,
          difficulty,
          game_mode: mode,
          score: player.bestScore,
          accuracy: player.accuracy,
          fastest_time: player.fastestTime || difficultyConfig[difficulty].time
        })
      });
      const payload = (await response.json()) as { mode?: string; error?: string };

      if (!response.ok) {
        setMissionSaveState("error");
        setMissionSaveMessage(payload.error ?? t("authFailed"));
        return;
      }

      if (payload.mode === "saved") {
        setMissionSaveState("saved");
        setMissionSaveMessage(t("missionSavedHint"));
        return;
      }

      setMissionSaveState("error");
      setMissionSaveMessage(t("missionSaveUnavailable"));
    } catch {
      setMissionSaveState("error");
      setMissionSaveMessage(t("authFailed"));
    }
  }, [difficulty, isAuthenticated, missionSaveState, mode, player.avatar, player.bestScore, player.childName, player.fastestTime, player.id, t, topic]);

  useEffect(() => {
    if (missionComplete && isAuthenticated && missionSaveState === "idle") {
      void saveMissionResult();
    }
  }, [isAuthenticated, missionComplete, missionSaveState, saveMissionResult]);

  useEffect(() => {
    let active = true;
    async function loadLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        const payload = (await response.json()) as { entries?: Array<Record<string, unknown>> };
        if (!active || !Array.isArray(payload.entries)) {
          return;
        }
        const entries: LeaderboardEntry[] = payload.entries.map((row, index) => ({
          id: String(row.id ?? index),
          name: String(row.child_name ?? "Player"),
          avatar: String(row.avatar ?? "rocket"),
          score: Number(row.score ?? 0),
          accuracy: Number(row.accuracy ?? 0),
          fastestTime: Number(row.fastest_time ?? 0),
          medal: index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "none"
        }));
        setLeaderboardData(entries);
      } catch {
        setLeaderboardData([]);
      } finally {
        if (active) {
          setLeaderboardLoading(false);
        }
      }
    }
    void loadLeaderboard();
    return () => {
      active = false;
    };
  }, [missionSaveState]);

  useEffect(() => {
    if (mode === "timeAttack" && !missionComplete) {
      setTimeRemaining(difficultyConfig[difficulty].time);
    }
    setMemoryTries(0);
    setMemoryFeedback("");
  }, [difficulty, missionComplete, mode]);

  useEffect(() => {
    if (mode !== "timeAttack" || missionComplete) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setMissionComplete(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [missionComplete, mode]);

  function renderModeStage() {
    if (mode === "race") {
      const progress = Math.min(100, ((round - 1) / missionRounds) * 100);

      return (
        <div className="mb-4 rounded-2xl bg-white/10 p-4">
          <div className="mb-3 flex items-center justify-between text-sm font-bold text-mango">
            <span>{t("raceGoal")}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="relative h-12 rounded-full bg-white/15 p-1">
            <div className="h-full rounded-full bg-aqua transition-[width] duration-300" style={{ width: `${Math.max(12, progress)}%` }} />
            <Rocket aria-hidden className="absolute top-3 h-6 w-6 text-mango transition-[left] duration-300" style={{ left: `${Math.max(8, Math.min(88, progress))}%` }} />
          </div>
        </div>
      );
    }

    if (mode === "space") {
      return (
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[equation.answer, Number(equation.answer) + 2 || 8, Number(equation.answer) + 5 || 11].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setAnswer(String(item));
                focusAnswerInput();
              }}
              className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-xl font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              {item}
            </button>
          ))}
        </div>
      );
    }

    if (mode === "puzzle") {
      const unlockedPieces = Math.max(1, player.completedLessons % 9);

      return (
        <div className="mb-4 rounded-2xl bg-white/10 p-4">
          <div className="mb-3 flex items-center justify-between text-sm font-bold text-mango">
            <span>{t("puzzleBoard")}</span>
            <span>{unlockedPieces}/9</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setAnswer(String(equation.answer));
                  focusAnswerInput();
                }}
                className={`grid h-16 place-items-center rounded-xl border text-lg font-black ${index < unlockedPieces ? "border-mango bg-mango text-ink" : "border-white/20 bg-white/10 text-white/70"}`}
              >
                {index < unlockedPieces ? index + 1 : "?"}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (mode === "timeAttack") {
      return (
        <div className="mb-4 rounded-2xl bg-coral p-4 text-ink">
          <div className="flex items-center justify-between font-black">
            <span>{t("timeLeft")}</span>
            <span>{timeRemaining}s</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/50">
            <div
              className="h-full rounded-full bg-ink transition-[width] duration-300"
              style={{ width: `${Math.max(0, (timeRemaining / difficultyConfig[difficulty].time) * 100)}%` }}
            />
          </div>
        </div>
      );
    }

    if (mode === "memory") {
      return (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <button type="button" className="rounded-2xl border border-white/15 bg-white/10 p-4 font-black text-white">
            {equation.prompt}
          </button>
          <button
            type="button"
            onClick={() => {
              setAnswer(String(equation.answer));
              focusAnswerInput();
            }}
            className="rounded-2xl border border-white/15 bg-white/10 p-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            {equation.answer}
          </button>
          {memoryFeedback ? <p className="col-span-2 rounded-2xl bg-white/10 p-3 text-sm font-bold text-white/85">{memoryFeedback}</p> : null}
        </div>
      );
    }

    return (
      <div className="mb-4 rounded-2xl bg-white/10 p-4">
        <div className="mb-3 flex items-center justify-between font-black text-mango">
          <span>{t("bossHp")}</span>
          <span>{Math.max(10, 100 - ((round - 1) * 20))}%</span>
        </div>
        <div className="h-5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-coral transition-[width] duration-300" style={{ width: `${Math.max(10, 100 - ((round - 1) * 20))}%` }} />
        </div>
      </div>
    );
  }

  async function handleAuthSubmit() {
    const submittedEmail = authEmail.trim();
    const submittedPassword = authPassword;

    if (!submittedEmail || !submittedPassword) {
      setAuthMessage(t("authRequired"));
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: submittedEmail,
          password: submittedPassword,
          childName: player.childName,
          avatar: player.avatar
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        setAuthMessage(payload.error ?? t("authFailed"));
        return;
      }

      updateProfile({
        parentName: payload.user?.email ?? submittedEmail,
        id: payload.profile?.id ?? player.id,
        childName: payload.profile?.name ?? player.childName,
        avatar: payload.profile?.avatar ?? player.avatar,
        level: payload.profile?.level ?? player.level,
        xp: payload.profile?.xp ?? player.xp,
        coins: payload.profile?.coins ?? player.coins,
        streak: payload.profile?.streak ?? player.streak,
        completedLessons: payload.profile?.completed_lessons ?? player.completedLessons,
        accuracy: payload.profile?.accuracy ?? player.accuracy
      });
      setAuthMessage(payload.status === "logged_in" ? t("authLoggedIn") : payload.status === "confirmation_required" ? t("authConfirmEmail") : t("authRegistered"));
    } catch {
      setAuthMessage(t("authFailed"));
    } finally {
      setAuthLoading(false);
    }
  }

  function solveChallenge() {
    if (missionComplete) {
      return;
    }

    const isCorrect = String(equation.answer).trim().toLowerCase() === answer.trim().toLowerCase();
    if (isCorrect) {
      setAnswerState("correct");
      recordAttempt(true);
      celebrate();
      if (settings.voiceSupport && "speechSynthesis" in window) {
        speechSynthesis.speak(new SpeechSynthesisUtterance(t("correct")));
      }
      if (mode === "memory") {
        setMemoryFeedback("");
      }
      setTimeout(() => {
        advanceRound();
      }, 480);
      return;
    }

    setAnswerState("wrong");
    setShakeKey((value) => value + 1);
    if (settings.voiceSupport && "speechSynthesis" in window) {
      speechSynthesis.speak(new SpeechSynthesisUtterance(t("wrong")));
    }

    if (mode === "memory") {
      if (memoryTries === 0) {
        setMemoryTries(1);
        setMemoryFeedback(t("memoryTryAgain"));
        setAnswer("");
        setAnswerState("idle");
        requestAnimationFrame(focusAnswerInput);
        return;
      }

      recordAttempt(false);
      setMemoryFeedback(`${t("correct")}: ${equation.answer}`);
      setAnswer("");
      setTimeout(() => {
        advanceRound();
      }, 900);
      return;
    }

    recordAttempt(false);
    setTimeout(() => setAnswerState("idle"), 600);
  }

  function skipChallenge() {
    if (missionComplete) {
      return;
    }

    setAnswerState("idle");
    advanceRound();
  }

  return (
    <main className={rootClasses}>
      <section className="relative overflow-hidden bg-[#dff8f5]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,#ffcf72_0_5%,transparent_6%),radial-gradient(circle_at_88%_16%,#66a6ff_0_6%,transparent_7%),radial-gradient(circle_at_78%_86%,#ff8a7d_0_5%,transparent_6%)] opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
          <nav className="col-span-full flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2 backdrop-blur sm:px-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white">
                <Brain aria-hidden className="h-7 w-7" />
              </div>
              <strong className="text-xl">{t("appName")}</strong>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-soft" href="#login">
                {t("login")}
              </a>
              <button
                type="button"
                onClick={startMission}
                className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-soft"
              >
                {t("startMission")}
              </button>
            </div>
          </nav>

          <motion.div
            className="pb-10 pt-8 sm:pt-12 lg:pb-14"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {isAuthenticated ? (
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-aqua shadow-soft">
                <Sparkles aria-hidden className="h-4 w-4" /> {t("dailyReward")}
              </p>
            ) : null}
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">{t("heroSubtitle")}</p>
          </motion.div>

          {isAuthenticated ? (
            <motion.aside className="contrast-surface mb-8 rounded-3xl border border-white bg-white/92 p-5 shadow-soft lg:mt-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarBadge avatar={player.avatar} size="lg" />
                  <div>
                    <p className="text-sm text-slate-500">{t("childProfile")}</p>
                    <h2 className="text-2xl font-black">{player.childName}</h2>
                  </div>
                </div>
                <div className="rounded-2xl bg-leaf px-3 py-2 text-center text-sm font-black text-white">
                  LVL {player.level}
                </div>
              </div>
              <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
                <motion.div className="h-full rounded-full bg-aqua" style={{ width: `${player.xp / 10}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <strong className="rounded-2xl bg-[#fff3d8] p-3">
                  {player.streak}
                  <span className="block text-xs font-medium">{t("streak")}</span>
                </strong>
                <strong className="rounded-2xl bg-[#e2f8e6] p-3">
                  {player.coins}
                  <span className="block text-xs font-medium">{t("coins")}</span>
                </strong>
                <strong className="rounded-2xl bg-[#e9f0ff] p-3">
                  {player.completedLessons}
                  <span className="block text-xs font-medium">{t("completedLessons")}</span>
                </strong>
              </div>
            </motion.aside>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {isAuthenticated ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Trophy} label={t("bestScore")} value={player.bestScore} tone="bg-[#fff3d8] text-ink" />
            <StatCard icon={CheckCircle2} label={t("accuracy")} value={`${player.accuracy}%`} tone="bg-[#e2f8e6] text-ink" />
            <StatCard icon={Clock} label={t("fastestTime")} value={`${player.fastestTime}s`} tone="bg-[#e9f0ff] text-ink" />
            <StatCard icon={Coins} label={t("coins")} value={player.coins} tone="bg-[#ffe8e5] text-ink" />
          </section>
        ) : null}

        <section aria-label="Game flow" className="grid">
          <motion.div
            key={flowStep}
            className={`rounded-3xl border-2 bg-white p-5 shadow-soft ${
              flowStep === 1 ? "border-aqua" : flowStep === 2 ? "border-mango" : "border-ink"
            }`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {(
                [
                { step: 1, label: t("stepDifficulty") },
                { step: 2, label: t("stepGameMode") },
                { step: 3, label: t("stepMainBlock") }
                ] as const
              ).map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => jumpToStep(item.step)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 ${
                    flowStep === item.step ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-current/15 text-xs font-black">
                    {item.step}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl font-black ${
                  flowStep === 1 ? "bg-aqua text-white" : flowStep === 2 ? "bg-mango text-ink" : "bg-ink text-white"
                }`}
              >
                {flowStep}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-xs font-black uppercase tracking-wide ${
                    flowStep === 1 ? "text-aqua" : flowStep === 2 ? "text-mango" : "text-ink"
                  }`}
                >
                  {flowStep === 1 ? t("stepDifficulty") : flowStep === 2 ? t("stepGameMode") : t("stepMainBlock")}
                </p>
                <strong className="block truncate text-2xl">
                  {flowStep === 1 ? t(difficulty) : flowStep === 2 ? t(mode) : t("startMission")}
                </strong>
                <span className="block text-sm text-slate-500">
                  {flowStep === 1
                    ? t("stepDifficultyHint")
                    : flowStep === 2
                      ? t("stepGameModeHint")
                      : t("stepMainBlockHint")}
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="games" ref={gamesSectionRef} className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
          {flowStep === 1 ? (
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-aqua">1. {t("stepDifficulty")}</p>
                  <h2 className="text-2xl font-black">{t(difficulty)}</h2>
                </div>
                <Settings aria-hidden className="h-9 w-9 text-aqua" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["easy", "medium", "hard"] as Difficulty[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeDifficulty(item)}
                    className={`rounded-2xl border-2 p-4 text-left font-bold transition hover:-translate-y-1 ${
                      difficultyTouched && difficulty === item
                        ? "border-aqua bg-[#e2fbf7]"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    {t(item)}
                    <span className="mt-1 block text-sm font-normal">
                      x{difficultyConfig[item].multiplier} XP - {difficultyConfig[item].time}s
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : flowStep === 2 ? (
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-mango">2. {t("stepGameMode")}</p>
                  <h2 className="text-2xl font-black">{t(mode)}</h2>
                </div>
                <Gamepad2 aria-hidden className="h-9 w-9 text-coral" />
              </div>
              <div className="grid safe-grid gap-3">
                {gameModes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeMode(item)}
                    className={`group flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition hover:-translate-y-1 ${
                      modeTouched && mode === item ? "border-mango bg-[#fff4de]" : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-mango shadow-soft transition group-hover:scale-105">
                      {(() => {
                        const ModeIcon = modeIcon[item] ?? Play;
                        return <ModeIcon aria-hidden className="h-6 w-6" />;
                      })()}
                    </span>
                    <span className="min-w-0">
                      <strong className="block">{t(item)}</strong>
                      <span className="mt-1 block text-sm font-normal text-slate-500">{t(item + "Goal")}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : missionComplete ? (
            <div className="rounded-3xl bg-ink p-5 text-white">
              <p className="text-sm font-bold text-mango">3. {t("missionComplete")}</p>
              <h2 className="mt-2 text-3xl font-black">{t("missionCompleteTitle")}</h2>
              {levelUp ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-mango px-4 py-1.5 text-sm font-black text-ink">
                  <Star aria-hidden className="h-4 w-4" /> {t("levelUp")} {player.level}!
                </p>
              ) : null}
              <p className="mt-3 max-w-md text-sm font-bold text-white/75">
                {isAuthenticated
                  ? missionSaveState === "saved"
                    ? t("missionSavedHint")
                    : missionSaveState === "error"
                      ? missionSaveMessage || t("missionSaveUnavailable")
                      : t("missionSavedHint")
                  : t("missionSavePrompt")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={saveMissionResult}
                    disabled={missionSaveState === "saving"}
                    className="inline-flex min-h-12 items-center rounded-2xl bg-mango px-5 font-black text-ink transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {missionSaveState === "saving" ? t("loading") : t("saveRating")}
                  </button>
                ) : (
                  <>
                    <a href="#login" className="inline-flex min-h-12 items-center rounded-2xl bg-mango px-5 font-black text-ink transition hover:-translate-y-1">
                      {t("loginToSave")}
                    </a>
                    <button
                      type="button"
                      onClick={startMission}
                      className="inline-flex min-h-12 items-center rounded-2xl border border-white/20 bg-white/10 px-5 font-black text-white transition hover:-translate-y-1"
                    >
                      {t("continueAsGuest")}
                    </button>
                  </>
                )}
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={startMission}
                    className="inline-flex min-h-12 items-center rounded-2xl border border-white/20 bg-white/10 px-5 font-black text-white transition hover:-translate-y-1"
                  >
                    {t("startMission")}
                  </button>
                ) : null}
              </div>
              {isAuthenticated && missionSaveMessage ? <p className="mt-3 text-sm font-bold text-white/80">{missionSaveMessage}</p> : null}
            </div>
          ) : (
            <div key={shakeKey} className={`rounded-3xl bg-ink p-5 text-white ${answerState === "wrong" ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-mango">3. {t(mode)}</p>
                  <h2 aria-live="polite" className={`text-3xl font-black transition-colors ${answerState === "correct" ? "text-leaf" : answerState === "wrong" ? "text-coral" : ""}`}>{equation.prompt}</h2>
                  <p className="mt-2 max-w-sm text-sm font-bold text-white/70">{t(mode + "Goal")}</p>
                </div>
                <Zap aria-hidden className="h-10 w-10 text-mango" />
              </div>
              {answerState === "correct" ? (
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-1.5 text-sm font-black text-white">
                  <CheckCircle2 aria-hidden className="h-4 w-4" /> {t("correct")}
                </p>
              ) : answerState === "wrong" && mode !== "memory" ? (
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-coral px-4 py-1.5 text-sm font-black text-white">
                  <Zap aria-hidden className="h-4 w-4" /> {t("wrong")}
                </p>
              ) : null}
              {renderModeStage()}
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  ref={answerInputRef}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  className={`min-w-0 min-h-14 rounded-2xl border-0 px-4 text-xl font-black text-ink outline-none ring-4 transition ${
                    answerState === "correct"
                      ? "bg-leaf/15 ring-leaf"
                      : answerState === "wrong"
                        ? "bg-coral/15 ring-coral"
                        : "ring-transparent focus:ring-mango"
                  }`}
                  aria-label={t("answer")}
                  placeholder={t("answer")}
                />
                <div className="grid grid-cols-2 gap-3 md:flex">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={solveChallenge}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-mango px-4 font-black text-ink transition hover:-translate-y-1 md:flex-1 md:px-6"
                  >
                    {t("solve")} <ChevronRight aria-hidden className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={skipChallenge}
                    className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 font-black text-white transition hover:-translate-y-1 md:w-auto md:px-5"
                  >
                    {t("skip")}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {topics.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeTopic(item as Topic)}
                    className={`rounded-full border px-3 py-2 text-sm font-bold transition ${
                      topicTouched && topic === item ? "border-white bg-white text-ink" : "border-white/15 bg-white/10 text-white"
                    }`}
                  >
                    {t(item)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {isAuthenticated ? (
          <>
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <Award aria-hidden className="h-7 w-7 text-mango" /> {t("achievements")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.map((item, index) => {
                const unlocked = player.unlockedAchievements.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    className={`rounded-2xl border p-4 ${unlocked ? "border-leaf/40 bg-[#e2f8e6]" : "border-slate-100 bg-slate-50 opacity-75"}`}
                    whileHover={{ rotate: index % 2 ? -1 : 1, y: -4 }}
                  >
                    {(() => {
                      const AchIcon = achievementIcon[item.icon] ?? Star;
                      return <AchIcon aria-hidden className={`mb-3 h-7 w-7 ${unlocked ? "text-leaf" : "text-slate-400"}`} />;
                    })()}
                    <strong className="block">{t(`ach-${item.id}`)}</strong>
                    <p className="mt-1 text-sm text-slate-500">{t(`ach-${item.id}-desc`)}</p>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-black ${unlocked ? "bg-leaf/20 text-leaf" : "bg-slate-200 text-slate-500"}`}>
                      {unlocked ? `${t("unlocked")}` : `+${item.xp} XP`}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-2xl font-black">
                <Medal aria-hidden className="h-7 w-7 text-coral" /> {t("leaderboard")}
              </h2>
              <div className="flex rounded-full bg-slate-100 p-1 text-sm font-bold">
                {(["global", "friends", "weekly"] as const).map((item) => (
                  <button key={item} type="button" onClick={() => setLeaderboardScope(item)} className={leaderboardTabClass(item)}>
                    {t(item)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {leaderboardLoading ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-400">{t("loading")}</div>
              ) : leaderboardData.length ? (
                leaderboardData.slice(0, leaderboardScope === "weekly" ? 10 : 50).map((entry, index) => (
                  <div key={entry.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100">
                    <span className={`grid h-9 w-9 place-items-center rounded-full font-black shadow-soft ${medalClass[index < 3 ? (index === 0 ? "gold" : index === 1 ? "silver" : "bronze") : "none"]}`}>
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <AvatarBadge avatar={entry.avatar} size="sm" />
                      <div>
                        <strong>{entry.name}</strong>
                        <p className="text-xs text-slate-500">
                          {entry.accuracy}% - {entry.fastestTime}s
                        </p>
                      </div>
                    </div>
                    <strong><span className="text-aqua">{entry.score}</span><span className="text-xs text-slate-400 font-medium"> pts</span></strong>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  {t("noLeaderboard")}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <MoonStar aria-hidden className="h-7 w-7 text-sky" /> {t("dailyChallenges")}
            </h2>
            <div className="rounded-2xl bg-[#e9f0ff] p-4">
              <strong>{t("dailyReward")}</strong>
              <p className="mt-1 text-sm text-slate-600">+50 XP, +12 {t("coins").toLowerCase()}</p>
              <button
                type="button"
                disabled={dailyClaimed}
                onClick={() => {
                  if (!dailyClaimed) {
                    const claimed = claimDailyReward();
                    setDailyClaimed(claimed);
                  }
                }}
                className="mt-4 rounded-2xl bg-sky px-4 py-3 font-black text-white disabled:opacity-60"
              >
                {dailyClaimed ? t("claimed") : t("claim")}
              </button>
            </div>
          </div>
          <div className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <ShieldCheck aria-hidden className="h-7 w-7 text-leaf" /> {t("lessonProgress")}
            </h2>
            <div className="flex items-center gap-5">
              <ProgressRing value={player.accuracy} label={t("accuracy")} size={120} color="#66c36f" trackColor="#e6f3e6" />
              <div>
                <p className="text-sm text-slate-500">{t("xpProgress")}</p>
                <strong className="text-3xl">{player.xp}/1000</strong>
              </div>
            </div>
          </div>
          <div className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <Brain aria-hidden className="h-7 w-7 text-coral" /> {t("recommendation")}
            </h2>
            <p className="leading-7 text-slate-600">{t("recommendationText")}</p>
          </div>
        </section>

          </>
        ) : null}

        <section id="login" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <LockKeyhole aria-hidden className="h-7 w-7 text-aqua" /> {t("parentAccount")}
            </h2>
            <div className="grid gap-3">
              <input
                className="rounded-2xl bg-slate-50 p-4 outline-none focus:ring-4 focus:ring-aqua/30"
                placeholder="parent@email.com"
                name="parentEmail"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
              />
              <input
                className="rounded-2xl bg-slate-50 p-4 outline-none focus:ring-4 focus:ring-aqua/30"
                placeholder="Password"
                type="password"
                name="parentPassword"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={handleAuthSubmit}
                disabled={authLoading}
                className="rounded-2xl bg-ink p-4 font-black text-white disabled:opacity-60"
              >
                {authLoading ? t("loading") : t("register") + " / " + t("login")}
              </button>
              {authMessage ? <p className="text-sm font-bold text-leaf">{authMessage}</p> : null}
            </div>
          </div>
          <div className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <Users aria-hidden className="h-7 w-7 text-mango" /> {t("profile")}
            </h2>
            <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
              <input
                className="rounded-2xl bg-slate-50 p-4 outline-none focus:ring-4 focus:ring-mango/30"
                value={player.childName}
                onChange={(event) => updateProfile({ childName: event.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                {avatars.map((avatar) => (
                  <button key={avatar} type="button" onClick={() => updateProfile({ avatar })}>
                    <AvatarBadge avatar={avatar} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="contrast-surface rounded-3xl bg-white p-5 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
            <Settings aria-hidden className="h-7 w-7 text-ink" /> {t("settings")}
          </h2>
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
              <Globe2 aria-hidden className="h-5 w-5" />
              <select
                className="w-full bg-transparent outline-none"
                value={language}
                onChange={(event) => setLanguage(event.target.value as Language)}
              >
                <option value="en">English</option>
                <option value="uk">Українська</option>
                <option value="cs">Čeština</option>
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {(
                [
                  ["dyslexiaFont", Sparkles],
                  ["voiceSupport", Mic2],
                  ["largeText", TextCursorInput],
                  ["highContrast", Contrast],
                  ["soundEffects", Flame]
                ] as const
              ).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSetting(key)}
                  className={`rounded-2xl p-4 text-left font-bold ${
                    settings[key] ? "bg-aqua text-white" : "bg-slate-50 text-ink"
                  }`}
                >
                  <Icon aria-hidden className="mb-2 h-6 w-6" />
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
