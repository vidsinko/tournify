"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BarChart3, FileDown, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormResult = "W" | "D" | "L";

interface StandingRow {
  rank: number;
  team: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: FormResult[];
  advances: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const GROUPS: Record<string, StandingRow[]> = {
  A: [
    { rank: 1, team: "FC Olimpija",  p: 3, w: 2, d: 1, l: 0, gf: 7, ga: 3, gd: 4,  pts: 7, form: ["W","D","W"], advances: true },
    { rank: 2, team: "FC Koper",     p: 3, w: 1, d: 1, l: 1, gf: 5, ga: 4, gd: 1,  pts: 4, form: ["L","W","D"], advances: true },
    { rank: 3, team: "NK Maribor",   p: 2, w: 1, d: 0, l: 1, gf: 4, ga: 4, gd: 0,  pts: 3, form: ["W","L"],     advances: false },
    { rank: 4, team: "NK Celje",     p: 2, w: 0, d: 0, l: 2, gf: 2, ga: 7, gd: -5, pts: 0, form: ["L","L"],     advances: false },
  ],
  B: [
    { rank: 1, team: "Red Stars",      p: 3, w: 2, d: 1, l: 0, gf: 7, ga: 2, gd: 5,  pts: 7, form: ["W","D","W"], advances: true },
    { rank: 2, team: "Sunrise FC",     p: 3, w: 1, d: 1, l: 1, gf: 4, ga: 5, gd: -1, pts: 4, form: ["W","L","D"], advances: true },
    { rank: 3, team: "Blue Wave",      p: 2, w: 0, d: 1, l: 1, gf: 2, ga: 3, gd: -1, pts: 1, form: ["D","L"],     advances: false },
    { rank: 4, team: "Coastal United", p: 2, w: 0, d: 1, l: 1, gf: 0, ga: 3, gd: -3, pts: 1, form: ["L","D"],     advances: false },
  ],
  C: [
    { rank: 1, team: "Eagles",         p: 3, w: 2, d: 1, l: 0, gf: 4, ga: 2, gd: 2,  pts: 7, form: ["W","D","W"], advances: true },
    { rank: 2, team: "River Valley",   p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, gd: 0,  pts: 4, form: ["L","D","W"], advances: true },
    { rank: 3, team: "Panthers",       p: 2, w: 0, d: 1, l: 1, gf: 1, ga: 2, gd: -1, pts: 1, form: ["L","D"],     advances: false },
    { rank: 4, team: "Mountain Hawks", p: 2, w: 0, d: 1, l: 1, gf: 2, ga: 3, gd: -1, pts: 1, form: ["D","L"],     advances: false },
  ],
  D: [
    { rank: 1, team: "City Wolves",  p: 3, w: 2, d: 0, l: 1, gf: 8, ga: 5, gd: 3,  pts: 6, form: ["W","L","W"], advances: true },
    { rank: 2, team: "United XI",    p: 3, w: 2, d: 0, l: 1, gf: 6, ga: 3, gd: 3,  pts: 6, form: ["W","W","L"], advances: true },
    { rank: 3, team: "Storm FC",     p: 2, w: 0, d: 1, l: 1, gf: 0, ga: 3, gd: -3, pts: 1, form: ["L","D"],     advances: false },
    { rank: 4, team: "Desert Lions", p: 2, w: 0, d: 1, l: 1, gf: 4, ga: 7, gd: -3, pts: 1, form: ["D","L"],     advances: false },
  ],
};

// ─── Form Badge ───────────────────────────────────────────────────────────────

const FORM_STYLES: Record<FormResult, string> = {
  W: "bg-live-900/50 text-live-400 border border-live-800/50",
  D: "bg-surface-700 text-surface-400 border border-surface-600",
  L: "bg-danger-900/40 text-danger-400 border border-danger-800/40",
};

function FormBadge({ result }: { result: FormResult }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-5 w-5 rounded text-xs font-bold",
        FORM_STYLES[result]
      )}
    >
      {result}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StandingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const t = useTranslations("standings");

  const [activeGroup, setActiveGroup] = useState("A");
  const groupKeys = Object.keys(GROUPS);
  const rows = GROUPS[activeGroup] ?? [];

  const advanceCount = rows.filter((r) => r.advances).length;

  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" userEmail="alex@example.com" />

        <main className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brand-400" />
                {t("title")}
              </h1>
              <p className="text-sm text-surface-400 mt-0.5">
                Spring Cup 2025 · 4 groups · top {advanceCount} advance per group
              </p>
            </div>
            <Button variant="secondary" size="sm">
              <FileDown className="h-3.5 w-3.5" />
              {t("exportStandings")}
            </Button>
          </div>

          {/* Group Tabs */}
          <div className="flex gap-1 mb-5 p-1 bg-surface-900 rounded-xl w-fit">
            {groupKeys.map((g) => {
              const liveInGroup = false; // could be computed
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                    activeGroup === g
                      ? "bg-surface-700 text-white shadow-sm"
                      : "text-surface-400 hover:text-surface-200"
                  )}
                >
                  {t("group")} {g}
                </button>
              );
            })}
          </div>

          {/* Standings Table */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide w-8">
                      {t("rank")}
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                      {t("team")}
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide w-9">{t("played")}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide w-9">{t("won")}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide w-9">{t("drawn")}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide w-9">{t("lost")}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide w-9">{t("goalsFor")}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide w-9">{t("goalsAgainst")}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide w-10">{t("goalDifference")}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide w-10">{t("points")}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">{t("form")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/50">
                  {rows.map((row, i) => (
                    <tr
                      key={row.team}
                      className={cn(
                        "transition-colors hover:bg-surface-700/20",
                        i === 0 && "bg-brand-900/15",
                        i === 1 && "bg-brand-900/8",
                        !row.advances && "opacity-80"
                      )}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-sm font-bold w-6 h-6 inline-flex items-center justify-center rounded",
                            row.rank === 1 ? "text-amber-400" :
                            row.rank === 2 ? "text-surface-300" :
                            "text-surface-500"
                          )}
                        >
                          {row.rank}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{row.team}</span>
                          {row.advances && (
                            <Badge variant="brand" size="sm">
                              <TrendingUp className="h-2.5 w-2.5" />
                              {t("advances")}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="text-center px-3 py-3 text-sm text-surface-400 tabular-nums">{row.p}</td>
                      <td className="text-center px-3 py-3 text-sm font-medium text-live-400 tabular-nums">{row.w}</td>
                      <td className="text-center px-3 py-3 text-sm text-surface-400 tabular-nums">{row.d}</td>
                      <td className="text-center px-3 py-3 text-sm text-danger-400 tabular-nums">{row.l}</td>
                      <td className="text-center px-3 py-3 text-sm text-surface-300 tabular-nums">{row.gf}</td>
                      <td className="text-center px-3 py-3 text-sm text-surface-300 tabular-nums">{row.ga}</td>
                      <td className="text-center px-3 py-3 text-sm tabular-nums">
                        <span className={cn(
                          "font-medium",
                          row.gd > 0 ? "text-live-400" : row.gd < 0 ? "text-danger-400" : "text-surface-400"
                        )}>
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="text-sm font-bold text-white tabular-nums">{row.pts}</span>
                      </td>

                      {/* Form */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {row.form.map((r, fi) => (
                            <FormBadge key={fi} result={r} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-surface-700 bg-surface-900/30">
              <div className="flex items-center gap-5 flex-wrap text-xs text-surface-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-brand-700/60" />
                  Top {advanceCount} advance to knockout
                </span>
                <span className="flex items-center gap-1.5">
                  <FormBadge result="W" />
                  Win
                </span>
                <span className="flex items-center gap-1.5">
                  <FormBadge result="D" />
                  Draw
                </span>
                <span className="flex items-center gap-1.5">
                  <FormBadge result="L" />
                  Loss
                </span>
              </div>
            </div>
          </div>

          {/* All groups summary */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {groupKeys.map((g) => {
              const leader = GROUPS[g][0];
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={cn(
                    "bg-surface-800 border rounded-xl p-3 text-left transition-all hover:border-surface-600",
                    activeGroup === g ? "border-brand-600" : "border-surface-700"
                  )}
                >
                  <p className="text-xs text-surface-500 mb-1">Group {g}</p>
                  <p className="text-sm font-semibold text-white truncate">{leader.team}</p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {leader.pts} pts · {leader.gf}–{leader.ga}
                  </p>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
