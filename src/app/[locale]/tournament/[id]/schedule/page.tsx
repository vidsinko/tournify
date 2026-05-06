"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar,
  FileDown,
  Filter,
  Check,
  MapPin,
  Clock,
  ChevronDown,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type MatchStatus = "scheduled" | "live" | "completed" | "postponed";

interface MockMatch {
  id: string;
  match_number: number;
  scheduled_at: string; // ISO time string
  pitch: string;
  group: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  status: MatchStatus;
  referee: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_MATCHES: MockMatch[] = [
  // 09:00 — completed
  { id: "m1",  match_number: 1,  scheduled_at: "2025-05-10T09:00:00", pitch: "Pitch 1", group: "A", home_team: "FC Olimpija",    away_team: "NK Maribor",      home_score: 3, away_score: 1, status: "completed", referee: "Luka Novak" },
  { id: "m2",  match_number: 2,  scheduled_at: "2025-05-10T09:00:00", pitch: "Pitch 2", group: "B", home_team: "Red Stars",       away_team: "Blue Wave",       home_score: 2, away_score: 2, status: "completed", referee: "Maja Horvat" },
  // 09:25 — completed
  { id: "m3",  match_number: 3,  scheduled_at: "2025-05-10T09:25:00", pitch: "Pitch 1", group: "C", home_team: "Eagles",          away_team: "Panthers",        home_score: 1, away_score: 0, status: "completed", referee: "Rok Petek" },
  { id: "m4",  match_number: 4,  scheduled_at: "2025-05-10T09:25:00", pitch: "Pitch 2", group: "D", home_team: "Storm FC",        away_team: "United XI",       home_score: 0, away_score: 3, status: "completed", referee: "Ana Kos" },
  // 09:50 — completed
  { id: "m5",  match_number: 5,  scheduled_at: "2025-05-10T09:50:00", pitch: "Pitch 1", group: "A", home_team: "FC Koper",        away_team: "NK Celje",        home_score: 2, away_score: 1, status: "completed", referee: "Luka Novak" },
  { id: "m6",  match_number: 6,  scheduled_at: "2025-05-10T09:50:00", pitch: "Pitch 2", group: "B", home_team: "Sunrise FC",      away_team: "Coastal United",  home_score: 4, away_score: 0, status: "completed", referee: "Maja Horvat" },
  // 10:15 — completed
  { id: "m7",  match_number: 7,  scheduled_at: "2025-05-10T10:15:00", pitch: "Pitch 1", group: "C", home_team: "River Valley",    away_team: "Mountain Hawks",  home_score: 1, away_score: 1, status: "completed", referee: "Rok Petek" },
  { id: "m8",  match_number: 8,  scheduled_at: "2025-05-10T10:15:00", pitch: "Pitch 2", group: "D", home_team: "City Wolves",     away_team: "Desert Lions",    home_score: 3, away_score: 2, status: "completed", referee: "Ana Kos" },
  // 10:40 — completed
  { id: "m9",  match_number: 9,  scheduled_at: "2025-05-10T10:40:00", pitch: "Pitch 1", group: "A", home_team: "FC Olimpija",    away_team: "FC Koper",        home_score: 2, away_score: 2, status: "completed", referee: "Luka Novak" },
  { id: "m10", match_number: 10, scheduled_at: "2025-05-10T10:40:00", pitch: "Pitch 2", group: "B", home_team: "Red Stars",       away_team: "Sunrise FC",      home_score: 3, away_score: 0, status: "completed", referee: "Maja Horvat" },
  // 11:05 — LIVE
  { id: "m11", match_number: 11, scheduled_at: "2025-05-10T11:05:00", pitch: "Pitch 1", group: "C", home_team: "Eagles",          away_team: "River Valley",    home_score: 2, away_score: 1, status: "live",      referee: "Rok Petek" },
  { id: "m12", match_number: 12, scheduled_at: "2025-05-10T11:05:00", pitch: "Pitch 2", group: "D", home_team: "Storm FC",        away_team: "City Wolves",     home_score: 0, away_score: 0, status: "live",      referee: "Ana Kos" },
  // 11:30 — scheduled
  { id: "m13", match_number: 13, scheduled_at: "2025-05-10T11:30:00", pitch: "Pitch 1", group: "A", home_team: "NK Maribor",     away_team: "NK Celje",        status: "scheduled", referee: "Luka Novak" },
  { id: "m14", match_number: 14, scheduled_at: "2025-05-10T11:30:00", pitch: "Pitch 2", group: "B", home_team: "Blue Wave",       away_team: "Coastal United",  status: "scheduled", referee: "Maja Horvat" },
  // 11:55 — scheduled
  { id: "m15", match_number: 15, scheduled_at: "2025-05-10T11:55:00", pitch: "Pitch 1", group: "C", home_team: "Panthers",        away_team: "Mountain Hawks",  status: "scheduled", referee: "Rok Petek" },
  { id: "m16", match_number: 16, scheduled_at: "2025-05-10T11:55:00", pitch: "Pitch 2", group: "D", home_team: "United XI",       away_team: "Desert Lions",    status: "scheduled", referee: "Ana Kos" },
  // 13:00 — after lunch
  { id: "m17", match_number: 17, scheduled_at: "2025-05-10T13:00:00", pitch: "Pitch 1", group: "A", home_team: "FC Olimpija",    away_team: "NK Celje",        status: "scheduled", referee: "Luka Novak" },
  { id: "m18", match_number: 18, scheduled_at: "2025-05-10T13:00:00", pitch: "Pitch 2", group: "B", home_team: "Red Stars",       away_team: "Coastal United",  status: "scheduled", referee: "Maja Horvat" },
  // 13:25
  { id: "m19", match_number: 19, scheduled_at: "2025-05-10T13:25:00", pitch: "Pitch 1", group: "C", home_team: "Eagles",          away_team: "Mountain Hawks",  status: "scheduled", referee: "Rok Petek" },
  { id: "m20", match_number: 20, scheduled_at: "2025-05-10T13:25:00", pitch: "Pitch 2", group: "D", home_team: "Storm FC",        away_team: "Desert Lions",    status: "scheduled", referee: "Ana Kos" },
  // 13:50
  { id: "m21", match_number: 21, scheduled_at: "2025-05-10T13:50:00", pitch: "Pitch 1", group: "A", home_team: "NK Maribor",     away_team: "FC Koper",        status: "scheduled", referee: "Luka Novak" },
  { id: "m22", match_number: 22, scheduled_at: "2025-05-10T13:50:00", pitch: "Pitch 2", group: "B", home_team: "Blue Wave",       away_team: "Sunrise FC",      status: "scheduled", referee: "Maja Horvat" },
  // 14:15
  { id: "m23", match_number: 23, scheduled_at: "2025-05-10T14:15:00", pitch: "Pitch 1", group: "C", home_team: "River Valley",    away_team: "Panthers",        status: "scheduled", referee: "Rok Petek" },
  { id: "m24", match_number: 24, scheduled_at: "2025-05-10T14:15:00", pitch: "Pitch 2", group: "D", home_team: "City Wolves",     away_team: "United XI",       status: "scheduled", referee: "Ana Kos" },
];

const GROUP_BADGE: Record<string, string> = {
  A: "bg-brand-900/60 text-brand-300 border-brand-800",
  B: "bg-purple-900/60 text-purple-300 border-purple-800",
  C: "bg-amber-900/60 text-amber-300 border-amber-800",
  D: "bg-emerald-900/60 text-emerald-300 border-emerald-800",
};

// ─── Match Card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
  match: MockMatch;
  onOpenScore: (match: MockMatch) => void;
}

