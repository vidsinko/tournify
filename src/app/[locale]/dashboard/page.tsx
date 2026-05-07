import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Trophy, Plus, Calendar, Users, ArrowRight, Clock, MapPin,
  Zap, BarChart3, CheckCircle2, AlertCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title") };
}

const LIVE_MATCHES = [
  {
    id: "m1",
    home: "NK Olimpija",
    away: "NK Maribor",
    homeScore: 2,
    awayScore: 1,
    minute: "75'",
    field: "Field 1",
    group: "Group A",
  },
  {
    id: "m2",
    home: "FC Galaxy",
    away: "Blue Tigers",
    homeScore: 0,
    awayScore: 2,
    minute: "61'",
    field: "Field 2",
    group: "Group B",
  },
];

const UPCOMING_MATCHES = [
  { time: "12:45", home: "ND Gorica", away: "FC Koper", field: "Field 3", group: "Group A" },
  { time: "14:00", home: "FC Victoria", away: "Inter Ljubljana", field: "Field 4", group: "Group C" },
  { time: "15:30", home: "Young Stars", away: "NK Bravo", field: "Field 1", group: "Group B" },
];

const TOURNAMENTS = [
  {
    id: "spring-cup-2025",
    name: "Spring Cup 2025",
    sport: "football",
    status: "active" as const,
    location: "Sports Centre Ljubljana",
    date_start: "2025-05-10",
    teams: 16,
    matches: 24,
  },
  {
    id: "youth-championship",
    name: "Youth Championship U14",
    sport: "football",
    status: "upcoming" as const,
    location: "Stadion Šiška",
    date_start: "2025-06-15",
    teams: 8,
    matches: 0,
  },
  {
    id: "summer-invitational",
    name: "Summer Invitational 2025",
    sport: "futsal",
    status: "draft" as const,
    location: "Sportna Dvorana Tivoli",
    date_start: "2025-07-20",
    teams: 12,
    matches: 0,
  },
];

