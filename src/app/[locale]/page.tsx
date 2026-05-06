import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Trophy,
  Zap,
  Smartphone,
  Users,
  FileText,
  Globe,
  ArrowRight,
  Star,
  QrCode,
  BarChart3,
  Calendar,
  Shield,
  Settings,
  LayoutDashboard,
  Plus,
  CheckCircle,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  return { title: t("hero.title") };
}

function PhoneMockup() {
  return (
    <div className="relative w-[210px] sm:w-[230px] animate-float">
      <div
        className="relative bg-[#0a0a18] rounded-[36px] overflow-hidden"
        style={{
          border: "5px solid #1e1e35",
          boxShadow: "0 30px 80px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(124,58,237,0.1)",
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-[72px] bg-[#0a0a18] border-b border-[#1e1e35] rounded-b-2xl z-20" />

        {/* Screen */}
        <div className="bg-[#080810] min-h-[460px] relative overflow-hidden pt-5">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1">
            <span className="text-[9px] text-surface-400 font-semibold tracking-wide">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-[2px] items-end h-3">
                {[30, 50, 70, 100].map((h, i) => (
                  <div key={i} className="w-[2px] bg-surface-400 rounded-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="w-5 h-2.5 border border-surface-500 rounded-sm relative p-[1.5px]">
                <div className="w-3/4 h-full bg-live-500 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* App header */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="h-5 w-5 bg-surface-800 rounded-lg flex items-center justify-center">
              <span className="text-[9px] text-surface-400">‹</span>
            </div>
            <span className="flex items-center gap-1.5 text-[8px] font-bold text-live-400 bg-live-900/40 px-2 py-0.5 rounded-full border border-live-800/40">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live-500" />
              </span>
              LIVE
            </span>
          </div>

          {/* Tournament info */}
          <div className="text-center px-4 pb-2">
            <p className="text-[11px] font-semibold text-surface-200">U12 Champions Cup</p>
            <p className="text-[8px] text-surface-500 mt-0.5">Group A · Round 3</p>
          </div>

          {/* Score card */}
          <div className="mx-3 mb-3 bg-surface-800/50 rounded-2xl p-3 border border-surface-700/30">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 bg-brand-900/60 rounded-xl flex items-center justify-center border border-brand-800/40">
                  <Trophy className="h-4 w-4 text-brand-400" />
                </div>
                <p className="text-[8px] text-surface-300 font-medium text-center leading-tight">
                  NK<br />Olimpija
                </p>
              </div>
              <div className="flex-1 text-center px-2">
                <p className="text-[28px] font-black text-white tracking-tight leading-none">2–1</p>
                <p className="text-[9px] text-live-400 font-bold mt-1 tabular-nums">75:32</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 bg-amber-900/50 rounded-xl flex items-center justify-center border border-amber-800/30">
                  <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <p className="text-[8px] text-surface-300 font-medium text-center leading-tight">
                  NK<br />Maribor
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mx-3 mb-3 bg-surface-800/40 rounded-xl p-1 gap-0.5">
            {["LIVE", "LINEUP", "STATS"].map((tab, i) => (
              <button
                key={tab}
                className={`flex-1 text-[8px] py-1.5 rounded-lg font-bold tracking-wide ${
                  i === 0 ? "bg-brand-600 text-white" : "text-surface-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Events */}
          <div className="px-3 pb-14">
            <p className="text-[7px] text-surface-500 font-bold uppercase tracking-widest mb-2">Events</p>
            {[
              { min: "75'", isGoal: true, text: "Goal · Luka K.", score: "2–1" },
              { min: "60'", isGoal: false, text: "Yellow · Marko P.", score: "" },
              { min: "45'", isGoal: true, text: "Goal · Andrej S.", score: "1–1" },
              { min: "30'", isGoal: true, text: "Goal · Tim R.", score: "0–1" },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-surface-800/50 last:border-0">
                <span className="text-[8px] text-surface-600 w-5 shrink-0 font-mono">{event.min}</span>
                <div
                  className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${
                    event.isGoal ? "bg-brand-900/60" : "bg-warning-900/60"
                  }`}
                >
                  <span className="text-[8px]">{event.isGoal ? "⚽" : "🟨"}</span>
                </div>
                <p className="text-[8px] text-surface-400 flex-1">{event.text}</p>
                {event.score && <span className="text-[8px] font-bold text-surface-200">{event.score}</span>}
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 bg-surface-900/95 backdrop-blur-sm border-t border-surface-800/80 flex items-center justify-around py-2">
            <LayoutDashboard className="h-3.5 w-3.5 text-surface-600" />
            <Trophy className="h-3.5 w-3.5 text-brand-400" />
            <Calendar className="h-3.5 w-3.5 text-surface-600" />
            <Shield className="h-3.5 w-3.5 text-surface-600" />
            <Users className="h-3.5 w-3.5 text-surface-600" />
          </div>
        </div>
      </div>

      {/* Glow behind phone */}
      <div className="absolute inset-0 bg-brand-600/15 rounded-[40px] blur-3xl -z-10 scale-110" />
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Browser chrome */}
      <div
        className="bg-surface-900 rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(51, 65, 85, 0.6)",
          boxShadow: "0 0 100px rgba(124, 58, 237, 0.08), 0 40px 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Browser bar */}
        <div className="h-10 bg-surface-800/80 flex items-center gap-3 px-4 border-b border-surface-700/60">
          <div className="flex gap-1.5 shrink-0">
            <div className="h-2.5 w-2.5 bg-danger-500 rounded-full" />
            <div className="h-2.5 w-2.5 bg-warning-400 rounded-full" />
            <div className="h-2.5 w-2.5 bg-live-500 rounded-full" />
          </div>
          <div className="flex-1 bg-surface-900/80 rounded-md h-5 flex items-center px-3 max-w-xs">
            <span className="text-[9px] text-surface-500 font-mono">app.tournify.io/dashboard</span>
          </div>
        </div>

        {/* App layout */}
        <div className="flex h-[380px] sm:h-[420px]">
          {/* Sidebar */}
          <div className="w-44 shrink-0 bg-[#07070f] border-r border-surface-800/60 flex flex-col p-3">
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="h-7 w-7 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
                <Trophy className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Tournify</span>
            </div>

            <div className="flex items-center gap-1.5 bg-brand-600 rounded-lg px-2.5 py-1.5 mb-3 cursor-pointer">
              <Plus className="h-3 w-3 text-white shrink-0" />
              <span className="text-[10px] text-white font-semibold">Create Tournament</span>
            </div>

            <div className="space-y-0.5">
              {[
                { Icon: LayoutDashboard, label: "Dashboard", active: true },
                { Icon: Trophy, label: "Tournaments" },
                { Icon: Users, label: "Teams" },
                { Icon: Calendar, label: "Matches" },
                { Icon: BarChart3, label: "Fields" },
                { Icon: Shield, label: "Referees" },
                { Icon: Settings, label: "Settings" },
              ].map(({ Icon, label, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] ${
                    active ? "bg-brand-900/50 text-brand-300" : "text-surface-500 hover:text-surface-300"
                  }`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-2 px-2 py-2 border-t border-surface-800/60">
              <div className="h-6 w-6 bg-brand-700 rounded-full flex items-center justify-center text-[8px] text-white font-bold shrink-0">
                JO
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-surface-300 font-medium truncate">John Organizer</p>
                <p className="text-[8px] text-surface-600 truncate">Admin</p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-[#0a0a12] p-4 overflow-hidden">
            {/* Tournament header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">U12 Champions Cup 2024</h3>
                  <span className="flex items-center gap-1 text-[8px] font-bold text-live-400 bg-live-900/40 px-1.5 py-0.5 rounded-full border border-live-800/30">
                    <span className="h-1 w-1 bg-live-500 rounded-full" />
                    Live
                  </span>
                </div>
                <div className="flex gap-3 text-[9px] border-b border-surface-800/50 pb-2">
                  {["Overview", "Matches", "Groups", "Teams", "Brackets", "Fields", "Referees", "Settings"].map((tab, i) => (
                    <span
                      key={tab}
                      className={i === 0 ? "text-white border-b-2 border-brand-500 pb-2 -mb-2 font-semibold" : "text-surface-500"}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="h-6 px-2 bg-surface-800 rounded-lg flex items-center text-[8px] text-surface-400 border border-surface-700/50">
                  View Public
                </div>
                <div className="h-6 px-2.5 bg-brand-600 rounded-lg flex items-center text-[8px] text-white font-semibold gap-1">
                  <span>Share</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { value: "24", label: "Teams" },
                { value: "48", label: "Matches" },
                { value: "4", label: "Fields" },
                { value: "156", label: "Players" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-surface-800/50 rounded-xl p-2.5 text-center border border-surface-700/20">
                  <p className="text-base font-black text-white leading-none">{value}</p>
                  <p className="text-[8px] text-surface-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Today's matches */}
              <div className="col-span-1 bg-surface-800/30 rounded-xl p-3 border border-surface-700/20">
                <p className="text-[9px] font-semibold text-surface-300 mb-2">Today&apos;s matches</p>
                {[
                  { home: "Young Stars", away: "NK Bravo", score: "1–1", status: "done" },
                  { home: "FC Galaxy", away: "Blue Tigers", score: "0–3", status: "done" },
                  { home: "NK Olimpija", away: "NK Maribor", score: "2–1", status: "live" },
                  { home: "ND Gorica", away: "FC Koper", score: "—", status: "soon" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 py-1 border-b border-surface-700/20 last:border-0">
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        m.status === "live" ? "bg-live-500" : m.status === "done" ? "bg-surface-600" : "bg-surface-700"
                      }`}
                    />
                    <p className="text-[7px] text-surface-400 flex-1 truncate">
                      {m.home} vs {m.away}
                    </p>
                    <span
                      className={`text-[7px] font-bold shrink-0 ${
                        m.status === "live" ? "text-live-400" : "text-surface-400"
                      }`}
                    >
                      {m.score}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tournament progress */}
              <div className="col-span-1 bg-surface-800/30 rounded-xl p-3 border border-surface-700/20">
                <p className="text-[9px] font-semibold text-surface-300 mb-2">Tournament progress</p>
                {[
                  { step: "Setup", done: true },
                  { step: "Registration", done: true },
                  { step: "Groups", done: true },
                  { step: "Matches", active: true },
                  { step: "Knockout", pending: true },
                  { step: "Finished", pending: true },
                ].map(({ step, done, active, pending }) => (
                  <div key={step} className="flex items-center gap-2 py-0.5">
                    <div
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        done ? "bg-live-500" : active ? "bg-brand-500" : "bg-surface-700"
                      }`}
                    />
                    <p
                      className={`text-[8px] flex-1 ${
                        done ? "text-surface-500" : active ? "text-brand-300 font-semibold" : "text-surface-700"
                      }`}
                    >
                      {step}
                    </p>
                    {active && <span className="text-[7px] text-brand-500">In progress</span>}
                    {done && <CheckCircle className="h-2.5 w-2.5 text-live-600" />}
                  </div>
                ))}
              </div>

              {/* Top scorers */}
              <div className="col-span-1 bg-surface-800/30 rounded-xl p-3 border border-surface-700/20">
                <p className="text-[9px] font-semibold text-surface-300 mb-2">Top scorers</p>
                {[
                  { rank: 1, name: "Luka K.", team: "NK Olimpija", goals: 7 },
                  { rank: 2, name: "Marko P.", team: "Blue Tigers", goals: 6 },
                  { rank: 3, name: "Tim R.", team: "FC Galaxy", goals: 5 },
                  { rank: 4, name: "Andrej S.", team: "NK Maribor", goals: 5 },
                ].map(({ rank, name, team, goals }) => (
                  <div key={rank} className="flex items-center gap-2 py-1 border-b border-surface-700/20 last:border-0">
                    <span className="text-[7px] text-surface-600 w-3 shrink-0 font-bold">{rank}</span>
                    <div className="h-4 w-4 bg-surface-700 rounded-full flex items-center justify-center text-[6px] text-surface-400 font-bold shrink-0">
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-surface-200 font-medium truncate">{name}</p>
                      <p className="text-[7px] text-surface-600 truncate">{team}</p>
                    </div>
                    <span className="text-[9px] font-black text-brand-400 shrink-0">{goals}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow behind browser */}
      <div className="absolute -inset-6 bg-brand-700/5 rounded-3xl blur-3xl -z-10" />
    </div>
  );
}

function LandingContent({ locale }: { locale: string }) {
  const t = useTranslations("landing");
  const tc = useTranslations("common");

  const features = [
    {
      icon: Zap,
      titleKey: "features.scheduling.title" as const,
      descKey: "features.scheduling.description" as const,
      color: "text-brand-400",
      bg: "bg-brand-900/30",
      border: "border-brand-800/30",
    },
    {
      icon: Trophy,
      titleKey: "features.live.title" as const,
      descKey: "features.live.description" as const,
      color: "text-live-400",
      bg: "bg-live-900/30",
      border: "border-live-800/30",
    },
    {
      icon: Smartphone,
      titleKey: "features.mobile.title" as const,
      descKey: "features.mobile.description" as const,
      color: "text-purple-400",
      bg: "bg-purple-900/30",
      border: "border-purple-800/30",
    },
    {
      icon: Users,
      titleKey: "features.roles.title" as const,
      descKey: "features.roles.description" as const,
      color: "text-amber-400",
      bg: "bg-amber-900/30",
      border: "border-amber-800/30",
    },
    {
      icon: FileText,
      titleKey: "features.export.title" as const,
      descKey: "features.export.description" as const,
      color: "text-rose-400",
      bg: "bg-rose-900/30",
      border: "border-rose-800/30",
    },
    {
      icon: Globe,
      titleKey: "features.multilingual.title" as const,
      descKey: "features.multilingual.description" as const,
      color: "text-cyan-400",
      bg: "bg-cyan-900/30",
      border: "border-cyan-800/30",
    },
  ];

  const steps = [
    {
      num: "01",
      titleKey: "howItWorks.step1.title" as const,
      descKey: "howItWorks.step1.description" as const,
      icon: Trophy,
    },
    {
      num: "02",
      titleKey: "howItWorks.step2.title" as const,
      descKey: "howItWorks.step2.description" as const,
      icon: Zap,
    },
    {
      num: "03",
      titleKey: "howItWorks.step3.title" as const,
      descKey: "howItWorks.step3.description" as const,
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0a15]/80 backdrop-blur-md border-b border-surface-800/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="h-7 w-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
            <span>Tournify</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/auth/login`}
              className="text-sm text-surface-400 hover:text-white transition-colors px-3 py-1.5"
            >
              {tc("login")}
            </Link>
            <Link
              href={`/${locale}/auth/register`}
              className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-700/8 rounded-full blur-3xl pointer-events-none -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-900/60 border border-brand-700/40 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full mb-7">
                <Star className="h-3 w-3" />
                {t("hero.badge")}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
                {t("hero.title").split("Youth Sports Tournaments")[0]}
                <span className="block gradient-text">Youth Sports Tournaments</span>
              </h1>

              <p className="text-lg text-surface-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
                <Link
                  href={`/${locale}/auth/register`}
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all active:scale-95 shadow-lg"
                  style={{ boxShadow: "0 0 30px rgba(124, 58, 237, 0.3)" }}
                >
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${locale}/auth/login`}
                  className="inline-flex items-center gap-2 border border-surface-700 hover:border-surface-500 text-surface-300 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-all"
                >
                  {t("hero.ctaSecondary")}
                </Link>
              </div>

              <p className="text-xs text-surface-600">{t("hero.trustedBy")}</p>
            </div>

            {/* Right: Phone mockup */}
            <div className="flex justify-center lg:justify-end lg:pr-4">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Dashboard</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Everything in one place
            </h2>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 relative">
        <div className="absolute inset-0 bg-surface-900/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("features.title")}</h2>
            <p className="text-surface-400 max-w-xl mx-auto text-base">{t("features.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, titleKey, descKey, color, bg, border }) => (
              <div
                key={titleKey}
                className={`bg-surface-800/50 border ${border} rounded-2xl p-6 hover:bg-surface-800/80 transition-all hover:-translate-y-0.5`}
              >
                <div className={`h-11 w-11 ${bg} rounded-xl flex items-center justify-center mb-4 border ${border}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{t("howItWorks.title")}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-brand-800/60 via-brand-600/40 to-brand-800/60" />

            {steps.map(({ num, titleKey, descKey, icon: Icon }) => (
              <div key={num} className="relative text-center flex flex-col items-center">
                <div className="relative mb-5">
                  <div className="h-14 w-14 bg-brand-900/60 border border-brand-700/50 rounded-2xl flex items-center justify-center relative z-10">
                    <span className="text-brand-400 font-black text-sm">{num}</span>
                  </div>
                  <div className="absolute inset-0 bg-brand-600/10 rounded-2xl blur-lg" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Access Callout */}
      <section className="px-4 pb-16">
        <div
          className="max-w-2xl mx-auto rounded-2xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.06))",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <div className="h-14 w-14 bg-brand-900/60 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-brand-800/40">
            <QrCode className="h-7 w-7 text-brand-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">QR-First Access</h3>
          <p className="text-surface-400 text-sm leading-relaxed max-w-sm mx-auto">
            Spectators scan a QR code and instantly see the live tournament — no app download, no login required.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-brand-950/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-700/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{t("cta.title")}</h2>
          <p className="text-surface-400 mb-10 text-lg">{t("cta.subtitle")}</p>
          <Link
            href={`/${locale}/auth/register`}
            className="inline-flex items-center gap-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-9 py-4 rounded-xl transition-all active:scale-95 text-base"
            style={{ boxShadow: "0 0 40px rgba(124, 58, 237, 0.35)" }}
          >
            {t("cta.button")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800/60 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-brand-600 rounded-md flex items-center justify-center">
              <Trophy className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Tournify</span>
            <span className="text-xs text-surface-600 ml-2">{t("footer.tagline")}</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-surface-600">
            <Link href="#" className="hover:text-surface-300 transition-colors">{t("footer.privacy")}</Link>
            <Link href="#" className="hover:text-surface-300 transition-colors">{t("footer.terms")}</Link>
            <Link href="#" className="hover:text-surface-300 transition-colors">{t("footer.contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LandingContent locale={locale} />;
}
