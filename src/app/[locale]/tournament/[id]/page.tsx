"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Users, MapPin, Share2, MoreHorizontal,
  CheckCircle2, AlertCircle, Clock, BarChart3, Zap, Eye,
  Trophy, Shield,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOURNAMENT = {
  name: "Spring Cup 2025",
  status: "active" as const,
  location: "Sports Centre Ljubljana",
  date: "May 10–12, 2025",
  teams: 16,
  matches: 24,
  fields: 4,
  players: 156,
  referees: 4,
};

const PROGRESS_STEPS = [
  { label: "Setup", done: true },
  { label: "Registration", done: true },
  { label: "Groups", done: true },
  { label: "Matches", active: true },
  { label: "Knockout", pending: true },
  { label: "Finished", pending: true },
];

const TODAY_MATCHES = [
  { time: "09:00", field: "Field 1", home: "Young Stars", away: "NK Bravo", homeScore: 1, awayScore: 1, status: "done" },
  { time: "10:15", field: "Field 2", home: "FC Galaxy", away: "Blue Tigers", homeScore: 0, awayScore: 3, status: "done" },
  { time: "11:30", field: "Field 1", home: "NK Olimpija", away: "NK Maribor", homeScore: 2, awayScore: 1, status: "live", minute: "75'" },
  { time: "12:45", field: "Field 3", home: "ND Gorica", away: "FC Koper", status: "soon" },
  { time: "14:00", field: "Field 4", home: "FC Victoria", away: "Inter Ljubljana", status: "soon" },
];

const ALERTS = [
  { type: "warning", text: "Missing score — FC Galaxy vs NK Bravo (09:00)" },
  { type: "warning", text: "Referee unassigned — Field 3, 14:00" },
  { type: "ok", text: "All groups confirmed and locked" },
];

const TOP_SCORERS = [
  { rank: 1, name: "Luka K.", team: "NK Olimpija", goals: 7 },
  { rank: 2, name: "Marko P.", team: "Blue Tigers", goals: 6 },
  { rank: 3, name: "Tim R.", team: "FC Galaxy", goals: 5 },
  { rank: 4, name: "Andrej S.", team: "NK Maribor", goals: 5 },
];

const NAV_TABS = [
  { label: "Overview", href: "" },
  { label: "Matches", href: "/schedule" },
  { label: "Standings", href: "/standings" },
  { label: "Teams", href: "/teams" },
  { label: "Bracket", href: "/bracket" },
  { label: "Referees", href: "/referees" },
  { label: "Settings", href: "/settings" },
];

