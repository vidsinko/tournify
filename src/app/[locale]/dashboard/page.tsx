import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Trophy, Plus, Calendar, BarChart3, Users, Zap, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    date_end: "2025-05-10",
    _count: { teams: 16, matches: 24, referees: 4 },
  },
  {
    id: "youth-championship",
    name: "Youth Championship U14",
    sport: "football" as const,
    status: "upcoming" as const,
    location: "Stadion Šiška",
    date_start: "2025-06-15",
    date_end: "2025-06-15",
    _count: { teams: 8, matches: 0, referees: 2 },
  },
  {
    id: "summer-invitational",
    name: "Summer Invitational 2025",
    sport: "futsal" as const,
    status: "draft" as const,
    location: "Sportna Dvorana Tivoli",
    date_start: "2025-07-20",
    date_end: "2025-07-20",
    _count: { teams: 12, matches: 0, referees: 0 },
  },
  {
    id: "winter-cup-2024",
    name: "Winter Cup 2024",
    sport: "football" as const,
    status: "completed" as const,
    location: "Sports Centre Ljubljana",
    date_start: "2024-12-07",
    date_end: "2024-12-07",
    _count: { teams: 12, matches: 18, referees: 3 },
  },
];

const STATUS_BADGE_MAP = {
  active: "live" as const,
  upcoming: "brand" as const,
  draft: "outline" as const,
  completed: "default" as const,
  cancelled: "danger" as const,
};

const SPORT_EMOJI: Record<string, string> = {
  football: "⚽",
  basketball: "🏀",
  volleyball: "🏐",
  handball: "🤾",
  futsal: "⚽",
  other: "🏅",
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
    { label: t("stats.total"), value: 4, icon: Trophy, color: "text-brand-400" },
    { label: t("stats.active"), value: 1, icon: Zap, color: "text-live-400" },
    { label: t("stats.teams"), value: 48, icon: Users, color: "text-purple-400" },
    { label: t("stats.matches"), value: 42, icon: Calendar, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} userName="Alex Johnson" userEmail="alex@example.com" />
        <main className="flex-1 p-4 lg:p-6 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">
                {t("welcome")} Alex 👋
              </h1>
              <p className="text-surface-400 text-sm mt-0.5">{t("subtitle")}</p>
            </div>
            <Link href={`/${locale}/tournament/create`}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                {t("createTournament")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-surface-700 rounded-lg flex items-center justify-center">
                      <Icon className={`h-4.5 w-4.5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{value}</p>
                      <p className="text-xs text-surface-400">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tournaments */}
          <div className="mb-2">
            <h2 className="text-base font-semibold text-white mb-4">{t("myTournaments")}</h2>

            {/* Active first */}
            <div className="space-y-3">
              {MOCK_TOURNAMENTS.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/${locale}/tournament/${tournament.id}`}
                  className="block"
                >
                  <Card hover>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 bg-surface-700 rounded-xl flex items-center justify-center text-2xl shrink-0">
                          {SPORT_EMOJI[tournament.sport] || "🏅"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white text-sm">{tournament.name}</h3>
                            <Badge
                              variant={STATUS_BADGE_MAP[tournament.status]}
                              pulse={tournament.status === "active"}
                            >
                              {tournament.status === "active" && "● "}
                              {tn(`status.${tournament.status}`)}
                            </Badge>
                          </div>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {tournament.location} · {formatDate(tournament.date_start)}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-500">
                            <span>{tournament._count.teams} teams</span>
                            <span>·</span>
                            <span>{tournament._count.matches} matches</span>
                            {tournament._count.referees > 0 && (
                              <>
                                <span>·</span>
                                <span>{tournament._count.referees} referees</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-surface-600 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h2 className="text-base font-semibold text-white mb-4">{t("quickActions")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Calendar, label: t("viewSchedule"), href: `/${locale}/tournament/spring-cup-2025/schedule` },
                { icon: Users, label: t("manageTeams"), href: `/${locale}/tournament/spring-cup-2025/teams` },
                { icon: BarChart3, label: t("enterResults"), href: `/${locale}/tournament/spring-cup-2025/live` },
                { icon: Trophy, label: t("exportPDF"), href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <Link key={label} href={href}>
                  <Card hover className="text-center">
                    <CardContent className="py-4">
                      <Icon className="h-5 w-5 text-brand-400 mx-auto mb-2" />
                      <p className="text-xs text-surface-300 font-medium">{label}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
