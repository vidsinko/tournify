"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Zap, FileDown, Trophy, Crown } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BracketTeam {
  name: string;
  score?: number;
  isWinner?: boolean;
  isTBD?: boolean;
}

interface BracketMatchData {
  id: string;
  home: BracketTeam;
  away: BracketTeam;
  status: "completed" | "scheduled" | "live";
  time?: string;
  pitch?: string;
  round: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const QUARTERFINALS: BracketMatchData[] = [
  {
    id: "qf1",
    round: "QF",
    status: "completed",
    home: { name: "FC Olimpija", score: 3, isWinner: true },
    away: { name: "City Wolves", score: 1 },
  },
  {
    id: "qf2",
    round: "QF",
    status: "completed",
    home: { name: "Eagles", score: 2, isWinner: true },
    away: { name: "United XI", score: 2 },
    // Eagles advance on penalties
  },
  {
    id: "qf3",
    round: "QF",
    status: "completed",
    home: { name: "Red Stars", score: 1 },
    away: { name: "River Valley", score: 2, isWinner: true },
  },
  {
    id: "qf4",
    round: "QF",
    status: "scheduled",
    time: "14:00",
    pitch: "Pitch 1",
    home: { name: "FC Koper" },
    away: { name: "Sunrise FC" },
  },
];

const SEMIFINALS: BracketMatchData[] = [
  {
    id: "sf1",
    round: "SF",
    status: "scheduled",
    time: "15:30",
    pitch: "Pitch 1",
    home: { name: "FC Olimpija" },
    away: { name: "Eagles" },
  },
  {
    id: "sf2",
    round: "SF",
    status: "scheduled",
    time: "15:30",
    pitch: "Pitch 2",
    home: { name: "River Valley" },
    away: { name: "TBD", isTBD: true },
  },
];

const FINAL: BracketMatchData = {
  id: "f1",
  round: "Final",
  status: "scheduled",
  time: "17:00",
  pitch: "Pitch 1",
  home: { name: "TBD", isTBD: true },
  away: { name: "TBD", isTBD: true },
};

const THIRD_PLACE: BracketMatchData = {
  id: "3rd",
  round: "3rd",
  status: "scheduled",
  time: "16:00",
  pitch: "Pitch 2",
  home: { name: "TBD", isTBD: true },
  away: { name: "TBD", isTBD: true },
};

// ─── Bracket Match Card ───────────────────────────────────────────────────────

function BracketCard({ match, highlight = false }: { match: BracketMatchData; highlight?: boolean }) {
  const isPending = match.status === "scheduled";
  const isLive = match.status === "live";

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border transition-all w-full",
        highlight ? "border-brand-600/60 ring-1 ring-brand-600/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" :
        isLive ? "border-live-700/60 ring-1 ring-live-700/20" :
        "border-surface-700"
      )}
    >
      {/* Home */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5 border-b border-surface-700",
          match.home.isWinner ? "bg-brand-900/25" : "bg-surface-800"
        )}
      >
        <span
          className={cn(
            "text-sm font-semibold truncate flex-1 mr-2",
            match.home.isTBD ? "text-surface-600 italic" :
            match.home.isWinner ? "text-white" : "text-surface-300"
          )}
        >
          {match.home.name}
        </span>
        <span
          className={cn(
            "text-sm font-bold tabular-nums shrink-0 min-w-[20px] text-right",
            match.home.isWinner ? "text-brand-400" : isPending ? "text-surface-600" : "text-surface-400"
          )}
        >
          {match.home.score !== undefined ? match.home.score : "–"}
        </span>
      </div>

      {/* Away */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5",
          match.away.isWinner ? "bg-brand-900/25" : "bg-surface-800"
        )}
      >
        <span
          className={cn(
            "text-sm font-semibold truncate flex-1 mr-2",
            match.away.isTBD ? "text-surface-600 italic" :
            match.away.isWinner ? "text-white" : "text-surface-300"
          )}
        >
          {match.away.name}
        </span>
        <span
          className={cn(
            "text-sm font-bold tabular-nums shrink-0 min-w-[20px] text-right",
            match.away.isWinner ? "text-brand-400" : isPending ? "text-surface-600" : "text-surface-400"
          )}
        >
          {match.away.score !== undefined ? match.away.score : "–"}
        </span>
      </div>

      {/* Time/Status footer */}
      {(isPending || isLive) && match.time && (
        <div
          className={cn(
            "px-3 py-1.5 border-t border-surface-700",
            isLive ? "bg-live-900/20" : "bg-surface-900/50"
          )}
        >
          {isLive ? (
            <span className="flex items-center gap-1 text-xs text-live-400">
              <span className="h-1.5 w-1.5 rounded-full bg-live-500 animate-ping" />
              LIVE
            </span>
          ) : (
            <p className="text-xs text-surface-500">{match.time} · {match.pitch}</p>
          )}
        </div>
      )}
      {match.status === "completed" && (
        <div className="px-3 py-1 border-t border-surface-700 bg-surface-900/30">
          <Badge variant="default" size="sm">FT</Badge>
        </div>
      )}
    </div>
  );
}

