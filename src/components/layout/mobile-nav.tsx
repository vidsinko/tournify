"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Calendar, Bell, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const tournamentMatch = pathname.match(/\/[^/]+\/tournament\/([^/]+)/);
  const tournamentId = tournamentMatch ? tournamentMatch[1] : null;

  const items = [
    {
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      label: "Home",
    },
    {
      href: tournamentId
        ? `/${locale}/tournament/${tournamentId}`
        : `/${locale}/dashboard`,
      icon: Trophy,
      label: "Tournament",
    },
    {
      href: tournamentId
        ? `/${locale}/tournament/${tournamentId}/schedule`
        : `/${locale}/dashboard`,
      icon: Calendar,
      label: "Matches",
    },
    {
      href: tournamentId
        ? `/${locale}/tournament/${tournamentId}/live`
        : `/${locale}/dashboard`,
      icon: Bell,
      label: "Live",
    },
    {
      href: tournamentId
        ? `/${locale}/tournament/${tournamentId}/settings`
        : `/${locale}/dashboard`,
      icon: MoreHorizontal,
      label: "More",
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#07070f]/95 backdrop-blur-md border-t border-surface-800/60">
      <div className="flex items-center justify-around h-[60px] px-1 max-w-lg mx-auto">
        {items.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href ||
            (label === "Home" && pathname.includes("/dashboard")) ||
            (label === "Tournament" &&
              tournamentId &&
              pathname === `/${locale}/tournament/${tournamentId}`) ||
            (label === "Matches" && pathname.includes("/schedule")) ||
            (label === "Live" && pathname.includes("/live"));

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[52px]",
                isActive ? "text-brand-400" : "text-surface-600"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iPhone home indicator */}
      <div className="h-safe-area-inset-bottom bg-[#07070f]/95" />
    </nav>
  );
}
