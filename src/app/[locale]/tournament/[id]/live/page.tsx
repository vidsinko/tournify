"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Zap, Plus, Minus, Play, Square, Clock, Trophy, Radio } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import { toast } from "sonner";

interface LiveMatch {
  id: string;
  pitch: string;
  group: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  status: "scheduled" | "live" | "completed";
  scheduledAt: Date;
}

const INITIAL_MATCHES: LiveMatch[] = [
  { id: "m11", pitch: "Pitch 1", group: "C", home: "Eagles", away: "River Valley", homeScore: 2, awayScore: 1, status: "live", scheduledAt: new Date("2025-05-10T11:05:00") },
  { id: "m12", pitch: "Pitch 2", group: "D", home: "Storm FC", away: "City Wolves", homeScore: 0, awayScore: 0, status: "live", scheduledAt: new Date("2025-05-10T11:05:00") },
  { id: "m13", pitch: "Pitch 1", group: "A", home: "NK Maribor", away: "NK Celje", homeScore: 0, awayScore: 0, status: "scheduled", scheduledAt: new Date("2025-05-10T11:30:00") },
  { id: "m14", pitch: "Pitch 2", group: "B", home: "Blue Wave", away: "Coastal United", homeScore: 0, awayScore: 0, status: "scheduled", scheduledAt: new Date("2025-05-10T11:30:00") },
];

const INITIAL_EVENTS = [
  { id: "e1", text: "GOAL ⚽ Eagles — Žan Kovač (14')", time: "11:19", type: "goal" },
  { id: "e2", text: "Match started: Storm FC vs City Wolves", time: "11:05", type: "start" },
  { id: "e3", text: "Match started: Eagles vs River Valley", time: "11:05", type: "start" },
];

const RECENT_RESULTS = [
  { home: "FC Olimpija", away: "FC Koper", homeScore: 2, awayScore: 2 },
  { home: "Red Stars", away: "Sunrise FC", homeScore: 3, awayScore: 0 },
];

export default function LivePage() {
  const t = useTranslations("live");
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [matches, setMatches] = useState<LiveMatch[]>(INITIAL_MATCHES);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [elapsed, setElapsed] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const updateScore = (matchId: string, team: "home" | "away", delta: number) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const cur = team === "home" ? m.homeScore : m.awayScore;
        const newScore = Math.max(0, cur + delta);
        const updated = team === "home" ? { ...m, homeScore: newScore } : { ...m, awayScore: newScore };
        if (delta > 0) {
          const scorer = team === "home" ? m.home : m.away;
          setEvents((ev) => [
            { id: `e${Date.now()}`, text: `GOAL ⚽ ${scorer} (${elapsed}')`, time: formatTime(new Date()), type: "goal" },
            ...ev,
          ]);
          toast.success(`Goal! ${updated.home} ${updated.homeScore}–${updated.awayScore} ${updated.away}`);
        }
        return updated;
      })
    );
  };

  const startMatch = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: "live" } : m));
    setEvents((ev) => [{ id: `e${Date.now()}`, text: `Match started: ${match.home} vs ${match.away}`, time: formatTime(new Date()), type: "start" }, ...ev]);
    toast.success(`Match started!`);
  };

  const endMatch = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: "completed" } : m));
    setEvents((ev) => [{ id: `e${Date.now()}`, text: `FT: ${match.home} ${match.homeScore}–${match.awayScore} ${match.away}`, time: formatTime(new Date()), type: "end" }, ...ev]);
    toast.success(`Result saved: ${match.homeScore}–${match.awayScore}`);
  };

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "scheduled");

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />
        <main className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-5">
            <h1 className="text-xl font-bold text-white">{t("title")}</h1>
            <Badge variant="live" pulse>{t("liveNow")}</Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {/* Live matches */}
              {liveMatches.map((match) => (
                <Card key={match.id} className="border-live-800/40">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="live" pulse size="sm">● LIVE</Badge>
                      <span className="text-xs text-surface-400">{match.pitch} · Group {match.group}</span>
                      <span className="text-xs text-live-400 ml-auto">{elapsed}' {t("minute")}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white mb-2">{match.home}</p>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateScore(match.id, "home", -1)} className="h-8 w-8 bg-surface-700 hover:bg-surface-600 rounded-lg flex items-center justify-center transition-colors">
                            <Minus className="h-3.5 w-3.5 text-surface-300" />
                          </button>
                          <span className="text-3xl font-bold text-white w-10 text-center">{match.homeScore}</span>
                          <button onClick={() => updateScore(match.id, "home", 1)} className="h-8 w-8 bg-live-700 hover:bg-live-600 rounded-lg flex items-center justify-center transition-colors">
                            <Plus className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-surface-500">–</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white mb-2">{match.away}</p>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateScore(match.id, "away", -1)} className="h-8 w-8 bg-surface-700 hover:bg-surface-600 rounded-lg flex items-center justify-center transition-colors">
                            <Minus className="h-3.5 w-3.5 text-surface-300" />
                          </button>
                          <span className="text-3xl font-bold text-white w-10 text-center">{match.awayScore}</span>
                          <button onClick={() => updateScore(match.id, "away", 1)} className="h-8 w-8 bg-live-700 hover:bg-live-600 rounded-lg flex items-center justify-center transition-colors">
                            <Plus className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-surface-700">
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => endMatch(match.id)}>
                        <Square className="h-3.5 w-3.5" />
                        End Match — Save Result
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Upcoming */}
              {upcomingMatches.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-surface-400 mb-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Upcoming
                  </h2>
                  <div className="space-y-2">
                    {upcomingMatches.map((match) => (
                      <div key={match.id} className="flex items-center gap-3 bg-surface-800 border border-surface-700 rounded-xl px-4 py-3">
                        <span className="text-xs text-surface-500 w-10">{formatTime(match.scheduledAt)}</span>
                        <span className="text-xs text-surface-500">{match.pitch}</span>
                        <div className="flex-1 flex items-center gap-2 justify-center text-sm">
                          <span className="text-white font-medium">{match.home}</span>
                          <span className="text-surface-600">vs</span>
                          <span className="text-white font-medium">{match.away}</span>
                        </div>
                        <Button size="sm" variant="live" className="h-7 text-xs" onClick={() => startMatch(match.id)}>
                          <Play className="h-3 w-3" /> Start
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent results */}
              <div>
                <h2 className="text-sm font-semibold text-surface-400 mb-2 flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" /> Recent Results
                </h2>
                <div className="space-y-1.5">
                  {RECENT_RESULTS.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm">
                      <span className="text-surface-300 flex-1 text-right">{r.home}</span>
                      <span className="font-bold text-white">{r.homeScore}–{r.awayScore}</span>
                      <span className="text-surface-300 flex-1">{r.away}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Feed */}
            <div>
              <h2 className="text-sm font-semibold text-surface-400 mb-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-live-400" />
                {t("eventFeed")}
              </h2>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs animate-slide-up",
                      event.type === "goal"
                        ? "bg-live-900/30 border border-live-800/40 text-live-300"
                        : "bg-surface-800 border border-surface-700 text-surface-400"
                    )}
                  >
                    <p className="font-medium">{event.text}</p>
                    <p className="text-surface-600 mt-0.5">{event.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
