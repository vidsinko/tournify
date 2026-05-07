"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Minus, Plus, CheckCircle2, Square, AlertTriangle, ChevronDown } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiveMatch {
  id: string;
  field: string;
  group: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: "live" | "paused" | "ft";
  events: MatchEvent[];
}

interface MatchEvent {
  id: string;
  minute: number;
  type: "goal" | "yellow" | "red" | "substitution";
  team: "home" | "away";
  player: string;
}

interface PendingMatch {
  id: string;
  time: string;
  field: string;
  group: string;
  home: string;
  away: string;
}

const LIVE_MATCHES: LiveMatch[] = [
  {
    id: "lm1",
    field: "Field 1",
    group: "Group A",
    home: "NK Olimpija",
    away: "NK Maribor",
    homeScore: 2,
    awayScore: 1,
    minute: 75,
    status: "live",
    events: [
      { id: "e1", minute: 23, type: "goal", team: "home", player: "Luka K." },
      { id: "e2", minute: 38, type: "yellow", team: "away", player: "Marko P." },
      { id: "e3", minute: 51, type: "goal", team: "away", player: "Tim R." },
      { id: "e4", minute: 67, type: "goal", team: "home", player: "Andrej S." },
    ],
  },
  {
    id: "lm2",
    field: "Field 2",
    group: "Group B",
    home: "Red Stars",
    away: "Blue Wave",
    homeScore: 0,
    awayScore: 0,
    minute: 42,
    status: "live",
    events: [],
  },
];

const PENDING_MATCHES: PendingMatch[] = [
  { id: "pm1", time: "12:45", field: "Field 3", group: "Group C", home: "ND Gorica", away: "FC Koper" },
  { id: "pm2", time: "12:45", field: "Field 4", group: "Group D", home: "NK Celje", away: "Young Stars" },
  { id: "pm3", time: "14:00", field: "Field 4", group: "Group A", home: "FC Victoria", away: "Inter Ljubljana" },
];

const EVENT_ICON: Record<string, string> = {
  goal: "⚽",
  yellow: "🟨",
  red: "🟥",
  substitution: "↕️",
};

function ScoreEntry({ match }: { match: LiveMatch }) {
  const [home, setHome] = useState(match.homeScore);
  const [away, setAway] = useState(match.awayScore);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="h-1 bg-live-500" />
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live-500" />
            </span>
            <span className="text-xs font-bold text-live-600">{match.minute}&apos;</span>
            <Badge variant="default" size="sm">{match.group}</Badge>
          </div>
          <span className="text-[11px] text-gray-400">{match.field}</span>
        </div>

        {/* Score entry */}
        <div className="flex items-center gap-4 mb-4">
          {/* Home team */}
          <div className="flex-1 text-center">
            <p className="text-sm font-bold text-gray-900 mb-3 truncate">{match.home}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setHome(Math.max(0, home - 1))}
                className="h-10 w-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors active:scale-95"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-4xl font-black text-gray-900 w-12 text-center tabular-nums">{home}</span>
              <button
                onClick={() => setHome(home + 1)}
                className="h-10 w-10 rounded-full border-2 border-brand-600 bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 transition-colors active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-2xl font-black text-gray-200 shrink-0">–</div>

          {/* Away team */}
          <div className="flex-1 text-center">
            <p className="text-sm font-bold text-gray-900 mb-3 truncate">{match.away}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setAway(Math.max(0, away - 1))}
                className="h-10 w-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors active:scale-95"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-4xl font-black text-gray-900 w-12 text-center tabular-nums">{away}</span>
              <button
                onClick={() => setAway(away + 1)}
                className="h-10 w-10 rounded-full border-2 border-brand-600 bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 transition-colors active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button className="flex items-center justify-center gap-1 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">
            <AlertTriangle className="h-3.5 w-3.5" />
            Yellow
          </button>
          <button className="flex items-center justify-center gap-1 h-9 rounded-xl bg-danger-50 border border-danger-100 text-danger-600 text-xs font-semibold hover:bg-danger-100 transition-colors">
            <Square className="h-3.5 w-3.5 fill-current" />
            Red Card
          </button>
          <button className="flex items-center justify-center gap-1 h-9 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Full Time
          </button>
        </div>

        <button
          onClick={handleSave}
          className={cn(
            "w-full h-10 rounded-xl text-sm font-bold transition-all",
            saved
              ? "bg-live-600 text-white"
              : "bg-gray-900 hover:bg-gray-800 text-white"
          )}
        >
          {saved ? "✓ Saved!" : "Save Result"}
        </button>
      </div>

      {/* Match events */}
      {match.events.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Match Events</p>
          <div className="space-y-1.5">
            {match.events.map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-400 font-medium">{e.minute}&apos;</span>
                <span>{EVENT_ICON[e.type]}</span>
                <span className="text-gray-700 font-medium">{e.player}</span>
                <span className="text-gray-400">({e.team === "home" ? match.home : match.away})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LivePage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const [showPending, setShowPending] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <AppHeader locale={locale} userName="Alex Johnson" />

      <div className="flex flex-1 min-h-0">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-4 py-5 lg:px-6">

            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live-500" />
              </span>
              <h1 className="text-xl font-bold text-gray-900">Live — Score Entry</h1>
              <span className="ml-auto text-xs text-gray-500">{LIVE_MATCHES.length} in progress</span>
            </div>

            {/* Live matches */}
            <section className="space-y-4 mb-6">
              {LIVE_MATCHES.map((m) => (
                <ScoreEntry key={m.id} match={m} />
              ))}
            </section>

            {/* Pending matches */}
            <section>
              <button
                onClick={() => setShowPending((v) => !v)}
                className="flex items-center gap-2 w-full mb-3 text-left"
              >
                <h2 className="text-sm font-bold text-gray-900">Upcoming Matches</h2>
                <span className="text-xs text-gray-400 ml-1">{PENDING_MATCHES.length} queued</span>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 ml-auto transition-transform", !showPending && "-rotate-90")} />
              </button>

              {showPending && (
                <div className="space-y-2">
                  {PENDING_MATCHES.map((m) => (
                    <div key={m.id} className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3">
                      <div className="w-12 shrink-0">
                        <p className="text-sm font-bold text-gray-900">{m.time}</p>
                        <p className="text-[10px] text-gray-400">{m.field}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {m.home} <span className="text-gray-400 font-normal">vs</span> {m.away}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{m.group}</p>
                      </div>
                      <button className="h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors shrink-0">
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
