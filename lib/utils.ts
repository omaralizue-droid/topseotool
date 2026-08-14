import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function scoreToLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 60) return { label: "Good", color: "text-blue-600 dark:text-blue-400" };
  if (score >= 40) return { label: "Fair", color: "text-amber-600 dark:text-amber-400" };
  return { label: "Poor", color: "text-red-600 dark:text-red-400" };
}

export function scoreToRingColor(score: number): string {
  if (score >= 80) return "stroke-emerald-500";
  if (score >= 60) return "stroke-blue-500";
  if (score >= 40) return "stroke-amber-500";
  return "stroke-red-500";
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getPlanLimits(plan: string) {
  const limits: Record<string, { projects: number; auditsPerMonth: number; aiAudits: boolean; reports: boolean; team: boolean }> = {
    FREE:    { projects: 1,   auditsPerMonth: 3,   aiAudits: false, reports: false, team: false },
    STARTER: { projects: 3,   auditsPerMonth: 20,  aiAudits: true,  reports: false, team: false },
    PRO:     { projects: 10,  auditsPerMonth: 999, aiAudits: true,  reports: true,  team: false },
    AGENCY:  { projects: 999, auditsPerMonth: 999, aiAudits: true,  reports: true,  team: true  },
  };
  return limits[plan] ?? limits.FREE;
}
