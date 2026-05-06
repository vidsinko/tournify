import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "dd.MM.yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatTime(date: string | Date, fmt = "HH:mm"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd.MM.yyyy HH:mm");
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function groupMatchesByTime(matches: { scheduled_at: string }[]) {
  const groups: Record<string, typeof matches> = {};
  matches.forEach((match) => {
    const key = format(parseISO(match.scheduled_at), "HH:mm");
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  });
  return groups;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function minutesBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60));
}

export function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function calculateCountdown(scheduledAt: string): string {
  const now = new Date();
  const target = parseISO(scheduledAt);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getGroupName(index: number): string {
  return String.fromCharCode(65 + index);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "live":
      return "text-live-500";
    case "completed":
      return "text-surface-400";
    case "upcoming":
    case "scheduled":
      return "text-brand-400";
    case "cancelled":
      return "text-danger-400";
    case "postponed":
      return "text-warning-400";
    default:
      return "text-surface-400";
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
