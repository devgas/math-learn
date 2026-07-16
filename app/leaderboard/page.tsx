"use client";

import { useEffect, useState } from "react";
import { AvatarBadge } from "@/components/AvatarBadge";
import type { LeaderboardEntry } from "@/types/app";

const medalClass = {
  gold: "bg-mango text-ink",
  silver: "bg-slate-200 text-ink",
  bronze: "bg-orange-200 text-ink",
  none: "bg-slate-100 text-slate-600"
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/leaderboard");
        const payload = (await response.json()) as { entries?: Array<Record<string, unknown>> };
        if (!active || !Array.isArray(payload.entries)) {
          return;
        }
        setEntries(
          payload.entries.map((row, index) => ({
            id: String(row.id ?? index),
            name: String(row.child_name ?? "Player"),
            avatar: String(row.avatar ?? "rocket"),
            score: Number(row.score ?? 0),
            accuracy: Number(row.accuracy ?? 0),
            fastestTime: Number(row.fastest_time ?? 0),
            medal: index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "none"
          }))
        );
      } catch {
        setEntries([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7fbff] px-4 py-8 text-ink">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-soft">
        <h1 className="mb-5 text-3xl font-black">Leaderboard</h1>
        <div className="space-y-3">
          {loading ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-400">Loading…</p>
          ) : entries.length ? (
            entries.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <span className={`grid h-9 w-9 place-items-center rounded-full font-black ${medalClass[entry.medal]}`}>{index + 1}</span>
                <div className="flex items-center gap-3">
                  <AvatarBadge avatar={entry.avatar} size="sm" />
                  <span className="font-bold">{entry.name}</span>
                </div>
                <strong className="text-aqua">{entry.score}</strong>
              </div>
            ))
          ) : (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">No leaderboard entries yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
