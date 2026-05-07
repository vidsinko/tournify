"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Calendar,
  MapPin,
  Shield,
  Settings,
  LogOut,
  Plus,
  ChevronLeft,
  BarChart3,
  Zap,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  locale: string;
  tournamentId?: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ locale, tournamentId, userName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  type NavLink = { href: string; icon: React.ComponentType<{ className?: string }>; label: string; exact?: boolean };

  const topLinks: NavLink[] = [
    { href: `/${locale}/dashboard`, icon: LayoutDashboard, label: "Dashboard" },
  ];

  const tournamentLinks: NavLink[] = tournamentId
    ? [
        { href: `/${locale}/tournament/${tournamentId}`, icon: Trophy, label: "Overview", exact: true },
        { href: `/${locale}/tournament/${tournamentId}/schedule`, icon: Calendar, label: "Matches" },
        { href: `/${locale}/tournament/${tournamentId}/teams`, icon: Users, label: "Teams" },
        { href: `/${locale}/tournament/${tournamentId}/standings`, icon: BarChart3, label: "Standings" },
        { href: `/${locale}/tournament/${tournamentId}/bracket`, icon: Zap, label: "Bracket" },
        { href: `/${locale}/tournament/${tournamentId}/referees`, icon: Shield, label: "Referees" },
        { href: `/${locale}/tournament/${tournamentId}/live`, icon: MapPin, label: "Live" },
        { href: `/${locale}/tournament/${tournamentId}/settings`, icon: Settings, label: "Settings" },
      ]
    : [
        { href: `/${locale}/dashboard`, icon: Trophy, label: "Tournaments" },
        { href: `/${locale}/dashboard`, icon: Users, label: "Teams" },
        { href: `/${locale}/dashboard`, icon: Calendar, label: "Matches" },
        { href: `/${locale}/dashboard`, icon: MapPin, label: "Fields" },
        { href: `/${locale}/dashboard`, icon: Shield, label: "Referees" },
        { href: `/${locale}/dashboard`, icon: ClipboardList, label: "Registrations" },
        { href: `/${locale}/dashboard`, icon: CreditCard, label: "Payments" },
        { href: `/${locale}/dashboard`, icon: Settings, label: "Settings" },
      ];

  const allLinks = [...topLinks, ...tournamentLinks];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || (pathname.startsWith(href + "/") && href !== `/${locale}/dashboard`);
  };

  const userInitials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 min-h-screen border-r border-surface-800/40 transition-all duration-200",
        collapsed ? "w-[56px]" : "w-[200px]",
        "bg-[#07070f]"
      )}
    >
      {/* Logo row */}
      <div
        className={cn(
          "h-14 flex items-center border-b border-surface-800/40 shrink-0",
          collapsed ? "px-3 justify-center" : "px-3 justify-between"
        )}
      >
        {collapsed ? (
          <Link href={`/${locale}/dashboard`}>
            <div className="h-7 w-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
          </Link>
        ) : (
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white truncate">Tournify</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "h-6 w-6 flex items-center justify-center rounded-md text-surface-600 hover:text-surface-300 hover:bg-surface-800/60 transition-colors shrink-0",
            collapsed && "mt-0"
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={cn("h-3.5 w-3.5 transition-transform duration-200", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Create Tournament button */}
      <div className={cn("px-2 py-3 shrink-0", collapsed && "px-2")}>
        <Link
          href={`/${locale}/tournament/create`}
          className={cn(
            "flex items-center bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors w-full",
            collapsed ? "justify-center p-2" : "gap-2 px-3 py-2"
          )}
          title={collapsed ? "Create Tournament" : undefined}
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Create Tournament</span>}
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-2 h-px bg-surface-800/40 shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {allLinks.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={`${href}-${label}`}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-lg text-xs font-medium transition-all",
                collapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2",
                active
                  ? "bg-brand-900/50 text-brand-300"
                  : "text-surface-500 hover:text-surface-200 hover:bg-surface-800/50"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-brand-400")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-2 h-px bg-surface-800/40 shrink-0" />

      {/* User profile */}
      {userName && (
        <div className={cn("py-3 px-2 shrink-0", collapsed && "flex flex-col items-center")}>
          {collapsed ? (
            <div className="h-7 w-7 bg-brand-700 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
              {userInitials}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
                <div className="h-7 w-7 bg-brand-700 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-surface-200 truncate">{userName}</p>
                  <p className="text-[10px] text-surface-600">Admin</p>
                </div>
              </div>
              <Link
                href={`/${locale}/auth/login`}
                className="flex items-center gap-2 px-2.5 py-1.5 mt-0.5 rounded-lg text-xs text-surface-600 hover:text-danger-400 hover:bg-surface-800/50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </Link>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
