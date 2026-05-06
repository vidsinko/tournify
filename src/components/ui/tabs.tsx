"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "default" | "pills";
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = "default", className }: TabsProps) {
  if (variant === "pills") {
    return (
      <div className={cn("flex gap-1 p-1 bg-surface-900 rounded-xl", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-surface-700 text-white shadow-sm"
                : "text-surface-400 hover:text-surface-200"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-surface-600 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex border-b border-surface-700 overflow-x-auto", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
            activeTab === tab.id
              ? "border-brand-500 text-brand-400"
              : "border-transparent text-surface-400 hover:text-surface-200 hover:border-surface-600"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <span
              className={cn(
                "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                activeTab === tab.id
                  ? "bg-brand-900 text-brand-300"
                  : "bg-surface-700 text-surface-400"
              )}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
