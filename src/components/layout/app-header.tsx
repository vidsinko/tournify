"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Trophy, Bell, Plus, Menu, X, ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBar } from "@/components/ui/status-bar";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  locale: string;
  userName?: string;
}

const LOCALES = [
  { code: "en", label: "English" },
  { code: "sl", label: "Slovenščina" },
  { code: "hr", label: "Hrvatski" },
  { code: "de", label: "Deutsch" },
];

export function AppHeader({ locale, userName }: AppHeaderProps) {
  const t = useTranslations();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-surface-950/90 backdrop-blur-md border-b border-surface-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2 font-bold text-white shrink-0"
        >
          <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <span className="text-base tracking-tight">Tournify</span>
        </Link>

        {/* Status bar — hidden on small */}
        <StatusBar className="hidden lg:flex" />

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase text-xs font-medium">{locale}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-surface-800 border border-surface-700 rounded-lg shadow-xl overflow-hidden z-50 animate-slide-up">
                {LOCALES.map((l) => (
                  <Link
                    key={l.code}
                    href={`/${l.code}/dashboard`}
                    onClick={() => setLangOpen(false)}
                    className={cn(
                      "block px-3 py-2 text-sm hover:bg-surface-700 transition-colors",
                      locale === l.code ? "text-brand-400 font-medium" : "text-surface-300"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href={`/${locale}/tournament/create`}>
            <Button size="sm" className="hidden sm:flex gap-1">
              <Plus className="h-3.5 w-3.5" />
              {t("nav.createTournament")}
            </Button>
          </Link>

          <button className="relative p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-live-500 rounded-full" />
          </button>

          {userName && (
            <Avatar name={userName} size="sm" />
          )}
        </div>
      </div>
    </header>
  );
}