function MatchCard({ match, onOpenScore }: MatchCardProps) {
  const t = useTranslations("schedule");
  const isScored = match.home_score !== undefined && match.away_score !== undefined;

  return (
    <Card
      className={cn(
        "transition-all",
        match.status === "live" && "border-live-700/60 ring-1 ring-live-700/20"
      )}
    >
      <CardContent className="py-3 px-4">
        {/* Top row: group + pitch + status */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
              GROUP_BADGE[match.group] ?? "bg-surface-700 text-surface-300 border-surface-600"
            )}
          >
            Grp {match.group}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-surface-500">
            <MapPin className="h-3 w-3" />
            {match.pitch}
          </span>
          <span className="text-xs text-surface-600">#{match.match_number}</span>
          <div className="ml-auto flex items-center gap-1.5">
            {match.status === "live" && <Badge variant="live" pulse size="sm">LIVE</Badge>}
            {match.status === "completed" && <Badge variant="default" size="sm">FT</Badge>}
            {match.status === "postponed" && <Badge variant="warning" size="sm">Postponed</Badge>}
          </div>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-white leading-tight">{match.home_team}</p>
          </div>
          <div className="shrink-0 w-[56px] text-center">
            {isScored ? (
              <span
                className={cn(
                  "text-xl font-bold tabular-nums",
                  match.status === "live" ? "text-live-400" : "text-white"
                )}
              >
                {match.home_score}–{match.away_score}
              </span>
            ) : (
              <span className="text-base font-semibold text-surface-600">vs</span>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-white leading-tight">{match.away_team}</p>
          </div>
        </div>

        {/* Bottom row: referee + action */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-surface-600 truncate">
            Ref: {match.referee}
          </span>
          <Button
            size="sm"
            variant={match.status === "live" ? "live" : "ghost"}
            className="h-7 text-xs shrink-0"
            onClick={() => onOpenScore(match)}
          >
            {match.status === "completed" ? t("editResult") : t("enterResult")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Score Modal ──────────────────────────────────────────────────────────────

interface ScoreModalProps {
  match: MockMatch | null;
  onClose: () => void;
  onSave: (id: string, home: number, away: number) => void;
}

function ScoreModal({ match, onClose, onSave }: ScoreModalProps) {
  const t = useTranslations("schedule");
  const [home, setHome] = useState(String(match?.home_score ?? 0));
  const [away, setAway] = useState(String(match?.away_score ?? 0));

  if (!match) return null;

  const handleSave = () => {
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (!isNaN(h) && !isNaN(a)) {
      onSave(match.id, h, a);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t("enterResult")}
      description={`Match #${match.match_number} · ${match.pitch} · Group ${match.group}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{t("status.cancelled") ? "Cancel" : "Cancel"}</Button>
          <Button variant="primary" onClick={handleSave}>
            <Check className="h-3.5 w-3.5" />
            {t("saveResult")}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-surface-400 text-center mb-1.5 font-medium truncate">{match.home_team}</p>
          <input
            type="number"
            min={0}
            max={99}
            value={home}
            onChange={(e) => setHome(e.target.value)}
            className="w-full h-16 bg-surface-900 border border-surface-700 rounded-xl text-center text-4xl font-bold text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>
        <span className="text-2xl font-bold text-surface-500 mt-5">–</span>
        <div className="flex-1">
          <p className="text-xs text-surface-400 text-center mb-1.5 font-medium truncate">{match.away_team}</p>
          <input
            type="number"
            min={0}
            max={99}
            value={away}
            onChange={(e) => setAway(e.target.value)}
            className="w-full h-16 bg-surface-900 border border-surface-700 rounded-xl text-center text-4xl font-bold text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const t = useTranslations("schedule");

  const [matches, setMatches] = useState<MockMatch[]>(INITIAL_MATCHES);
  const [filterPitch, setFilterPitch] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterTeam, setFilterTeam] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<MockMatch | null>(null);

  const pitches = ["all", "Pitch 1", "Pitch 2"];
  const groups = ["all", "A", "B", "C", "D"];
  const liveCount = matches.filter((m) => m.status === "live").length;

  const filtered = matches.filter((m) => {
    if (filterPitch !== "all" && m.pitch !== filterPitch) return false;
    if (filterGroup !== "all" && m.group !== filterGroup) return false;
    if (filterTeam.trim()) {
      const q = filterTeam.toLowerCase();
      if (!m.home_team.toLowerCase().includes(q) && !m.away_team.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Group by HH:mm slot
  const grouped: Record<string, MockMatch[]> = {};
  filtered.forEach((m) => {
    const time = m.scheduled_at.slice(11, 16);
    if (!grouped[time]) grouped[time] = [];
    grouped[time].push(m);
  });
  const timeSlots = Object.keys(grouped).sort();

  const handleSaveScore = (matchId: string, home: number, away: number) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, home_score: home, away_score: away, status: "completed" as MatchStatus }
          : m
      )
    );
    setSelectedMatch(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" userEmail="alex@example.com" />

        <main className="flex-1 p-4 lg:p-6 max-w-5xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-400" />
                {t("title")}
              </h1>
              <p className="text-sm text-surface-400 mt-0.5">
                Spring Cup 2025 · 10 May 2025 ·{" "}
                <span className="text-white font-medium">{matches.length}</span> matches
                {liveCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-live-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-live-500 animate-ping inline-block" />
                    {liveCount} live
                  </span>
                )}
              </p>
            </div>
            <Button variant="secondary" size="sm">
              <FileDown className="h-3.5 w-3.5" />
              {t("exportSchedule")}
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 mb-5">
            <p className="text-xs font-medium text-surface-400 flex items-center gap-1.5 mb-3">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Pitch */}
              <div className="flex gap-1.5 flex-wrap">
                {pitches.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPitch(p)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                      filterPitch === p
                        ? "bg-brand-600 text-white"
                        : "bg-surface-700 text-surface-300 hover:bg-surface-600"
                    )}
                  >
                    {p === "all" ? t("allPitches") : p}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-surface-700 hidden sm:block" />
              {/* Group */}
              <div className="flex gap-1.5 flex-wrap">
                {groups.map((g) => (
                  <button
                    key={g}
                    onClick={() => setFilterGroup(g)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                      filterGroup === g
                        ? "bg-brand-600 text-white"
                        : "bg-surface-700 text-surface-300 hover:bg-surface-600"
                    )}
                  >
                    {g === "all" ? t("allGroups") : `Grp ${g}`}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-surface-700 hidden sm:block" />
              {/* Team search */}
              <div className="flex-1 min-w-[160px] max-w-[240px]">
                <Input
                  placeholder={t("filterByTeam")}
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Lunch break notice */}
          <div className="bg-amber-900/20 border border-amber-800/40 rounded-xl p-3 mb-5 flex items-center gap-2">
            <span className="text-amber-400 text-base">🍽️</span>
            <p className="text-xs text-amber-300">
              Lunch break 12:00–13:00. No matches scheduled during this time.
            </p>
          </div>

          {/* Grouped by time */}
          {timeSlots.length === 0 ? (
            <div className="text-center py-16 text-surface-500">{t("noMatches")}</div>
          ) : (
            <div className="space-y-6">
              {timeSlots.map((time) => {
                const timeMatches = grouped[time];
                const hasLive = timeMatches.some((m) => m.status === "live");
                return (
                  <div key={time}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-bold",
                          hasLive ? "text-live-400" : "text-surface-200"
                        )}
                      >
                        <Clock className={cn("h-4 w-4", hasLive ? "text-live-400" : "text-brand-400")} />
                        {time}
                        {hasLive && (
                          <span className="relative flex h-2 w-2 ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-live-500" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 h-px bg-surface-800" />
                      <span className="text-xs text-surface-600">
                        {timeMatches.length} match{timeMatches.length !== 1 ? "es" : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {timeMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          onOpenScore={(m) => setSelectedMatch(m)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Score entry modal */}
      {selectedMatch && (
        <ScoreModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSave={handleSaveScore}
        />
      )}
    </div>
  );
}
