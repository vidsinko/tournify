import { Trophy, MapPin, Calendar, Share2, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOURNAMENT = {
  name: "Spring Cup 2025",
  location: "Sports Centre Ljubljana",
  date: "May 10–12, 2025",
  sport: "Football",
  organizer: "FC Ljubljana Academy",
};

const LIVE_MATCHES = [
  { home: "NK Olimpija", away: "NK Maribor", homeScore: 2, awayScore: 1, minute: "75'", field: "Field 1" },
  { home: "Red Stars", away: "Blue Wave", homeScore: 0, awayScore: 0, minute: "42'", field: "Field 2" },
];

const RECENT_RESULTS = [
  { home: "Young Stars", away: "NK Bravo", homeScore: 1, awayScore: 1 },
  { home: "FC Galaxy", away: "Blue Tigers", homeScore: 0, awayScore: 3 },
  { home: "ND Gorica", away: "Inter Ljubljana", homeScore: 1, awayScore: 0 },
  { home: "FC Victoria", away: "NK Celje", homeScore: 2, awayScore: 2 },
];

const TOP_SCORERS = [
  { name: "Luka K.", team: "NK Olimpija", goals: 7 },
  { name: "Marko P.", team: "Blue Tigers", goals: 6 },
  { name: "Tim R.", team: "FC Galaxy", goals: 5 },
];

export default async function SpectatorPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Tournify</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <QrCode className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* Tournament info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-lg font-bold text-gray-900">{TOURNAMENT.name}</h1>
            <Badge variant="live" pulse>Live</Badge>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              {TOURNAMENT.location}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              {TOURNAMENT.date}
            </p>
          </div>
        </div>

        {/* Live matches */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live-500" />
            </span>
            <h2 className="text-sm font-bold text-gray-900">Live Now</h2>
          </div>
          <div className="space-y-3">
            {LIVE_MATCHES.map((m, i) => (
              <div key={i} className="bg-white border border-live-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-0.5 bg-live-500" />
                <div className="px-4 py-4">
                  <p className="text-[10px] font-bold text-live-600 mb-3">{m.minute} · {m.field}</p>
                  <div className="flex items-center gap-3">
                    <p className="flex-1 text-sm font-bold text-gray-900 text-right truncate">{m.home}</p>
                    <p className="text-3xl font-black text-gray-900 tabular-nums shrink-0">
                      {m.homeScore}<span className="text-gray-200 mx-1">–</span>{m.awayScore}
                    </p>
                    <p className="flex-1 text-sm font-bold text-gray-900 truncate">{m.away}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent results */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Results</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              {RECENT_RESULTS.map((m, i) => (
                <div key={i} className="flex items-center px-4 py-3 gap-3">
                  <p className="flex-1 text-sm text-gray-700 text-right truncate">{m.home}</p>
                  <p className="text-sm font-bold text-gray-900 tabular-nums shrink-0 w-16 text-center">
                    {m.homeScore} – {m.awayScore}
                  </p>
                  <p className="flex-1 text-sm text-gray-700 truncate">{m.away}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top scorers */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">Top Scorers</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              {TOP_SCORERS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                  <div className="h-7 w-7 bg-brand-100 rounded-full flex items-center justify-center text-[10px] font-bold text-brand-700 shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.team}</p>
                  </div>
                  <span className="text-sm font-black text-brand-600">{s.goals}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 pb-4">
          Powered by <span className="font-semibold text-brand-600">Tournify</span>
        </p>
      </div>
    </div>
  );
}
