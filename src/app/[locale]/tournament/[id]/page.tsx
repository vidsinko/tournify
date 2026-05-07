"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  Trophy,
  Zap,
  FileDown,
  BarChart3,
  Clock,
  Megaphone,
  Activity,
  MapPin,
  Share2,
  MoreHorizontal,
  CheckCircle,
  Eye,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOURNAMENT = {
  id: "spring-cup-2025",
  name: "Spring Cup 2025",
  sport: "football" as const,
  status: "active" as const,
  location: "Sports Centre Ljubljana",
  date_start: "2025-05-10",
  _count: { teams: 16, matches: 24, referees: 4, players: 156 },
};

const STATS = [
  { label: "Teams", value: 24, icon: Users },
  { label: "Matches", value: 48, icon: Calendar },
  { label: "Fields", value: 4, icon: MapPin },
  { label: "Players", value: 156, icon: Trophy },
];

const TODAY_MATCHES = [
  { time: "09:00", field: "Field 1", home: "Young Stars", away: "NK Bravo", homeScore: 1, awayScore: 1, status: "done" },
  { time: "10:15", field: "Field 2", home: "FC Galaxy", away: "Blue Tigers", homeScore: 0, awayScore: 3, status: "done" },
  { time: "11:30", field: "Field 1", home: "NK Olimpija", away: "NK Maribor", homeScore: 2, awayScore: 1, status: "live", minute: "75'" },
  { time: "12:45", field: "Field 3", home: "ND Gorica", away: "FC Koper", status: "soon" },
  { time: "14:00", field: "Field 4", home: "FC Victoria", away: "Inter Ljubljana", status: "soon" },
];

const PROGRESS_STEPS = [
  { label: "Setup", done: true },
  { label: "Registration", done: true },
  { label: "Groups", done: true },
  { label: "Matches", active: true },
  { label: "Knockout", pending: true },
  { label: "Finished", pending: true },
];

const TOP_SCORERS = [
  { rank: 1, name: "Luka K.", team: "NK Olimpija", goals: 7 },
  { rank: 2, name: "Marko P.", team: "Blue Tigers", goals: 6 },
  { rank: 3, name: "Tim R.", team: "FC Galaxy", goals: 5 },
  { rank: 4, name: "Andrej S.", team: "NK Maribor", goals: 5 },
];

const RECENT_ACTIVITY = [
  { icon: "⚽", text: "Match result updated — NK Olimpija 2–1 NK Maribor", time: "2m ago" },
  { icon: "👤", text: "New team registered — FC Victoria", time: "1h ago" },
  { icon: "🏟️", text: "Field 2 maintenance — Today, 18:00–20:00", time: "3h ago" },
];

const NAV_TABS = [
  { label: "Overview", href: "" },
  { label: "Matches", href: "/schedule" },
  { label: "Groups", href: "/standings" },
  { label: "Teams", href: "/teams" },
  { label: "Brackets", href: "/bracket" },
  { label: "Fields", href: "" },
  { label: "Referees", href: "/referees" },
  { label: "Settings", href: "/settings" },
];

