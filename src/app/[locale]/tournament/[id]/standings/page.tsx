"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

interface Team {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  advance?: boolean;
}

const GROUPS: Record<string, Team[]> = {
  "Group A": [
    { name: "NK Olimpija", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 3, gd: 4, pts: 7, advance: true },
    { name: "Young Stars", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, gd: 3, pts: 7, advance: true },
    { name: "NK Bravo", played: 3, won: 1, drawn: 0, lost: 2, gf: 4, ga: 6, gd: -2, pts: 3 },
    { name: "FC Victoria", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 6, gd: -5, pts: 0 },
  ],
  "Group B": [
    { name: "Blue Tigers", played: 3, won: 3, drawn: 0, lost: 0, gf: 9, ga: 1, gd: 8, pts: 9, advance: true },
    { name: "NK Maribor", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, gd: 0, pts: 4, advance: true },
    { name: "Red Stars", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 7, gd: -4, pts: 3 },
    { name: "FC Galaxy", played: 3, won: 0, drawn: 1, lost: 2, gf: 3, ga: 7, gd: -4, pts: 1 },
  ],
  "Group C": [
    { name: "ND Gorica", played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 3, gd: 3, pts: 6, advance: true },
    { name: "FC Koper", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, gd: 2, pts: 6, advance: true },
    { name: "Inter Ljubljana", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, gd: -2, pts: 3 },
    { name: "NK Celje", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 4, gd: -3, pts: 0 },
  ],
  "Group D": [
    { name: "NK Bravo II", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 2, gd: 5, pts: 7, advance: true },
    { name: "Blue Wave", played: 3, won: 1, drawn: 2, lost: 0, gf: 5, ga: 4, gd: 1, pts: 5, advance: true },
    { name: "Young Stars II", played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 5, gd: -3, pts: 1 },
    { name: "Inter B", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 4, gd: -3, pts: 0 },
  ],
};

const GROUP_KEYS = Object.keys(GROUPS);

export default function StandingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const [activeGroup, setActiveGroup] = useState(GROUP_KEYS[0]);

  const teams = GROUPS[activeGroup] ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <AppHeader locale={locale} userName="Alex Johnson" />

      <div className="flex flex-1 min-h-0">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-4 py-5 lg:px-6">

            <h1 className="text-xl font-bold text-gray-900 mb-1">Group Standings</h1>
            <p className="text-sm text-gray-500 mb-5">Spring Cup 2025 · Group stage</p>

            {/* Group tabs */}
            <div className="flex gap-2 mb-5">
              {GROUP_KEYS.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                    activeGroup === g
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Standings table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="flex items-center px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <div className="w-6 shrink-0" />
                <div className="flex-1 text-xs font-bold text-gray-500 uppercase tracking-wide">Team</div>
                {["P", "W", "D", "L", "GF", "GA", "GD", "PTS"].map((h) => (
                  <div key={h} className="w-8 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</div>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {teams.map((team, i) => (
                  <div
                    key={team.name}
                    className={cn(
                      "flex items-center px-4 py-3 transition-colors hover:bg-gray-50",
                      team.advance && "bg-brand-50/40"
                    )}
                  >
                    <div className="w-6 shrink-0">
                      {team.advance ? (
                        <ChevronUp className="h-4 w-4 text-brand-500" />
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600 shrink-0">
                          {team.name.charAt(0)}
                        </div>
                        <p className={cn(
                          "text-sm font-semibold truncate",
                          team.advance ? "text-gray-900" : "text-gray-700"
                        )}>
                          {team.name}
                        </p>
                      </div>
                    </div>
                    {[team.played, team.won, team.drawn, team.lost, team.gf, team.ga].map((v, vi) => (
                      <div key={vi} className="w-8 text-center text-sm text-gray-500 tabular-nums">{v}</div>
                    ))}
                    <div className={cn(
                      "w-8 text-center text-sm tabular-nums font-medium",
                      team.gd > 0 ? "text-live-600" : team.gd < 0 ? "text-danger-500" : "text-gray-500"
                    )}>
                      {team.gd > 0 ? `+${team.gd}` : team.gd}
                    </div>
                    <div className="w-8 text-center text-sm font-black text-gray-900 tabular-nums">{team.pts}</div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <ChevronUp className="h-3.5 w-3.5 text-brand-500" />
                  <span className="text-[11px] text-gray-500">Advance to knockout</span>
                </div>
              </div>
            </div>

            {/* All groups summary */}
            <div className="mt-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">All Groups — Top Teams</h2>
              <div className="grid grid-cols-2 gap-3">
                {GROUP_KEYS.map((g) => {
                  const top2 = GROUPS[g].slice(0, 2);
                  return (
                    <button
                      key={g}
                      onClick={() => setActiveGroup(g)}
                      className="bg-white border border-gray-200 rounded-2xl p-3.5 text-left hover:shadow-md hover:-translate-y-px transition-all shadow-sm"
                    >
                      <p className="text-xs font-bold text-gray-500 mb-2">{g}</p>
                      {top2.map((t, i) => (
                        <div key={t.name} className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400 w-3">{i + 1}</span>
                            <p className="text-xs font-semibold text-gray-800 truncate max-w-[100px]">{t.name}</p>
                          </div>
                          <span className="text-xs font-black text-gray-900">{t.pts}pts</span>
                        </div>
                      ))}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
