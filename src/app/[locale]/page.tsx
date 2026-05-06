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
  CheckCircle,
  Star,
  QrCode,
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
    },
    {
      icon: Trophy,
      titleKey: "features.live.title" as const,
      descKey: "features.live.description" as const,
      color: "text-live-400",
      bg: "bg-live-900/30",
    },
    {
      icon: Smartphone,
      titleKey: "features.mobile.title" as const,
      descKey: "features.mobile.description" as const,
      color: "text-purple-400",
      bg: "bg-purple-900/30",
    },
    {
      icon: Users,
      titleKey: "features.roles.title" as const,
      descKey: "features.roles.description" as const,
      color: "text-amber-400",
      bg: "bg-amber-900/30",
    },
    {
      icon: FileText,
      titleKey: "features.export.title" as const,
      descKey: "features.export.description" as const,
      color: "text-rose-400",
      bg: "bg-rose-900/30",
    },
    {
      icon: Globe,
      titleKey: "features.multilingual.title" as const,
      descKey: "features.multilingual.description" as const,
      color: "text-cyan-400",
      bg: "bg-cyan-900/30",
    },
  ];

  const steps = [
    {
      num: "01",
      titleKey: "howItWorks.step1.title" as const,
      descKey: "howItWorks.step1.description" as const,
    },
    {
      num: "02",
      titleKey: "howItWorks.step2.title" as const,
      descKey: "howItWorks.step2.description" as const,
    },
    {
      num: "03",
      titleKey: "howItWorks.step3.title" as const,
      descKey: "howItWorks.step3.description" as const,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface-950/80 backdrop-blur-md border-b border-surface-800">
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
              {tc("common.login" as never) || "Sign in"}
            </Link>
            <Link
              href={`/${locale}/auth/register`}
              className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-900/50 border border-brand-800/50 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <Star className="h-3 w-3" />
            {t("hero.badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t("hero.title").split("Youth Sports Tournaments")[0]}
            <span className="gradient-text">Youth Sports Tournaments</span>
          </h1>
          <p className="text-lg text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${locale}/auth/register`}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-900/30"
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/auth/login`}
              className="inline-flex items-center gap-2 border border-surface-700 text-surface-300 hover:text-white hover:border-surface-600 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
          <p className="mt-6 text-xs text-surface-500">{t("hero.trustedBy")}</p>
        </div>
      </section>

      {/* Live demo mockup */}
      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-1 shadow-2xl">
            <div className="bg-surface-900 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-live-500" />
                </div>
                <span className="text-xs text-surface-500">Spring Cup 2025 — Live</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-live-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live-500" />
                  </span>
                  LIVE
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {["FC Lions 2–1 Red Hawks", "Eagles 0–0 Tigers", "Blue Stars 3–1 United"].map((m, i) => (
                  <div key={i} className="bg-surface-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-surface-500 mb-1">Pitch {i + 1}</p>
                    <p className="text-sm font-semibold text-white">{m}</p>
                    <p className="text-xs text-live-400 mt-1">● Live</p>
                  </div>
                ))}
              </div>
              <div className="bg-surface-800 rounded-lg p-3">
                <p className="text-xs text-surface-500 mb-2">Group A Standings</p>
                {["FC Lions", "Eagles", "Red Hawks", "Tigers"].map((team, i) => (
                  <div key={team} className="flex items-center gap-3 py-1">
                    <span className="text-xs text-surface-500 w-4">{i + 1}</span>
                    <span className="text-sm text-white flex-1">{team}</span>
                    <span className="text-xs text-surface-400">{3 - i * 0 + (3 - i) * 3} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 bg-surface-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t("features.title")}</h2>
            <p className="text-surface-400 max-w-2xl mx-auto">{t("features.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, titleKey, descKey, color, bg }) => (
              <div
                key={titleKey}
                className="bg-surface-800 border border-surface-700 rounded-xl p-5 hover:border-surface-600 transition-colors"
              >
                <div className={`h-10 w-10 ${bg} rounded-lg flex items-center justify-center mb-4`}>
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
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t("howItWorks.title")}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(({ num, titleKey, descKey }) => (
              <div key={num} className="text-center">
                <div className="h-12 w-12 mx-auto bg-brand-900/50 border border-brand-800 rounded-xl flex items-center justify-center text-brand-400 font-bold text-sm mb-4">
                  {num}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-surface-400">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Access Callout */}
      <section className="px-4 pb-16">
        <div className="max-w-2xl mx-auto bg-surface-800 border border-surface-700 rounded-2xl p-8 text-center">
          <QrCode className="h-10 w-10 text-brand-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">QR-First Access</h3>
          <p className="text-surface-400 text-sm leading-relaxed">
            Spectators scan a QR code and instantly see the live tournament — no app download, no login required.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 bg-brand-950/20 border-t border-surface-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t("cta.title")}</h2>
          <p className="text-surface-400 mb-8">{t("cta.subtitle")}</p>
          <Link
            href={`/${locale}/auth/register`}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-95"
          >
            {t("cta.button")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-brand-600 rounded-md flex items-center justify-center">
              <Trophy className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Tournify</span>
            <span className="text-xs text-surface-500 ml-2">{t("footer.tagline")}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-surface-500">
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
