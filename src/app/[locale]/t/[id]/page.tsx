import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Trophy, MapPin, Calendar, Share2, QrCode, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SpectatorTabs } from "@/components/spectator/spectator-tabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Spring Cup 2025 — Tournify` };
}

const MOCK_MATCHES = [
  { id: "m1", time: "09:00", pitch: "Pitch 1", group: "A", home: "FC Lions", away: "Red Hawks", homeScore: 2, awayScore: 1, status: "completed" },
  { id: "m2", time: "09:00", pitch: "Pitch 2", group: "B", home: "Eagles", away: "Tigers", homeScore: 0, awayScore: 0, status: "live" },
  { id: "m3", time: "09:25", pitch: "Pitch 1", group: "A", home: "Blue Stars", away: "United FC", homeScore: undefined, awayScore: undefined, status: "scheduled" },
  { id: "m4", time: "09:25", pitch: "Pitch 2", group: "B", home: "City Boys", away: "Wolves", homeScore: undefined, awayScore: undefined, status: "scheduled" },
  { id: "m5", time: "09:50", pitch: "Pitch 1", group: "C", home: "Green Team", away: "Phoenix", homeScore: undefined, awayScore: undefined, status: "scheduled" },
];

const MOCK_STANDINGS = [
  { rank: 1, team: "FC Lions", p: 2, w: 2, d: 0, l: 0, gd: 4, pts: 6, advances: true },
  { rank: 2, team: "Red Hawks", p: 2, w: 1, d: 0, l: 1, gd: 1, pts: 3, advances: true },
  { rank: 3, team: "Blue Stars", p: 2, w: 1, d: 0, l: 1, gd: -1, pts: 3, advances: false },
  { rank: 4, team: "United FC", p: 2, w: 0, d: 0, l: 2, gd: -4, pts: 0, advances: false },
];

export default async function SpectatorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "spectator" });
  const ts = await getTranslations({ locale, namespace: "schedule" });

  const liveMatches = MOCK_MATCHES.filter((m) => m.status === "live");

  return (
    <div className="min-h-screen">
      {/* Tournament Header */}
      <header className="bg-surface-900 border-b border-surface-800 px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-brand-900/50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                ⚽
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-white">Spring Cup 2025</h1>
                  <Badge variant="live" pulse>
                    {ts("status.live")}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Sports Centre Ljubljana
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    10 May 2025
                  </span>
                </div>
              </div>
            </div>
            <button className="p-2 rounded-lg bg-surface-800 text-surface-400 hover:text-white transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Teams", value: 16 },
              { label: "Matches", value: "24/36" },
              { label: "Live now", value: liveMatches.length, color: "text-live-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-surface-800 rounded-lg p-2.5 text-center">
                <p className={`text-lg font-bold ${color || "text-white"}`}>{value}</p>
                <p className="text-xs text-surface-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Live matches banner */}
      {liveMatches.length > 0 && (
        <div className="bg-live-900/20 border-b border-live-900/50 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3.5 w-3.5 text-live-400" />
              <span className="text-xs font-semibold text-live-400 uppercase tracking-wide">Live</span>
            </div>
            <div className="space-y-2">
              {liveMatches.map((match) => (
                <div key={match.id} className="flex items-center gap-3 bg-surface-800/50 rounded-lg px-3 py-2.5">
                  <span className="text-xs text-surface-500 w-12">{match.pitch}</span>
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <span className="text-sm font-semibold text-white">{match.home}</span>
                    <span className="text-xl font-bold text-live-400 min-w-[40px] text-center">
                      {match.homeScore ?? 0}–{match.awayScore ?? 0}
                    </span>
                    <span className="text-sm font-semibold text-white">{match.away}</span>
                  </div>
                  <span className="animate-live-pulse text-xs font-bold text-live-400">●</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content tabs */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <SpectatorTabs matches={MOCK_MATCHES} standings={MOCK_STANDINGS} locale={locale} />
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-800 mt-8 px-4 py-5 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-surface-500">
          <Trophy className="h-3.5 w-3.5 text-brand-500" />
          {t("poweredBy")}
        </div>
      </footer>
    </div>
  );
}
