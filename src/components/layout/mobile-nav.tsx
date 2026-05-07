"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Calendar, Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const tournamentMatch = pathname.match(/\/[^/]+\/tournament\/([^/]+)/);
  const tournamentId = tournamentMatch ? tournamentMatch[1] : null;

  const items = [
    {
      href: `/${locale}/dashboard`,
      icon: Home,
      label: "Home",
      active: pathname.includes("/dashboard"),
    },
    {
      href: tournamentId ? `/${locale}/tournament/${tournamentId}` : `/${locale}/dashboard`,
      icon: Trophy,
      label: "Overview",
      active: !!tournamentId && pathname === `/${locale}/tournament/${tournamentId}`,
    },
    {
      href: tournamentId ? `/${locale}/tournament/${tournamentId}/schedule` : `/${locale}/dashboard`,
      icon: Calendar,
      label: "Matches",
      active: pathname.includes("/schedule"),
    },
    {
      href: tournamentId ? `/${locale}/tournament/${tournamentId}/live` : `/${locale}/dashboard`,
      icon: Zap,
      label: "Live",
      active: pathname.includes("/live"),
    },
    {
      href: tournamentId ? `/${locale}/tournament/${tournamentId}/settings` : `/${locale}/dashboard`,
      icon: Settings,
      label: "More",
      active: pathname.includes("/settings") || pathname.includes("/teams") || pathname.includes("/standings"),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/97 backdrop-blur-md border-t border-gray-200">
      <div className="flex items-center justify-around h-[60px] px-1 max-w-lg mx-auto">
        {items.map(({ href, icon: Icon, label, active }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[52px]",
              active ? "text-brand-600" : "text-gray-400"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
            <span className={cn("text-[9px] font-semibold", active ? "text-brand-600" : "text-gray-400")}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
