import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Trophy, Clock, MapPin, ArrowRight, Users, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";

const TEAM_DATA = {
  name: "FC Lions",
  club: "FC Lions Academy",
  group: "A",
  groupRank: 1,
  groupPoints: 6,
};

const UPCOMING_MATCHES = [
  {
    id: "m5",
    time: new Date("2025-05-10T11:00:00"),
    pitch: "Pitch 2",
    opponent: "Blue Stars",
    group: "A",
    isHome: true,
  },
  {
    id: "m7",
    time: new Date("2025-05-10T12:30:00"),
    pitch: "Pitch 1",
    opponent: "United FC",
    group: "A",
    isHome: false,
  },
];

const PAST_MATCHES = [
  { id: "m1", time: new Date("2025-05-10T09:00:00"), opponent: "Red Hawks", homeScore: 2, awayScore: 1, isHome: true },
  { id: "m3", time: new Date("2025-05-10T09:50:00"), opponent: "Eagles", homeScore: 1, awayScore: 0, isHome: false },
];

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "player" });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-surface-900 border-b border-surface-800 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Tournify</span>
          </Link>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">Player View</p>
            <p className="text-xs text-surface-400">Spring Cup 2025</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* My Team */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-brand-900/50 rounded-xl flex items-center justify-center text-2xl">
                ⚽
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">{TEAM_DATA.name}</h2>
                  <Badge variant="brand" size="sm">Group {TEAM_DATA.group}</Badge>
                </div>
                <p className="text-xs text-surface-400">{TEAM_DATA.club}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-surface-900 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-brand-400">#{TEAM_DATA.groupRank}</p>
                <p className="text-xs text-surface-400">{t("groupStanding")}</p>
              </div>
              <div className="bg-surface-900 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-white">{TEAM_DATA.groupPoints} pts</p>
                <p className="text-xs text-surface-400">Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next matches */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">{t("nextMatch")}</h2>
          <div className="space-y-2">
            {UPCOMING_MATCHES.map((match) => (
              <Card key={match.id}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3.5 w-3.5 text-brand-400" />
                    <span className="text-sm font-semibold text-white">{formatTime(match.time)}</span>
                    <MapPin className="h-3.5 w-3.5 text-surface-400 ml-2" />
                    <span className="text-xs text-surface-400">{match.pitch}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 text-sm font-semibold ${match.isHome ? "text-white" : "text-surface-400"} text-right`}>
                      {TEAM_DATA.name}
                    </div>
                    <span className="text-surface-500 text-xs">vs</span>
                    <div className={`flex-1 text-sm font-semibold ${!match.isHome ? "text-white" : "text-surface-400"}`}>
                      {match.opponent}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past results */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">{t("matchHistory")}</h2>
          <div className="space-y-2">
            {PAST_MATCHES.map((match) => {
              const myScore = match.isHome ? match.homeScore : match.awayScore;
              const theirScore = match.isHome ? match.awayScore : match.homeScore;
              const won = myScore > theirScore;
              const drew = myScore === theirScore;
              return (
                <div key={match.id} className="flex items-center gap-3 bg-surface-800 border border-surface-700 rounded-xl px-4 py-3">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${won ? "bg-live-900/50 text-live-400" : drew ? "bg-surface-700 text-surface-400" : "bg-danger-900/50 text-danger-400"}`}>
                    {won ? "W" : drew ? "D" : "L"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {TEAM_DATA.name} {myScore}–{theirScore} {match.opponent}
                    </p>
                    <p className="text-xs text-surface-500">{formatTime(match.time)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spectator link */}
        <Link href={`/${locale}/t/spring-cup-2025`}>
          <Card hover>
            <CardContent className="py-3 flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-brand-400" />
              <span className="text-sm text-surface-300 flex-1">View full tournament</span>
              <ArrowRight className="h-4 w-4 text-surface-500" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
