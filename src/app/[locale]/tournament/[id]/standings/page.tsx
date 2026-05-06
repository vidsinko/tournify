"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Download, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GROUPS = {
  A: [
    { rank: 1, team: "FC Lions", p: 3, w: 3, d: 0, l: 0, gf: 8, ga: 2, gd: 6, pts: 9, form: ["W","W","W"] as const, advances: true },
    { rank: 2, team: "Red Hawks", p: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, gd: 2, pts: 6, form: ["W","L","W"] as const, advances: true },
    { rank: 3, team: "Blue Stars", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 6, gd: -3, pts: 3, form: ["W","L","L"] as const, advances: false },
    { rank: 4, team: "United FC", p: 3, w: 0, d: 0, l: 3, gf: 1, ga: 6, gd: -5, pts: 0, form: ["L","L","L"] as const, advances: false },
  ],
  B: [
    { rank: 1, team: "Eagles", p: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, gd: 4, pts: 7, form: ["W","D","W"] as const, advances: true },
    { rank: 2, team: "Tigers", p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 1, gd: 4, pts: 7, form: ["D","W","W"] as const, advances: true },
    { rank: 3, team: "City Boys", p: 3, w: 1, d: 0, l: 2, gf: 4, ga: 6, gd: -2, pts: 3, form: ["W","L","L"] as const, advances: false },
    { rank: 4, team: "Wolves", p: 3, w: 0, d: 0, l: 3, gf: 0, ga: 6, gd: -6, pts: 0, form: ["L","L","L"] as const, advances: false },
  ],
  C: [
    { rank: 1, team: "Green Team", p: 2, w: 2, d: 0, l: 0, gf: 5, ga: 0, gd: 5, pts: 6, form: ["W","W"] as const, advances: true },
    { rank: 2, team: "Phoenix", p: 2, w: 1, d: 0, l: 1, gf: 2, ga: 3, gd: -1, pts: 3, form: ["W","L"] as const, advances: true },
    { rank: 3, team: "River City", p: 2, w: 0, d: 0, l: 2, gf: 1, ga: 5, gd: -4, pts: 0, form: ["L","L"] as const, advances: false },
    { rank: 4, team: "Storm FC", p: 2, w: 0, d: 0, l: 2, gf: 0, ga: 0, gd: 0, pts: 0, form: ["L","L"] as const, advances: false },
  ],
  D: [
    { rank: 1, team: "Thunder", p: 2, w: 1, d: 1, l: 0, gf: 4, ga: 2, gd: 2, pts: 4, form: ["W","D"] as const, advances: true },
    { rank: 2, team: "Dynamo", p: 2, w: 1, d: 1, l: 0, gf: 3, ga: 1, gd: 2, pts: 4, form: ["D","W"] as const, advances: true },
    { rank: 3, team: "United Stars", p: 2, w: 0, d: 0, l: 2, gf: 1, ga: 5, gd: -4, pts: 0, form: ["L","L"] as const, advances: false },
    { rank: 4, team: "Galaxy FC", p: 2, w: 0, d: 0, l: 2, gf: 0, ga: 0, gd: 0, pts: 0, form: ["L","L"] as const, advances: false },
  ],
};

const FORM_COLORS = {
  W: "bg-live-900/50 text-live-400",
  D: "bg-surface-700 text-surface-400",
  L: "bg-danger-900/40 text-danger-400",
};

export default function StandingsPage() {
  const t = useTranslations("standings");
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [activeGroup, setActiveGroup] = useState("A");

  const currentStandings = GROUPS[activeGroup as keyof typeof GROUPS] || [];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />
        <main className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-white">{t("title")}</h1>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              {t("exportStandings")}
            </Button>
          </div>

          {/* Group tabs */}
          <div className="flex gap-1 mb-5 bg-surface-900 p-1 rounded-xl w-fit">
            {Object.keys(GROUPS).map((g) => (
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
            ))}
          </div>

          {/* Standings table */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-700 text-xs text-surface-500">
                    <th className="text-left px-4 py-3 w-8">{t("rank")}</th>
                    <th className="text-left px-4 py-3">{t("team")}</th>
                    <th className="text-center px-2 py-3 w-8">{t("played")}</th>
                    <th className="text-center px-2 py-3 w-8">{t("won")}</th>
                    <th className="text-center px-2 py-3 w-8">{t("drawn")}</th>
                    <th className="text-center px-2 py-3 w-8">{t("lost")}</th>
                    <th className="text-center px-2 py-3 w-8">{t("goalsFor")}</th>
                    <th className="text-center px-2 py-3 w-8">{t("goalsAgainst")}</th>
                    <th className="text-center px-2 py-3 w-10">{t("goalDifference")}</th>
                    <th className="text-center px-3 py-3 w-10 font-bold text-white">{t("points")}</th>
                    <th className="text-left px-3 py-3">{t("form")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStandings.map((row, i) => (
                    <tr
                      key={row.team}
                      className={cn(
                        "border-b border-surface-700/50 last:border-0 transition-colors hover:bg-surface-700/30",
                        row.advances && "bg-brand-900/10",
                        i === 0 && "bg-brand-900/20"
                      )}
                    >
                      <td className="px-4 py-3 text-sm text-surface-400">{row.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{row.team}</span>
                          {row.advances && (
                            <Badge variant="brand" size="sm">
                              <TrendingUp className="h-2.5 w-2.5" />
                              {t("advances")}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="text-center px-2 py-3 text-sm text-surface-300">{row.p}</td>
                      <td className="text-center px-2 py-3 text-sm text-live-400 font-medium">{row.w}</td>
                      <td className="text-center px-2 py-3 text-sm text-surface-400">{row.d}</td>
                      <td className="text-center px-2 py-3 text-sm text-danger-400">{row.l}</td>
                      <td className="text-center px-2 py-3 text-sm text-surface-300">{row.gf}</td>
                      <td className="text-center px-2 py-3 text-sm text-surface-300">{row.ga}</td>
                      <td className="text-center px-2 py-3 text-sm text-surface-300">
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                      <td className="text-center px-3 py-3 text-sm font-bold text-white">{row.pts}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-0.5">
                          {row.form.map((r, fi) => (
                            <span
                              key={fi}
                              className={cn("h-5 w-5 rounded text-xs font-bold flex items-center justify-center", FORM_COLORS[r])}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-surface-700">
              <div className="flex items-center gap-4 text-xs text-surface-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-brand-500 rounded-sm" />
                  {t("advances")} to knockout
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