export default function TournamentOverviewPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const base = `/${locale}/tournament/${id}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <AppHeader locale={locale} userName="Alex Johnson" />

      <div className="flex flex-1 min-h-0">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-5 lg:px-6">

            {/* Tournament header */}
            <div className="flex items-start justify-between gap-4 mb-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">{TOURNAMENT.name}</h1>
                <Badge variant="live" pulse>Live</Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="flex items-center gap-1.5 h-8 px-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition-colors shadow-sm">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Public Page</span>
                </button>
                <button className="flex items-center gap-1.5 h-8 px-3 bg-brand-600 hover:bg-brand-700 rounded-xl text-xs text-white font-semibold transition-colors">
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button className="h-8 w-8 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 transition-colors shadow-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4 flex items-center gap-3">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{TOURNAMENT.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{TOURNAMENT.date}</span>
            </p>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-0 mb-5 -mx-4 px-4 lg:mx-0 lg:px-0">
              {NAV_TABS.map(({ label, href }) => {
                const isOverview = href === "";
                return (
                  <Link
                    key={label}
                    href={href ? `${base}${href}` : base}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                      isOverview
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "Teams", value: TOURNAMENT.teams, icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
                { label: "Matches", value: TOURNAMENT.matches, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Fields", value: TOURNAMENT.fields, icon: MapPin, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Players", value: TOURNAMENT.players, icon: Trophy, color: "text-live-600", bg: "bg-live-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} border border-gray-200/60 rounded-2xl p-4 text-center`}>
                  <p className={`text-2xl font-black ${color} leading-none`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {ALERTS.some(a => a.type === "warning") && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-800 mb-2">Needs attention</p>
                <div className="space-y-1.5">
                  {ALERTS.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {a.type === "warning"
                        ? <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        : <CheckCircle2 className="h-3.5 w-3.5 text-live-500 shrink-0" />
                      }
                      <p className="text-xs text-amber-900">{a.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Today's matches */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-900">Today&apos;s Matches</h2>
                  <Link href={`${base}/schedule`} className="text-xs text-brand-600 font-semibold hover:text-brand-700">
                    View all
                  </Link>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {TODAY_MATCHES.map((m, i) => (
                      <div key={i} className={cn("flex items-center gap-3 px-4 py-3", m.status === "live" && "bg-live-50/50")}>
                        <div className="w-10 shrink-0">
                          <p className="text-xs font-bold text-gray-700">{m.time}</p>
                          <p className="text-[10px] text-gray-400">{m.field}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          {m.status === "live" && (
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-500 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live-500" />
                              </span>
                              <span className="text-[9px] text-live-600 font-bold">LIVE {m.minute}</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-800 truncate font-medium">
                            {m.home} <span className="text-gray-400 font-normal">vs</span> {m.away}
                          </p>
                        </div>
                        <div className="shrink-0 w-12 text-right">
                          {m.homeScore !== undefined && m.awayScore !== undefined ? (
                            <span className={cn(
                              "text-sm font-bold tabular-nums",
                              m.status === "live" ? "text-live-600" : "text-gray-700"
                            )}>
                              {m.homeScore}–{m.awayScore}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">–</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enter results */}
                <Link
                  href={`${base}/live`}
                  className="mt-3 flex items-center justify-center gap-2 h-10 bg-live-600 hover:bg-live-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Enter Results
                </Link>
              </div>

              {/* Progress */}
              <div className="lg:col-span-1">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Tournament Progress</h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="space-y-3">
                    {PROGRESS_STEPS.map(({ label, done, active, pending }, i) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                          done ? "bg-live-500 text-white" : active ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        <p className={cn(
                          "flex-1 text-sm font-medium",
                          done ? "text-gray-400" : active ? "text-gray-900" : "text-gray-400"
                        )}>
                          {label}
                        </p>
                        {done && <span className="text-[10px] text-gray-400">Done</span>}
                        {active && <span className="text-[10px] text-brand-600 font-semibold">In progress</span>}
                        {pending && <span className="text-[10px] text-gray-300">Pending</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staff summary */}
                <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-700 mb-3">Staff & Fields</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-black text-gray-900">{TOURNAMENT.referees}</p>
                        <p className="text-[10px] text-gray-500">Referees</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-black text-gray-900">{TOURNAMENT.fields}</p>
                        <p className="text-[10px] text-gray-500">Fields</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top scorers */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-900">Top Scorers</h2>
                  <Link href={`${base}/standings`} className="text-xs text-brand-600 font-semibold hover:text-brand-700">
                    Full stats
                  </Link>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {TOP_SCORERS.map(({ rank, name, team, goals }) => (
                      <div key={rank} className="flex items-center gap-3 px-4 py-3">
                        <span className={cn(
                          "text-xs font-bold w-4 shrink-0",
                          rank === 1 ? "text-amber-500" : "text-gray-400"
                        )}>
                          {rank}
                        </span>
                        <div className="h-7 w-7 bg-brand-100 rounded-full flex items-center justify-center text-[10px] text-brand-700 font-bold shrink-0">
                          {name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{team}</p>
                        </div>
                        <span className="text-sm font-black text-brand-600 shrink-0">{goals}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">Recent Activity</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { text: "NK Olimpija 2–1 NK Maribor — result saved", time: "2m ago" },
                      { text: "FC Victoria registered — Group C", time: "1h ago" },
                      { text: "Field 2 maintenance scheduled 18:00–20:00", time: "3h ago" },
                    ].map((e, i) => (
                      <div key={i}>
                        <p className="text-xs text-gray-600 leading-snug">{e.text}</p>
                        <p className="text-[10px] text-gray-400">{e.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View public page */}
                <Link
                  href={`/${locale}/t/${id}`}
                  className="mt-3 flex items-center justify-center gap-2 h-10 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Public Page
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
