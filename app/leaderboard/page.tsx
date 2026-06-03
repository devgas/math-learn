import { leaderboard } from "@/config/game";
import { AvatarBadge } from "@/components/AvatarBadge";

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#f7fbff] px-4 py-8 text-ink">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-soft">
        <h1 className="mb-5 text-3xl font-black">Leaderboard</h1>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <strong className="text-xl">#{index + 1}</strong>
              <div className="flex items-center gap-3">
                <AvatarBadge avatar={entry.avatar} size="sm" />
                <span>{entry.name}</span>
              </div>
              <strong>{entry.score}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
