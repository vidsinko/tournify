"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Search, Users, Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Team {
  name: string;
  group: string;
  players: number;
  coach: string;
  color: string;
}

const TEAMS: Record<string, Team[]> = {
  "Group A": [
    { name: "NK Olimpija", group: "Group A", players: 15, coach: "M. Kek", color: "bg-green-500" },
    { name: "Young Stars", group: "Group A", players: 13, coach: "T. Novak", color: "bg-yellow-400" },
    { name: "NK Bravo", group: "Group A", players: 14, coach: "J. Zupan", color: "bg-blue-500" },
    { name: "FC Victoria", group: "Group A", players: 12, coach: "A. Sok", color: "bg-red-500" },
  ],
  "Group B": [
    { name: "Blue Tigers", group: "Group B", players: 14, coach: "P. Petric", color: "bg-blue-700" },
    { name: "NK Maribor", group: "Group B", players: 15, coach: "D. Rovan", color: "bg-purple-600" },
    { name: "Red Stars", group: "Group B", players: 13, coach: "L. Horvat", color: "bg-red-600" },
    { name: "FC Galaxy", group: "Group B", players: 11, coach: "M. Beric", color: "bg-indigo-500" },
  ],
  "Group C": [
    { name: "ND Gorica", group: "Group C", players: 14, coach: "B. Cesar", color: "bg-sky-500" },
    { name: "FC Koper", group: "Group C", players: 15, coach: "S. Vuk", color: "bg-orange-500" },
    { name: "Inter Ljubljana", group: "Group C", players: 13, coach: "N. Juric", color: "bg-teal-500" },
    { name: "NK Celje", group: "Group C", players: 12, coach: "R. Matjaz", color: "bg-amber-600" },
  ],
  "Group D": [
    { name: "NK Bravo II", group: "Group D", players: 13, coach: "J. Zupan Jr.", color: "bg-blue-400" },
    { name: "Blue Wave", group: "Group D", players: 14, coach: "T. Remic", color: "bg-cyan-500" },
    { name: "Young Stars II", group: "Group D", players: 11, coach: "T. Novak Jr.", color: "bg-yellow-500" },
    { name: "Inter B", group: "Group D", players: 12, coach: "N. Juric Jr.", color: "bg-emerald-500" },
  ],
};

const ALL_TEAMS = Object.values(TEAMS).flat();
const GROUP_KEYS = Object.keys(TEAMS);

export default function TeamsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");

  const filtered = ALL_TEAMS.filter((t) =>
    (activeGroup === "All" || t.group === activeGroup) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = activeGroup === "All"
    ? GROUP_KEYS.map((g) => ({ group: g, teams: filtered.filter((t) => t.group === g) })).filter((g) => g.teams.length > 0)
    : [{ group: activeGroup, teams: filtered }];

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <AppHeader locale={locale} userName="Alex Johnson" />

      <div className="flex flex-1 min-h-0">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-4 py-5 lg:px-6">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Teams</h1>
                <p className="text-sm text-gray-500 mt-0.5">{ALL_TEAMS.length} teams · Spring Cup 2025</p>
              </div>
              <button className="flex items-center gap-2 h-9 px-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Team</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Group filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
              {["All", ...GROUP_KEYS].map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                    activeGroup === g
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Teams grouped */}
            <div className="space-y-5">
              {grouped.map(({ group, teams }) => (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-bold text-gray-700">{group}</h2>
                    <span className="text-xs text-gray-400">{teams.length} teams</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {teams.map((team) => (
                      <div
                        key={team.name}
                        className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-px transition-all shadow-sm cursor-pointer"
                      >
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0", team.color)}>
                          {team.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{team.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <Users className="h-3 w-3" />
                              {team.players} players
                            </span>
                            <span className="text-[11px] text-gray-400">· {team.coach}</span>
                          </div>
                        </div>
                        <Badge variant="default" size="sm">{team.group}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No teams found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
