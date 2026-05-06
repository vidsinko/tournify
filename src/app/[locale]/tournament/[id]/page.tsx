"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Zap,
  FileDown,
  BarChart3,
  Clock,
  Megaphone,
  ChevronRight,
  Activity,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOURNAMENT = {
  id: "spring-cup-2025",
  name: "Spring Cup 2025",
  sport: "football" as const,
  status: "active" as const,
  location: "Sports Centre Ljubljana",
  date_start: "2025-05-10",
  date_end: "2025-05-10",
  description: "Annual youth football tournament featuring 16 teams in 4 groups.",
  _count: { teams: 16, matches: 24, referees: 4 },
  settings: {
    num_groups: 4,
    num_pitches: 2,
    match_duration_minutes: 20,
  },
};

const STATS = [
  { label: "Teams", value: 16, icon: Users, color: "text-brand-400", bg: "bg-brand-900/30" },
  { label: "Matches Today", value: 24, icon: Calendar, color: "text-amber-400", bg: "bg-amber-900/30" },
  { label: "Matches Played", value: 9, icon: Trophy, color: "text-live-400", bg: "bg-live-900/30" },
  { label: "Next Match", value: "14:20", icon: Clock, color: "text-purple-400", bg: "bg-purple-900/30" },
];

const ANNOUNCEMENTS = [
  {
    id: "1",
    message: "Match #12 (Group B) moved to Pitch 2 due to maintenance. Kick-off at 13:40.",
    created_at: "2025-05-10T13:00:00",
    is_urgent: true,
    author: "Organizer",
  },
  {
    id: "2",
    message: "Lunch break 12:30–13:00. No matches scheduled during this time.",
    created_at: "2025-05-10T09:00:00",
    is_urgent: false,
    author: "Organizer",
  },
  {
    id: "3",
    message: "Welcome to Spring Cup 2025! Check-in at Pitch 1 entrance from 08:00.",
    created_at: "2025-05-10T07:30:00",
    is_urgent: false,
    author: "Organizer",
  },
  {
    id: "4",
    message: "Yellow card accumulation: any player with 2 yellow cards is suspended for the next match.",
    created_at: "2025-05-09T20:00:00",
    is_urgent: false,
    author: "Organizer",
  },
];

const LIVE_EVENTS = [
  { id: "e1", type: "goal", message: "GOAL! FC Olimpija 2 – 1 NK Maribor (Group A, Match #7)", time: "2 min ago" },
  { id: "e2", type: "match_started", message: "Match started: FC Koper vs NK Celje (Pitch 1)", time: "18 min ago" },
  { id: "e3", type: "match_ended", message: "Full time: Red Stars 3 – 0 Blue Wave (Group C)", time: "34 min ago" },
  { id: "e4", type: "score_updated", message: "Score updated: Eagles 1 – 1 Panthers (Group D, Match #5)", time: "52 min ago" },
  { id: "e5", type: "match_started", message: "Match started: Storm FC vs United XI (Pitch 2)", time: "1 hr ago" },
];

const NAV_TABS = [
  { label: "Schedule", href: "schedule", icon: Calendar },
  { label: "Standings", href: "standings", icon: BarChart3 },
  { label: "Bracket", href: "bracket", icon: Zap },
  { label: "Teams", href: "teams", icon: Users },
  { label: "Referees", href: "referees", icon: Trophy },
  { label: "Settings", href: "settings", icon: Zap },
];

const SPORT_EMOJI: Record<string, string> = {
  football: "⚽",
  basketball: "🏀",
  volleyball: "🏐",
  handball: "🤾",
  futsal: "⚽",
  other: "🏅",
};

function EventTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "goal":
      return <span className="text-base">⚽</span>;
    case "match_started":
      return <span className="h-2 w-2 rounded-full bg-live-500 inline-block mt-1" />;
    case "match_ended":
      return <span className="h-2 w-2 rounded-full bg-surface-500 inline-block mt-1" />;
    default:
      return <Activity className="h-3.5 w-3.5 text-brand-400" />;
  }
}

