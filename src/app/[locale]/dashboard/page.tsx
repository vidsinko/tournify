import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Calendar,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react";
import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title") };
}

const MOCK_TOURNAMENTS = [
  {
    id: "spring-cup-2025",
    name: "Spring Cup 2025",
    sport: "football" as const,
    status: "active" as const,
    location: "Sports Centre Ljubljana",
    date_start: "2025-05-10",
    _count: { teams: 16, matches: 24, referees: 4 },
  },
  {
    id: "youth-championship",
    name: "Youth Championship U14",
    sport: "football" as const,
    status: "upcoming" as const,
    location: "Stadion Šiška",
    date_start: "2025-06-15",
    _count: { teams: 8, matches: 0, referees: 2 },
  },
  {
    id: "summer-invitational",
    name: "Summer Invitational 2025",
    sport: "futsal" as const,
    status: "draft" as const,
    location: "Sportna Dvorana Tivoli",
    date_start: "2025-07-20",
    _count: { teams: 12, matches: 0, referees: 0 },
  },
  {
    id: "winter-cup-2024",
    name: "Winter Cup 2024",
    sport: "football" as const,
    status: "completed" as const,
    location: "Sports Centre Ljubljana",
    date_start: "2024-12-07",
    _count: { teams: 12, matches: 18, referees: 3 },
  },
];

const RECENT_ACTIVITY = [
  { icon: "⚽", text: "Match result updated — FC Olimpija 2–1 NK Maribor", time: "2m ago", color: "text-brand-400" },
  { icon: "👤", text: "New team registered — FC Victoria", time: "1h ago", color: "text-live-400" },
  { icon: "🏟️", text: "Field 2 maintenance — Today, 18:00–20:00", time: "3h ago", color: "text-amber-400" },
];

const STATUS_BADGE_MAP = {
  active: "live" as const,
  upcoming: "brand" as const,
  draft: "outline" as const,
  completed: "default" as const,
  cancelled: "danger" as const,
};

const SPORT_ICON: Record<string, React.ReactNode> = {
  football: <Trophy className="h-5 w-5 text-brand-400" />,
  futsal: <Trophy className="h-5 w-5 text-amber-400" />,
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tn = await getTranslations({ locale, namespace: "tournament" });

  const stats = [
    { label: t("stats.total"), value: 4, icon: Trophy, color: "text-brand-400", bg: "bg-brand-900/40 border-brand-800/30" },
    { label: t("stats.active"), value: 1, icon: Zap, color: "text-live-400", bg: "bg-live-900/40 border-live-800/30" },
    { label: t("stats.teams"), value: 48, icon: Users, color: "text-purple-400", bg: "bg-purple-900/40 border-purple-800/30" },
    { label: t("stats.matches"), value: 42, icon: Calendar, color: "text-amber-400", bg: "bg-amber-900/40 border-amber-800/30" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a15]">
      <AppHeader locale={locale} userName="Alex Johnson" />

      <div className="flex flex-1 min-h-0">
        <Sidebar locale={locale} userName="Alex Johnson" userEmail="alex@example.com" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 lg:px-6">

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">
                  {t("welcome")} Alex 👋
                </h1>
                <p className="text-sm text-surface-500 mt-0.5">{t("subtitle")}</p>
              </div>
              <Link
                href={`/${locale}/tournament/create`}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t("createTournament")}</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className={`rounded-2xl p-4 border ${bg} flex items-center gap-3`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white leading-none">{value}</p>
                    <p className="text-[11px] text-surface-500 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Tournaments list — 2/3 width */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white">{t("myTournaments")}</h2>
                  <span className="text-xs text-surface-500">{MOCK_TOURNAMENTS.length} total</span>
                </div>
                <div className="space-y-2">
                  {MOCK_TOURNAMENTS.map((tournament) => (
                    <Link
                      key={tournament.id}
                      href={`/${locale}/tournament/${tournament.id}`}
                      className="block group"
                    >
                      <div className="bg-surface-800/50 border border-surface-700/40 rounded-2xl px-4 py-3.5 hover:bg-surface-800/80 hover:border-surface-600/60 transition-all hover:-translate-y-px">
                        <div className="flex items-center gap-3">
                          {/* Sport icon */}
                          <div className="h-10 w-10 bg-surface-700/60 rounded-xl flex items-center justify-center shrink-0 border border-surface-600/30">
                            {SPORT_ICON[tournament.sport] ?? <Trophy className="h-5 w-5 text-surface-400" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-white text-sm truncate">
                                {tournament.name}
                              </h3>
                              <Badge
                                variant={STATUS_BADGE_MAP[tournament.status]}
                                pulse={tournament.status === "active"}
                              >
                                {tournament.status === "active" && (
                                  <span className="mr-0.5">●</span>
                                )}
                                {tn(`status.${tournament.status}`)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-surface-500">
                                <MapPin className="h-3 w-3" />
                                {tournament.location}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-surface-500">
                                <Clock className="h-3 w-3" />
                                {formatDate(tournament.date_start)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-600">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {tournament._count.teams} teams
                              </span>
                              {tournament._count.matches > 0 && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {tournament._count.matches} matches
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="h-4 w-4 text-surface-600 group-hover:text-surface-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-white mb-3">{t("quickActions")}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { icon: Calendar, label: t("viewSchedule"), href: `/${locale}/tournament/spring-cup-2025/schedule`, color: "text-brand-400", bg: "bg-brand-900/30" },
                      { icon: Users, label: t("manageTeams"), href: `/${locale}/tournament/spring-cup-2025/teams`, color: "text-purple-400", bg: "bg-purple-900/30" },
                      { icon: BarChart3, label: t("enterResults"), href: `/${locale}/tournament/spring-cup-2025/live`, color: "text-live-400", bg: "bg-live-900/30" },
                      { icon: Trophy, label: t("exportPDF"), href: "#", color: "text-amber-400", bg: "bg-amber-900/30" },
                    ].map(({ icon: Icon, label, href, color, bg }) => (
                      <Link key={label} href={href}>
                        <div className="bg-surface-800/40 border border-surface-700/40 rounded-2xl p-4 text-center hover:bg-surface-800/70 hover:border-surface-600/50 transition-all hover:-translate-y-px cursor-pointer">
                          <div className={`h-8 w-8 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                            <Icon className={`h-4 w-4 ${color}`} />
                          </div>
                          <p className="text-[11px] text-surface-300 font-medium leading-tight">{label}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent activity — 1/3 width */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white">{t("recentActivity")}</h2>
                </div>
                <div className="bg-surface-800/40 border border-surface-700/40 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-surface-700/30">
                    {RECENT_ACTIVITY.map(({ icon, text, time }, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                        <div className="h-7 w-7 bg-surface-700/60 rounded-xl flex items-center justify-center shrink-0 text-base">
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-surface-200 leading-snug">{text}</p>
                          <p className="text-[10px] text-surface-600 mt-0.5">{time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live now indicator */}
                <div className="mt-3 bg-live-900/20 border border-live-800/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-live-500" />
                    </span>
                    <span className="text-xs font-semibold text-live-400">Live Now</span>
                  </div>
                  <p className="text-xs text-surface-300 font-medium">Spring Cup 2025</p>
                  <p className="text-[11px] text-surface-500 mt-0.5">2 matches in progress</p>
                  <Link
                    href={`/${locale}/tournament/spring-cup-2025/live`}
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-live-400 hover:text-live-300 transition-colors"
                  >
                    View live
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
