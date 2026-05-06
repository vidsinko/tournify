"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Trophy, Clock, CheckCircle, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { cn, formatTime } from "@/lib/utils";
import { toast } from "sonner";

const MOCK_MATCHES = [
  {
    id: "m1",
    time: new Date("2025-05-10T09:00:00"),
    pitch: "Pitch 1",
    group: "A",
    home: "FC Lions",
    away: "Red Hawks",
    homeScore: undefined as number | undefined,
    awayScore: undefined as number | undefined,
    status: "scheduled",
  },
  {
    id: "m2",
    time: new Date("2025-05-10T09:25:00"),
    pitch: "Pitch 1",
    group: "A",
    home: "Blue Stars",
    away: "United FC",
    homeScore: undefined as number | undefined,
    awayScore: undefined as number | undefined,
    status: "scheduled",
  },
  {
    id: "m3",
    time: new Date("2025-05-10T09:50:00"),
    pitch: "Pitch 1",
    group: "C",
    home: "Green Team",
    away: "Phoenix",
    homeScore: 3,
    awayScore: 1,
    status: "completed",
  },
];

export default function RefereePage() {
  const t = useTranslations("referee");
  const { locale } = useParams<{ locale: string }>();
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [scoreModal, setScoreModal] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [notes, setNotes] = useState("");
  const [activeMatch, setActiveMatch] = useState<string | null>(null);

  const currentMatch = matches.find((m) => m.id === scoreModal);

  const handleSaveScore = () => {
    if (!scoreModal) return;
    const hs = parseInt(homeScore);
    const as = parseInt(awayScore);
    if (isNaN(hs) || isNaN(as)) {
      toast.error("Please enter valid scores");
      return;
    }
    setMatches((prev) =>
      prev.map((m) =>
        m.id === scoreModal
          ? { ...m, homeScore: hs, awayScore: as, status: "completed" }
          : m
      )
    );
    toast.success("Score saved successfully!");
    setScoreModal(null);
    setHomeScore("");
    setAwayScore("");
    setNotes("");
  };

  const upcomingMatches = matches.filter((m) => m.status !== "completed");
  const completedMatches = matches.filter((m) => m.status === "completed");

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
          <div>
            <p className="text-sm font-semibold text-white">Referee View</p>
            <p className="text-xs text-surface-400">Spring Cup 2025</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Upcoming matches */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">{t("upcoming")}</h2>
          <div className="space-y-2">
            {upcomingMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3.5 w-3.5 text-surface-400" />
                    <span className="text-xs text-surface-400">{formatTime(match.time)}</span>
                    <span className="text-xs text-surface-500">{match.pitch}</span>
                    <Badge variant="outline" size="sm">Grp {match.group}</Badge>
                    {activeMatch === match.id && (
                      <Badge variant="live" pulse size="sm" className="ml-auto">LIVE</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <span className="text-sm font-semibold text-white flex-1 text-right">{match.home}</span>
                    <span className="text-surface-500 text-sm">vs</span>
                    <span className="text-sm font-semibold text-white flex-1">{match.away}</span>
                  </div>
                  <div className="flex gap-2">
                    {activeMatch !== match.id ? (
                      <Button
                        size="sm"
                        variant="live"
                        className="flex-1"
                        onClick={() => setActiveMatch(match.id)}
                      >
                        Start Match
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setActiveMatch(null);
                          setScoreModal(match.id);
                        }}
                      >
                        End Match
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setScoreModal(match.id);
                        setHomeScore(match.homeScore?.toString() ?? "");
                        setAwayScore(match.awayScore?.toString() ?? "");
                      }}
                    >
                      {t("enterScore")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {upcomingMatches.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-live-500 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">All matches completed!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Completed */}
        {completedMatches.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">{t("completed")}</h2>
            <div className="space-y-2">
              {completedMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-3 bg-surface-800 border border-surface-700 rounded-xl px-4 py-3"
                >
                  <CheckCircle className="h-4 w-4 text-live-500 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-surface-300">{match.home}</span>
                      <span className="font-bold text-white">{match.homeScore}–{match.awayScore}</span>
                      <span className="text-surface-300">{match.away}</span>
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{formatTime(match.time)} · {match.pitch}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Score Entry Modal */}
      <Modal
        open={!!scoreModal}
        onClose={() => { setScoreModal(null); setHomeScore(""); setAwayScore(""); setNotes(""); }}
        title={t("enterScore")}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setScoreModal(null)}>Cancel</Button>
            <Button onClick={handleSaveScore}>{t("confirmResult")}</Button>
          </>
        }
      >
        {currentMatch && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-surface-400 text-center mb-1">{currentMatch.home}</p>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-full h-14 bg-surface-900 border border-surface-700 rounded-xl text-center text-2xl font-bold text-white focus:border-brand-500 outline-none"
                  placeholder="0"
                />
              </div>
              <span className="text-surface-500 font-bold text-xl">–</span>
              <div className="flex-1">
                <p className="text-xs text-surface-400 text-center mb-1">{currentMatch.away}</p>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-full h-14 bg-surface-900 border border-surface-700 rounded-xl text-center text-2xl font-bold text-white focus:border-brand-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <Textarea
              label={t("notes")}
              placeholder={t("notesPlaceholder")}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