export default function TournamentOverviewPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const baseHref = `/${locale}/tournament/${id}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a15]">
      <AppHeader locale={locale} userName="Alex Johnson" />

      <div className="flex flex-1 min-h-0">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" userEmail="alex@example.com" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 py-5 lg:px-6">

            {/* Tournament header */}
            <div className="flex items-start justify-between gap-4 mb-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{TOURNAMENT.name}</h1>
                <Badge variant="live" pulse>Live</Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="flex items-center gap-1.5 h-8 px-3 bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/40 rounded-xl text-xs text-surface-300 transition-colors">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View Public Page</span>
                </button>
                <button className="flex items-center gap-1.5 h-8 px-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-xs text-white font-semibold transition-colors">
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share Tournament</span>
                </button>
                <button className="h-8 w-8 bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/40 rounded-xl flex items-center justify-center text-surface-400 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-surface-800/60 overflow-x-auto gap-0 mb-5 -mx-4 px-4 lg:mx-0 lg:px-0">
              {NAV_TABS.map(({ label, href }) => {
                const isOverview = href === "" && label === "Overview";
                return (
                  <Link
                    key={label}
                    href={href ? `${baseHref}${href}` : baseHref}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                      isOverview
                        ? "border-brand-500 text-white"
                        : "border-transparent text-surface-500 hover:text-surface-300"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {STATS.map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-surface-800/50 border border-surface-700/40 rounded-2xl p-4 text-center"
                >
                  <p className="text-2xl font-black text-white leading-none">{value}</p>
                  <p className="text-xs text-surface-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Today's matches */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white">Today&apos;s matches</h2>
                  <Link
                    href={`${baseHref}/schedule`}
                    className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    View all
                  </Link>
                </div>
                <div className="bg-surface-800/40 border border-surface-700/40 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-surface-700/30">
                    {TODAY_MATCHES.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 shrink-0">
                          <p className="text-xs font-semibold text-surface-400">{m.time}</p>
                          <p className="text-[10px] text-surface-600">{m.field}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          {m.status === "live" && (
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live-500" />
                              </span>
                              <span className="text-[9px] text-live-400 font-bold">LIVE {m.minute}</span>
                            </div>
                          )}
                          <p className="text-xs text-surface-200 truncate">
                            {m.home} vs {m.away}
                          </p>
                        </div>
                        <div className="shrink-0 w-12 text-right">
                          {(m.homeScore !== undefined && m.awayScore !== undefined) ? (
                            <span
                              className={cn(
                                "text-sm font-bold tabular-nums",
                                m.status === "live" ? "text-live-400" : "text-surface-300"
                              )}
                            >
                              {m.homeScore}–{m.awayScore}
                            </span>
                          ) : (
                            <span className="text-xs text-surface-600">–</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <h2 className="text-sm font-semibold text-white mt-4 mb-3">Recent activity</h2>
                <div className="bg-surface-800/40 border border-surface-700/40 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-surface-700/30">
                    {RECENT_ACTIVITY.map(({ icon, text, time }, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3">
                        <div className="h-6 w-6 bg-surface-700/60 rounded-lg flex items-center justify-center shrink-0 text-sm">
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-surface-300 leading-snug">{text}</p>
                          <p className="text-[10px] text-surface-600 mt-0.5">{time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tournament progress */}
              <div className="lg:col-span-1">
                <h2 className="text-sm font-semibold text-white mb-3">Tournament progress</h2>
                <div className="bg-surface-800/40 border border-surface-700/40 rounded-2xl p-4">
                  <div className="space-y-3">
                    {PROGRESS_STEPS.map(({ label, done, active, pending }, i) => (
                      <div key={label} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                            done ? "bg-live-500 text-white" : active ? "bg-brand-600 text-white" : "bg-surface-700 text-surface-500"
                          )}
                        >
                          {done ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              done ? "text-surface-400" : active ? "text-white" : "text-surface-600"
                            )}
                          >
                            {label}
                          </p>
                        </div>
                        {done && (
                          <span className="text-[10px] text-surface-600">Completed</span>
                        )}
                        {active && (
                          <span className="text-[10px] text-brand-400 font-semibold">In progress</span>
                        )}
                        {pending && (
                          <span className="text-[10px] text-surface-700">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export actions */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-surface-800/50 hover:bg-surface-700/60 border border-surface-700/40 rounded-xl text-xs text-surface-300 font-medium transition-colors">
                    <FileDown className="h-3.5 w-3.5" />
                    Export PDF
                  </button>
                  <Link
                    href={`${baseHref}/live`}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-live-900/40 hover:bg-live-900/60 border border-live-800/30 rounded-xl text-xs text-live-400 font-semibold transition-colors"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Enter Results
                  </Link>
                </div>
              </div>

              {/* Top scorers */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white">Top scorers</h2>
                  <Link
                    href={`${baseHref}/standings`}
                    className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    View full statistics
                  </Link>
                </div>
                <div className="bg-surface-800/40 border border-surface-700/40 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-surface-700/30">
                    {TOP_SCORERS.map(({ rank, name, team, goals }) => (
                      <div key={rank} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-xs font-bold text-surface-600 w-4 shrink-0">{rank}</span>
                        <div className="h-7 w-7 bg-brand-800/60 rounded-full flex items-center justify-center text-[10px] text-brand-300 font-bold shrink-0">
                          {name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{name}</p>
                          <p className="text-[10px] text-surface-500 truncate">{team}</p>
                        </div>
                        <span className="text-sm font-black text-brand-400 shrink-0">{goals}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live activity */}
                <div className="mt-4 bg-surface-800/40 border border-surface-700/40 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-live-500" />
                    </span>
                    <span className="text-xs font-semibold text-live-400">Live Activity</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { text: "GOAL! NK Olimpija 2–1 NK Maribor", time: "2m ago" },
                      { text: "Match started: FC Koper vs NK Celje", time: "18m ago" },
                      { text: "Full time: Red Stars 3–0 Blue Wave", time: "34m ago" },
                    ].map((e, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Activity className="h-3 w-3 text-brand-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-surface-300 leading-snug">{e.text}</p>
                          <p className="text-[10px] text-surface-600">{e.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
