"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Filter, MapPin, Clock, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MatchStatus = "done" | "live" | "soon" | "scheduled";

interface Match {
  id: string;
  time: string;
  field: string;
  group: string;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  minute?: string;
  referee?: string;
}

interface Round {
  label: string;
  matches: Match[];
}

const SCHEDULE: Round[] = [
  {
    label: "09:00 – 10:00",
    matches: [
      { id: "m1", time: "09:00", field: "Field 1", group: "Group A", home: "Young Stars", away: "NK Bravo", homeScore: 1, awayScore: 1, status: "done", referee: "J. Novak" },
      { id: "m2", time: "09:00", field: "Field 2", group: "Group B", home: "FC Galaxy", away: "Blue Tigers", homeScore: 0, awayScore: 3, status: "done", referee: "M. Horvat" },
    ],
  },
  {
    label: "10:15 – 11:15",
    matches: [
      { id: "m3", time: "10:15", field: "Field 1", group: "Group C", home: "ND Gorica", away: "Inter Ljubljana", homeScore: 1, awayScore: 0, status: "done", referee: "J. Novak" },
      { id: "m4", time: "10:15", field: "Field 3", group: "Group D", home: "FC Victoria", away: "NK Celje", homeScore: 2, awayScore: 2, status: "done", referee: "T. Remic" },
    ],
  },
  {
    label: "11:30 – 12:30",
    matches: [
      { id: "m5", time: "11:30", field: "Field 1", group: "Group A", home: "NK Olimpija", away: "NK Maribor", homeScore: 2, awayScore: 1, status: "live", minute: "75'", referee: "J. Novak" },
      { id: "m6", time: "11:30", field: "Field 2", group: "Group B", home: "Red Stars", away: "Blue Wave", homeScore: 0, awayScore: 0, status: "live", minute: "42'", referee: "M. Horvat" },
    ],
  },
  {
    label: "12:45 – 13:45",
    matches: [
      { id: "m7", time: "12:45", field: "Field 3", group: "Group C", home: "ND Gorica", away: "FC Koper", status: "soon", referee: "T. Remic" },
      { id: "m8", time: "12:45", field: "Field 4", group: "Group D", home: "NK Celje", away: "Young Stars", status: "soon", referee: "A. Sok" },
    ],
  },
  {
    label: "14:00 – 15:00",
    matches: [
      { id: "m9", time: "14:00", field: "Field 4", group: "Group A", home: "FC Victoria", away: "Inter Ljubljana", status: "scheduled" },
      { id: "m10", time: "14:00", field: "Field 1", group: "Group B", home: "NK Bravo", away: "Blue Tigers", status: "scheduled" },
    ],
  },
  {
    label: "15:30 – 16:30",
    matches: [
      { id: "m11", time: "15:30", field: "Field 2", group: "Group C", home: "Young Stars", away: "NK Bravo", status: "scheduled" },
      { id: "m12", time: "15:30", field: "Field 3", group: "Group D", home: "Red Stars", away: "FC Galaxy", status: "scheduled" },
    ],
  },
];

const GROUPS = ["All", "Group A", "Group B", "Group C", "Group D"];
const FIELDS = ["All Fields", "Field 1", "Field 2", "Field 3", "Field 4"];

export default function SchedulePage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const base = `/${locale}/tournament/${id}`;

  const [activeGroup, setActiveGroup] = useState("All");
  const [activeField, setActiveField] = useState("All Fields");

  const filtered = SCHEDULE.map((round) => ({
    ...round,
    matches: round.matches.filter((m) =>
      (activeGroup === "All" || m.group === activeGroup) &&
      (activeField === "All Fields" || m.field === activeField)
    ),
  })).filter((r) => r.matches.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <AppHeader locale={locale} userName="Alex Johnson" />

      <div className="flex flex-1 min-h-0">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-4 py-5 lg:px-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Match Schedule</h1>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Spring Cup 2025 · May 10, 2025
                </p>
              </div>
              <button className="flex items-center gap-1.5 h-9 px-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium shadow-sm hover:bg-gray-50 transition-colors">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>
            </div>

            {/* Group filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                    activeGroup === g
                      ? "bg-brand-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Field filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {FIELDS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveField(f)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    activeField === f
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  <MapPin className="h-3 w-3" />
                  {f}
                </button>
              ))}
            </div>

            {/* Schedule */}
            <div className="space-y-5">
              {filtered.map((round) => (
                <div key={round.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{round.label}</span>
                  </div>
                  <div className="space-y-2">
                    {round.matches.map((m) => (
                      <Link key={m.id} href={m.status === "live" ? `${base}/live` : `${base}/schedule`}>
                        <div className={cn(
                          "bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-px transition-all",
                          m.status === "live" && "border-live-300"
                        )}>
                          {m.status === "live" && <div className="h-0.5 bg-live-500" />}
                          <div className="px-4 py-3.5 flex items-center gap-3">
                            {/* Time + field */}
                            <div className="w-14 shrink-0">
                              <p className="text-xs font-bold text-gray-800">{m.time}</p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="h-2.5 w-2.5" />{m.field}
                              </p>
                            </div>

                            {/* Teams */}
                            <div className="flex-1 min-w-0">
                              {m.status === "live" && (
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-500 opacity-75" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live-500" />
                                  </span>
                                  <span className="text-[9px] text-live-600 font-bold">{m.minute}</span>
                                </div>
                              )}
                              <p className="text-sm font-semibold text-gray-900 truncate">{m.home}</p>
                              <p className="text-sm text-gray-500 truncate">{m.away}</p>
                            </div>

                            {/* Score */}
                            <div className="text-center w-14 shrink-0">
                              {m.homeScore !== undefined && m.awayScore !== undefined ? (
                                <div>
                                  <p className={cn(
                                    "text-lg font-black tabular-nums leading-none",
                                    m.status === "live" ? "text-live-600" : "text-gray-900"
                                  )}>
                                    {m.homeScore}<span className="text-gray-300 mx-0.5">–</span>{m.awayScore}
                                  </p>
                                  <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                                    {m.status === "live" ? m.minute : "FT"}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-lg font-black text-gray-200">–</p>
                              )}
                            </div>

                            {/* Group + arrow */}
                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                              <Badge variant="default" size="sm">{m.group}</Badge>
                              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