const STATUS_MAP = {
  active: { variant: "live" as const, label: "Live" },
  upcoming: { variant: "brand" as const, label: "Upcoming" },
  draft: { variant: "default" as const, label: "Draft" },
  completed: { variant: "outline" as const, label: "Completed" },
};

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <AppHeader locale={locale} userName="Alex Johnson" />

      <div className="flex flex-1 min-h-0">
        <Sidebar locale={locale} userName="Alex Johnson" userEmail="alex@example.com" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 py-5 lg:px-6">

            {/* Page header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Home</h1>
                <p className="text-sm text-gray-500 mt-0.5">Thursday, May 10 · Spring Cup 2025</p>
              </div>
              <Link
                href={`/${locale}/tournament/create`}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Tournament</span>
              </Link>
            </div>

            {/* Live now — most prominent section */}
            {LIVE_MATCHES.length > 0 && (
              <section className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-live-500" />
                  </span>
                  <h2 className="text-sm font-bold text-gray-900">Live Now</h2>
                  <span className="text-xs text-gray-400">{LIVE_MATCHES.length} matches in progress</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {LIVE_MATCHES.map((m) => (
                    <Link
                      key={m.id}
                      href={`/${locale}/tournament/spring-cup-2025/live`}
                      className="block"
                    >
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-px transition-all overflow-hidden">
                        <div className="h-1 bg-live-500" />
                        <div className="px-4 py-3.5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-live-600 uppercase tracking-wide">
                              {m.minute} · {m.field}
                            </span>
                            <Badge variant="live" pulse>Live</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{m.home}</p>
                            </div>
                            <div className="text-center shrink-0 px-3">
                              <p className="text-2xl font-black text-gray-900 tabular-nums leading-none">
                                {m.homeScore}<span className="text-gray-300 mx-0.5">–</span>{m.awayScore}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <p className="text-sm font-semibold text-gray-900 truncate">{m.away}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2">{m.group}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Left: upcoming + quick actions */}
              <div className="lg:col-span-2 space-y-4">

                {/* Upcoming matches */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900">Up Next</h2>
                    <Link
                      href={`/${locale}/tournament/spring-cup-2025/schedule`}
                      className="text-xs text-brand-600 font-semibold hover:text-brand-700"
                    >
                      Full schedule
                    </Link>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {UPCOMING_MATCHES.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-10 shrink-0 text-center">
                            <p className="text-sm font-bold text-gray-900">{m.time}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate font-medium">
                              {m.home} <span className="text-gray-400 font-normal">vs</span> {m.away}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{m.field} · {m.group}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium shrink-0">Soon</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Quick actions */}
                <section>
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { icon: Calendar, label: "Schedule", href: `/${locale}/tournament/spring-cup-2025/schedule`, color: "text-brand-600", bg: "bg-brand-50" },
                      { icon: Users, label: "Teams", href: `/${locale}/tournament/spring-cup-2025/teams`, color: "text-purple-600", bg: "bg-purple-50" },
                      { icon: Zap, label: "Enter Results", href: `/${locale}/tournament/spring-cup-2025/live`, color: "text-live-600", bg: "bg-live-50" },
                      { icon: BarChart3, label: "Standings", href: `/${locale}/tournament/spring-cup-2025/standings`, color: "text-amber-600", bg: "bg-amber-50" },
                    ].map(({ icon: Icon, label, href, color, bg }) => (
                      <Link key={label} href={href}>
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-md hover:border-gray-300 hover:-translate-y-px transition-all cursor-pointer">
                          <div className={`h-9 w-9 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                            <Icon className={`h-4.5 w-4.5 ${color}`} />
                          </div>
                          <p className="text-xs text-gray-700 font-semibold leading-tight">{label}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* My tournaments */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900">My Tournaments</h2>
                    <span className="text-xs text-gray-400">{TOURNAMENTS.length} total</span>
                  </div>
                  <div className="space-y-2">
                    {TOURNAMENTS.map((t) => (
                      <Link key={t.id} href={`/${locale}/tournament/${t.id}`} className="block group">
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-md hover:border-gray-300 hover:-translate-y-px transition-all">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                              <Trophy className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                                <Badge variant={STATUS_MAP[t.status].variant} pulse={t.status === "active"}>
                                  {STATUS_MAP[t.status].label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                  <MapPin className="h-3 w-3" />
                                  {t.location}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(t.date_start)}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right: today's summary */}
              <div className="space-y-4">
                {/* Today's stats */}
                <section>
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Today&apos;s Summary</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Matches", value: 8, sub: "5 remaining", color: "text-brand-600", bg: "bg-brand-50" },
                      { label: "Live", value: 2, sub: "in progress", color: "text-live-600", bg: "bg-live-50" },
                      { label: "Teams", value: 16, sub: "registered", color: "text-purple-600", bg: "bg-purple-50" },
                      { label: "Done", value: 3, sub: "completed", color: "text-gray-500", bg: "bg-gray-50" },
                    ].map(({ label, value, sub, color, bg }) => (
                      <div key={label} className={`${bg} rounded-2xl p-3 border border-gray-200/50`}>
                        <p className={`text-xl font-black ${color} leading-none`}>{value}</p>
                        <p className="text-xs font-semibold text-gray-700 mt-1">{label}</p>
                        <p className="text-[10px] text-gray-400">{sub}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Needs attention */}
                <section>
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Needs Attention</h2>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100">
                      <div className="flex items-start gap-3 px-4 py-3">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">Missing score</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">FC Galaxy vs NK Bravo (09:00)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 px-4 py-3">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">Referee unassigned</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Field 3, 14:00 match</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 px-4 py-3">
                        <CheckCircle2 className="h-4 w-4 text-live-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">Groups finalized</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">All 4 groups confirmed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Enter results CTA */}
                <Link
                  href={`/${locale}/tournament/spring-cup-2025/live`}
                  className="block bg-brand-600 hover:bg-brand-700 text-white rounded-2xl px-4 py-4 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-bold">Enter Results</span>
                  </div>
                  <p className="text-xs text-brand-200">2 matches need scores</p>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
