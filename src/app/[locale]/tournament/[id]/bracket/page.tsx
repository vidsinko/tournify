"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Download, Trophy } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BracketTeam {
  name: string;
  score?: number;
  winner?: boolean;
}

interface BracketMatch {
  id: string;
  home: BracketTeam;
  away: BracketTeam;
  time?: string;
  pitch?: string;
  done?: boolean;
}

const QUARTERFINALS: BracketMatch[] = [
  { id: "qf1", home: { name: "FC Lions", score: 3, winner: true }, away: { name: "Thunder", score: 1 }, done: true },
  { id: "qf2", home: { name: "Eagles", score: 2, winner: true }, away: { name: "Green Team", score: 2 }, done: true },
  { id: "qf3", home: { name: "Tigers", score: 1 }, away: { name: "Dynamo", score: 2, winner: true }, done: true },
  { id: "qf4", home: { name: "Red Hawks" }, away: { name: "Phoenix" }, time: "14:00", pitch: "Pitch 1", done: false },
];

const SEMIFINALS: BracketMatch[] = [
  { id: "sf1", home: { name: "FC Lions" }, away: { name: "Eagles" }, time: "15:30", pitch: "Pitch 1", done: false },
  { id: "sf2", home: { name: "Dynamo" }, away: { name: "TBD" }, time: "15:30", pitch: "Pitch 2", done: false },
];

const FINAL: BracketMatch = {
  id: "f1",
  home: { name: "TBD" },
  away: { name: "TBD" },
  time: "17:00",
  pitch: "Pitch 1",
  done: false,
};

function BracketMatchCard({ match, compact = false }: { match: BracketMatch; compact?: boolean }) {
  return (
    <div className={cn(
      "bg-surface-800 border rounded-xl overflow-hidden",
      match.done ? "border-surface-700" : "border-brand-800/30"
    )}>
      {[match.home, match.away].map((team, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-between px-3 py-2",
            i === 0 ? "border-b border-surface-700" : "",
            team.winner && "bg-brand-900/20"
          )}
        >
          <span className={cn(
            "text-sm font-medium",
            team.winner ? "text-white" : team.name === "TBD" ? "text-surface-600" : "text-surface-300"
          )}>
            {team.name}
          </span>
          <span className={cn(
            "text-sm font-bold ml-3",
            team.winner ? "text-brand-400" : "text-surface-500"
          )}>
            {match.done ? team.score ?? "–" : "–"}
          </span>
        </div>
      ))}
      {!match.done && match.time && (
        <div className="px-3 py-1.5 border-t border-surface-700 bg-surface-900/50">
          <p className="text-xs text-surface-500">{match.time} · {match.pitch}</p>
        </div>
      )}
    </div>
  );
}

function Connector({ vertical = false }: { vertical?: boolean }) {
  return vertical ? (
    <div className="h-full w-px bg-surface-700 mx-auto" />
  ) : (
    <div className="h-px bg-surface-700 my-auto flex-1" />
  );
}

export default function BracketPage() {
  const t = useTranslations("bracket");
  const { locale, id } = useParams<{ locale: string; id: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />
        <main className="flex-1 p-4 lg:p-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-white">{t("title")}</h1>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              {t("exportBracket")}
            </Button>
          </div>

          {/* Bracket - horizontal layout */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-[700px] py-4">
              {/* Quarterfinals */}
              <div className="flex flex-col gap-2 w-44 shrink-0">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">{t("quarterfinals")}</p>
                <div className="flex flex-col justify-around flex-1 gap-4">
                  {QUARTERFINALS.map((match) => (
                    <BracketMatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>

              {/* Connectors QF -> SF */}
              <div className="flex flex-col justify-around w-6 shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className={cn("h-px w-full bg-surface-700")} />
                  </div>
                ))}
              </div>

              {/* Semifinals */}
              <div className="flex flex-col gap-2 w-44 shrink-0">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">{t("semifinals")}</p>
                <div className="flex flex-col justify-around flex-1 gap-8 my-8">
                  {SEMIFINALS.map((match) => (
                    <BracketMatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>

              {/* Connectors SF -> Final */}
              <div className="w-6 shrink-0 flex flex-col justify-center gap-8 my-8">
                <div className="h-px bg-surface-700" />
                <div className="h-px bg-surface-700" />
              </div>

              {/* Final */}
              <div className="flex flex-col gap-2 w-44 shrink-0">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">{t("final")}</p>
                <div className="flex flex-col justify-center flex-1">
                  <div className="relative">
                    <BracketMatchCard match={FINAL} />
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="brand" size="sm">Final</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Champion */}
              <div className="flex flex-col gap-2 w-32 shrink-0">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">{t("champion")}</p>
                <div className="flex flex-col justify-center flex-1">
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto bg-brand-900/30 border border-brand-800/50 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="h-8 w-8 text-brand-400" />
                    </div>
                    <p className="text-sm text-surface-500 italic">{t("tbd")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Third place */}
          <div className="mt-6 pt-6 border-t border-surface-700">
            <p className="text-sm font-semibold text-surface-400 mb-3">{t("thirdPlace")}</p>
            <div className="max-w-44">
              <BracketMatchCard
                match={{
                  id: "3rd",
                  home: { name: "TBD" },
                  away: { name: "TBD" },
                  time: "16:00",
                  pitch: "Pitch 2",
                  done: false,
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
