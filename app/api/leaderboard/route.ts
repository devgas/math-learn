import { NextResponse } from "next/server";
import { leaderboard } from "@/config/game";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type {
  LeaderboardEntryRow,
  LeaderboardSaveResponse,
  LessonAttemptRow,
  MissionResultPayload
} from "@/types/app";

const GUEST_CHILD_ID = "local-child";

function isMissionResultPayload(payload: unknown): payload is MissionResultPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<Record<keyof MissionResultPayload, unknown>>;
  return (
    typeof candidate.child_id === "string" &&
    typeof candidate.child_name === "string" &&
    typeof candidate.avatar === "string" &&
    typeof candidate.topic === "string" &&
    typeof candidate.difficulty === "string" &&
    typeof candidate.game_mode === "string" &&
    typeof candidate.score === "number" &&
    Number.isFinite(candidate.score) &&
    typeof candidate.accuracy === "number" &&
    Number.isFinite(candidate.accuracy) &&
    typeof candidate.fastest_time === "number" &&
    Number.isFinite(candidate.fastest_time)
  );
}

function isBetterResult(next: MissionResultPayload, current: Pick<LeaderboardEntryRow, "score" | "accuracy" | "fastest_time">) {
  if (next.score !== current.score) {
    return next.score > current.score;
  }

  if (next.accuracy !== current.accuracy) {
    return next.accuracy > current.accuracy;
  }

  return next.fastest_time < current.fastest_time;
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ mode: "demo", entries: leaderboard });
  }

  try {
    const { data, error } = await supabase
      .from("leaderboard_entries")
      .select("id, child_name, avatar, score, accuracy, fastest_time")
      .order("score", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ entries: [] });
    }
    return NextResponse.json({ entries: data ?? [] });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (!isMissionResultPayload(payload)) {
    return NextResponse.json({ error: "Invalid mission result payload." }, { status: 400 });
  }

  if (payload.child_id === GUEST_CHILD_ID) {
    return NextResponse.json<LeaderboardSaveResponse>({ mode: "guest", saved: false });
  }

  if (!supabase || !supabaseAdmin) {
    return NextResponse.json<LeaderboardSaveResponse>({ mode: "demo", saved: false, payload });
  }

  try {
    const attemptPayload = {
      child_id: payload.child_id,
      topic: payload.topic,
      difficulty: payload.difficulty,
      game_mode: payload.game_mode,
      score: payload.score,
      accuracy: payload.accuracy,
      fastest_time: payload.fastest_time
    };

    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("lesson_attempts")
      .insert(attemptPayload)
      .select("id, child_id, topic, difficulty, game_mode, score, accuracy, fastest_time, created_at")
      .single<LessonAttemptRow>();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: attemptError?.message ?? "Unable to save mission attempt." }, { status: 400 });
    }

    const { data: existingEntry, error: existingError } = await supabaseAdmin
      .from("leaderboard_entries")
      .select("id, child_id, child_name, avatar, score, accuracy, fastest_time, week_start, updated_at")
      .eq("child_id", payload.child_id)
      .maybeSingle<LeaderboardEntryRow>();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 });
    }

    let entry = existingEntry;
    const shouldRefresh = !entry || isBetterResult(payload, entry);

    if (shouldRefresh) {
      const { data, error } = await supabaseAdmin
        .from("leaderboard_entries")
        .upsert(
          {
            child_id: payload.child_id,
            child_name: payload.child_name,
            avatar: payload.avatar,
            score: payload.score,
            accuracy: payload.accuracy,
            fastest_time: payload.fastest_time,
            updated_at: new Date().toISOString()
          },
          { onConflict: "child_id" }
        )
        .select("id, child_id, child_name, avatar, score, accuracy, fastest_time, week_start, updated_at")
        .single<LeaderboardEntryRow>();

      if (error || !data) {
        return NextResponse.json({ error: error?.message ?? "Unable to update leaderboard entry." }, { status: 400 });
      }

      entry = data;
    }

    return NextResponse.json<LeaderboardSaveResponse>({ mode: "saved", attempt, entry: entry as LeaderboardEntryRow });
  } catch {
    return NextResponse.json<LeaderboardSaveResponse>({ mode: "demo", saved: false, payload });
  }
}
