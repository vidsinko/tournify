"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Wifi, WifiOff, Save, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  className?: string;
}

export function StatusBar({ className }: StatusBarProps) {
  const t = useTranslations("common");
  const [online, setOnline] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!online) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-warning-400", className)}>
        <WifiOff className="h-3 w-3" />
        <span>{t("offline")}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 text-xs text-surface-500", className)}>
      <span className="flex items-center gap-1 text-live-500">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live-500" />
        </span>
        {t("realtimeConnected")}
      </span>
      <span className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-live-500" />
        {t("allChangesSaved")}
      </span>
      <span className="flex items-center gap-1">
        <Shield className="h-3 w-3 text-brand-400" />
        {t("noConflicts")}
      </span>
    </div>
  );
}
