"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Trophy, Bell, Plus, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [langOpen, setLangOpen] = useState(false);

  const userInitials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a15]/90 backdrop-blur-md border-b border-surface-800/50 lg:hidden">
      <div className="px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo — mobile only */}
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-bold text-white">
          <div className="h-7 w-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Trophy className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm">Tournify</span>
        </Link>

        {/* Status bar — hidden on small screens, show on md */}
        <StatusBar className="hidden md:flex flex-1 max-w-xs" />

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/60 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase text-[10px] font-semibold">{locale}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-surface-800 border border-surface-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                {LOCALES.map((l) => (
                  <Link
                    key={l.code}
                    href={`/${l.code}/dashboard`}
                    onClick={() => setLangOpen(false)}
                    className={cn(
                      "block px-3 py-2 text-sm hover:bg-surface-700 transition-colors",
                      locale === l.code ? "text-brand-400 font-semibold" : "text-surface-300"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/60 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-live-500 rounded-full" />
          </button>

          {/* Create tournament — icon on mobile */}
          <Link href={`/${locale}/tournament/create`}>
            <button className="p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </Link>

          {/* User avatar */}
          {userInitials && (
            <div className="h-7 w-7 bg-brand-700 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
              {userInitials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