export default function TournamentOverviewPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const t = useTranslations("tournament");
  const tNav = useTranslations("nav");

  const [countdown, setCountdown] = useState("42m");

  useEffect(() => {
    // Simulate countdown timer
    const interval = setInterval(() => {
      // In a real app, calculate from next match time
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const baseHref = `/${locale}/tournament/${id}`;

  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" userEmail="alex@example.com" />

        <main className="flex-1 p-4 lg:p-6 max-w-5xl mx-auto w-full">

          {/* Tournament Header */}
          <div className="mb-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 bg-surface-800 border border-surface-700 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                {SPORT_EMOJI[TOURNAMENT.sport]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl lg:text-2xl font-bold text-white">{TOURNAMENT.name}</h1>
                  <Badge variant="live" pulse>
                    {t("status.active")}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-surface-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {TOURNAMENT.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    10 May 2025
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {TOURNAMENT._count.teams} teams · 4 groups · 2 pitches
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href={`${baseHref}/schedule`}>
                <Button variant="primary" size="sm">
                  <Calendar className="h-3.5 w-3.5" />
                  View Schedule
                </Button>
              </Link>
              <Link href={`${baseHref}/live`}>
                <Button variant="live" size="sm">
                  <Zap className="h-3.5 w-3.5" />
                  Enter Results
                </Button>
              </Link>
              <Button variant="secondary" size="sm">
                <FileDown className="h-3.5 w-3.5" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-surface-700 overflow-x-auto mb-6 gap-0">
            {NAV_TABS.map(({ label, href }) => (
              <Link
                key={href}
                href={`${baseHref}/${href}`}
                className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px border-transparent text-surface-400 hover:text-surface-200 hover:border-surface-600"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {STATS.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", bg)}>
                      <Icon className={cn("h-4 w-4", color)} />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Live Activity Feed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-live-500" />
                  </span>
                  Live Activity
                </CardTitle>
                <Badge variant="live" size="sm">LIVE</Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {LIVE_EVENTS.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 flex items-center justify-center h-6 w-6">
                        <EventTypeIcon type={event.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-surface-200 leading-snug">{event.message}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-brand-400" />
                  {t("announcements.title")}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  + New
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {ANNOUNCEMENTS.map((ann) => (
                    <div
                      key={ann.id}
                      className={cn(
                        "rounded-lg p-3 border",
                        ann.is_urgent
                          ? "bg-danger-900/20 border-danger-800/50"
                          : "bg-surface-900/50 border-surface-700"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {ann.is_urgent && (
                          <Badge variant="danger" size="sm" className="shrink-0 mt-0.5">Urgent</Badge>
                        )}
                        <p className="text-sm text-surface-200 leading-snug flex-1">{ann.message}</p>
                      </div>
                      <p className="text-xs text-surface-500 mt-1.5">
                        {ann.author} · {ann.created_at.split("T")[1].slice(0, 5)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Nav Cards */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "View Schedule", href: `${baseHref}/schedule`, icon: Calendar, desc: "24 matches today" },
              { label: "Standings", href: `${baseHref}/standings`, icon: BarChart3, desc: "4 groups" },
              { label: "Bracket", href: `${baseHref}/bracket`, icon: Zap, desc: "Knockout stage" },
              { label: "Teams", href: `${baseHref}/teams`, icon: Users, desc: "16 registered" },
              { label: "Live Management", href: `${baseHref}/live`, icon: Activity, desc: "2 live matches" },
              { label: "Settings", href: `${baseHref}/settings`, icon: Trophy, desc: "Configure tournament" },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link key={label} href={href}>
                <Card hover className="group">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-surface-700 rounded-lg flex items-center justify-center group-hover:bg-brand-900/50 transition-colors">
                          <Icon className="h-4 w-4 text-surface-400 group-hover:text-brand-400 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-200">{label}</p>
                          <p className="text-xs text-surface-500">{desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-surface-600 group-hover:text-surface-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
