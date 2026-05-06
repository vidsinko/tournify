"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  BarChart3,
  Users,
  UserCheck,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

interface SidebarProps {
  locale: string;
  tournamentId?: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ locale, tournamentId, userName, userEmail }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const dashboardLinks = [
    {
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      label: t("dashboard"),
    },
  ];

  const tournamentLinks = tournamentId
    ? [
        { href: `/${locale}/tournament/${tournamentId}`, icon: Trophy, label: t("home") },
        { href: `/${locale}/tournament/${tournamentId}/schedule`, icon: Calendar, label: t("schedule") },
        { href: `/${locale}/tournament/${tournamentId}/standings`, icon: BarChart3, label: t("standings") },
        { href: `/${locale}/tournament/${tournamentId}/bracket`, icon: Zap, label: t("bracket") },
        { href: `/${locale}/tournament/${tournamentId}/teams`, icon: Users, label: t("teams") },
        { href: `/${locale}/tournament/${tournamentId}/referees`, icon: UserCheck, label: t("referees") },
        { href: `/${locale}/tournament/${tournamentId}/settings`, icon: Settings, label: t("settings") },
      ]
    : [];

  const allLinks = [...dashboardLinks, ...tournamentLinks];

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-surface-800 bg-surface-950/50 min-h-screen">
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {allLinks.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-900/50 text-brand-300 border border-brand-800/50"
                  : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {userName && (
        <div className="p-3 border-t border-surface-800">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <Avatar name={userName} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">{userName}</p>
              {userEmail && (
                <p className="text-xs text-surface-500 truncate">{userEmail}</p>
              )}
            </div>
          </div>
          <Link
            href={`/${locale}/auth/login`}
            className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm text-surface-500 hover:text-danger-400 hover:bg-surface-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