// ─── Connector ───────────────────────────────────────────────────────────────

function HConnector() {
  return <div className="flex-shrink-0 w-6 h-px bg-surface-700 self-center" />;
}

// ─── Column ───────────────────────────────────────────────────────────────────

function BracketColumn({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col shrink-0 w-44", className)}>
      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3 text-center">
        {label}
      </p>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BracketPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const t = useTranslations("bracket");

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
                <Zap className="h-5 w-5 text-brand-400" />
                {t("title")}
              </h1>
              <p className="text-sm text-surface-400 mt-0.5">
                Spring Cup 2025 · Knockout Stage
              </p>
            </div>
            <Button variant="secondary" size="sm">
              <FileDown className="h-3.5 w-3.5" />
              {t("exportBracket")}
            </Button>
          </div>

          {/* Bracket */}
          <div className="bg-surface-800/50 border border-surface-700 rounded-2xl p-5 overflow-x-auto">
            <div className="flex items-center gap-0 min-w-[780px]">

              {/* QF Column */}
              <BracketColumn label={t("quarterfinals")}>
                <div className="flex flex-col gap-3">
                  {QUARTERFINALS.map((match) => (
                    <BracketCard key={match.id} match={match} />
                  ))}
                </div>
              </BracketColumn>

              {/* QF → SF Connectors */}
              <div className="flex flex-col justify-around h-full w-8 shrink-0 mt-9">
                {/* Top connector: QF1 + QF2 → SF1 */}
                <div className="flex flex-col items-stretch" style={{ height: "45%" }}>
                  <div className="flex-1 border-r border-t border-b border-surface-700 rounded-tr-lg rounded-br-lg mr-0" style={{ borderLeft: "none" }} />
                </div>
                {/* Bottom connector: QF3 + QF4 → SF2 */}
                <div className="flex flex-col items-stretch" style={{ height: "45%" }}>
                  <div className="flex-1 border-r border-t border-b border-surface-700 rounded-tr-lg rounded-br-lg" style={{ borderLeft: "none" }} />
                </div>
              </div>

              {/* SF Column */}
              <BracketColumn label={t("semifinals")}>
                <div className="flex flex-col justify-around flex-1 gap-0" style={{ paddingTop: "10%", paddingBottom: "10%" }}>
                  {SEMIFINALS.map((match) => (
                    <BracketCard key={match.id} match={match} />
                  ))}
                </div>
              </BracketColumn>

              {/* SF → F Connectors */}
              <div className="flex flex-col justify-center h-full w-8 shrink-0 mt-9 gap-3">
                <div className="flex-1 border-r border-t border-b border-surface-700 rounded-tr-lg rounded-br-lg" style={{ borderLeft: "none", minHeight: 60 }} />
              </div>

              {/* Final Column */}
              <BracketColumn label={t("final")} className="relative">
                <div className="flex flex-col justify-center flex-1" style={{ minHeight: "200px" }}>
                  <div className="relative">
                    <BracketCard match={FINAL} highlight />
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="brand" size="sm">Final</Badge>
                    </div>
                  </div>
                </div>
              </BracketColumn>

              {/* Champion */}
              <div className="flex flex-col items-center justify-center w-36 shrink-0 mt-9 ml-4">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">
                  {t("champion")}
                </p>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 bg-gradient-to-br from-brand-900/60 to-brand-800/30 border border-brand-700/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <Trophy className="h-8 w-8 text-brand-400" />
                  </div>
                  <div className="text-center">
                    <Crown className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                    <p className="text-sm text-surface-500 italic">{t("tbd")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3rd Place Match */}
          <div className="mt-5 pt-5 border-t border-surface-800">
            <p className="text-sm font-semibold text-surface-400 mb-3 flex items-center gap-2">
              <span className="h-1 w-4 rounded-full bg-surface-700" />
              {t("thirdPlace")}
              <span className="h-1 w-4 rounded-full bg-surface-700" />
            </p>
            <div className="max-w-44">
              <BracketCard match={THIRD_PLACE} />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-surface-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-brand-900/40 border border-brand-700/60" />
              Qualified / Winner
            </span>
            <span className="flex items-center gap-1.5">
              <Badge variant="default" size="sm">FT</Badge>
              Final time
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-surface-600 italic">TBD</span>
              To be determined
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
