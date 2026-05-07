"use client";

import Link from "next/link";
import { Trophy, Bell, Plus, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
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
  const [langOpen, setLangOpen] = useState(false);

  const userInitials = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 lg:hidden">
      <div className="px-4 h-14 flex items-center justify-between gap-3">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
          <div className="h-7 w-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Trophy className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Tournify</span>
        </Link>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase text-[10px] font-semibold">{locale}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-slide-up">
                {LOCALES.map((l) => (
                  <Link
                    key={l.code}
                    href={`/${l.code}/dashboard`}
                    onClick={() => setLangOpen(false)}
                    className={cn(
                      "block px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                      locale === l.code ? "text-brand-600 font-semibold" : "text-gray-700"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-live-500 rounded-full" />
          </button>

          <Link href={`/${locale}/tournament/create`}>
            <button className="p-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </Link>

          {userInitials && (
            <div className="h-8 w-8 bg-brand-600 rounded-full flex items-center justify-center text-[11px] text-white font-bold ml-1">
              {userInitials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
