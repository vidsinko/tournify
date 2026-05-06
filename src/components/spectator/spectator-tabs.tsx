"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  time: string;
  pitch: string;
  group: string;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
}

interface Standing {
  rank: number;
  team: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gd: number;
  pts: number;
  advances: boolean;
}

interface SpectatorTabsProps {
  matches: Match[];
  standings: Standing[];
  locale: string;
}

export function SpectatorTabs({ matches, standings, locale }: SpectatorTabsProps) {
  const [activeTab, setActiveTab] = useState("schedule");

  const tabs = [
    { id: "schedule", label: "Schedule" },
    { id: "standings", label: "Standings" },
    { id: "bracket", label: "Bracket" },
  ];

  return (
    <div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

      {activeTab === "schedule" && (
        <div className="space-y-2">
          {matches.map((match) => (
            <div
              key={match.id}
              className={cn(
                "bg-surface-800 border rounded-xl px-4 py-3",
                match.status === "live"
                  ? "border-live-800/50 bg-live-950/20"
                  : "border-surface-700"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-surface-400">{match.time}</span>
                <span className="text-xs text-surface-500">{match.pitch}</span>
                <Badge variant="outline" size="sm">Grp {match.group}</Badge>
                {match.status === "live" && (
                  <Badge variant="live" pulse size="sm" className="ml-auto">LIVE</Badge>
                )}
                {match.status === "completed" && (
                  <Badge variant="default" size="sm" className="ml-auto">FT</Badge>
                )}
              </div>
              <div className="flex items-center justify-center gap-4">
                <span className={cn("text-sm font-semibold flex-1 text-right", match.status === "live" && "text-white")}>{match.home}</span>
                <span className="text-lg font-bold text-white min-w-[48px] text-center">
                  {match.status !== "scheduled"
                    ? `${match.homeScore ?? 0}–${match.awayScore ?? 0}`
                    : "vs"}
                </span>
                <span className={cn("text-sm font-semibold flex-1", match.status === "live" && "text-white")}>{match.away}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "standings" && (
        <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-700">
            <h3 className="text-sm font-semibold text-white">Group A</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-surface-500 border-b border-surface-700">
                  <th className="text-left px-4 py-2">#</th>
                  <th className="text-left px-4 py-2">Team</th>
                  <th className="text-center px-2 py-2">P</th>
                  <th className="text-center px-2 py-2">W</th>
                  <th className="text-center px-2 py-2">D</th>
                  <th className="text-center px-2 py-2">L</th>
                  <th className="text-center px-2 py-2">GD</th>
                  <th className="text-center px-2 py-2 font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr
                    key={row.team}
                    className={cn(
                      "border-b border-surface-700/50 last:border-0",
                      row.advances && "bg-brand-900/10"
                    )}
                  >
                    <td className="px-4 py-2.5 text-surface-400">{row.rank}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{row.team}</span>
                        {row.advances && (
                          <span className="text-xs text-brand-400">↑</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center px-2 py-2.5 text-surface-300">{row.p}</td>
                    <td className="text-center px-2 py-2.5 text-live-400">{row.w}</td>
                    <td className="text-center px-2 py-2.5 text-surface-400">{row.d}</td>
                    <td className="text-center px-2 py-2.5 text-danger-400">{row.l}</td>
                    <td className="text-center px-2 py-2.5 text-surface-300">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                    <td className="text-center px-2 py-2.5 font-bold text-white">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-surface-700">
            <p className="text-xs text-surface-500">↑ Advances to knockout stage</p>
          </div>
        </div>
      )}

      {activeTab === "bracket" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Semifinals */}
          <div className="shrink-0 w-44 space-y-6">
            <p className="text-xs font-semibold text-surface-500 uppercase mb-3">Semifinals</p>
            {[
              { home: "FC Lions", away: "Eagles", homeScore: 2, awayScore: 1, done: true },
              { home: "Red Hawks", away: "Tigers", homeScore: undefined, awayScore: undefined, done: false },
            ].map((match, i) => (
              <div key={i} className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden">
                {[
                  { name: match.home, score: match.homeScore, winner: match.done && (match.homeScore ?? 0) > (match.awayScore ?? 0) },
                  { name: match.away, score: match.awayScore, winner: match.done && (match.awayScore ?? 0) > (match.homeScore ?? 0) },
                ].map((team, j) => (
                  <div key={j} className={cn("flex items-center justify-between px-3 py-2 text-sm border-b last:border-0 border-surface-700", team.winner && "bg-brand-900/20")}>
                    <span className={cn("font-medium", team.winner ? "text-white" : "text-surface-400")}>{team.name}</span>
                    <span className={cn("font-bold", team.winner ? "text-brand-400" : "text-surface-400")}>{team.score ?? "–"}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Final */}
          <div className="shrink-0 w-44 flex flex-col justify-center">
            <p className="text-xs font-semibold text-surface-500 uppercase mb-3">Final</p>
            <div className="bg-surface-800 border border-brand-800/50 rounded-xl overflow-hidden">
              {[
                { name: "FC Lions", score: undefined, winner: false },
                { name: "TBD", score: undefined, winner: false },
              ].map((team, j) => (
                <div key={j} className="flex items-center justify-between px-3 py-2 text-sm border-b last:border-0 border-surface-700">
                  <span className="font-medium text-surface-300">{team.name}</span>
                  <span className="font-bold text-surface-500">–</span>
                </div>
              ))}
            </div>
          </div>

          {/* Champion */}
          <div className="shrink-0 w-32 flex flex-col justify-center items-center">
            <p className="text-xs font-semibold text-surface-500 uppercase mb-3">Champion</p>
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-xs text-surface-400 text-center">TBD</p>
          </div>
        </div>
      )}
    </div>
  );
}
