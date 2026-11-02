import type { Mode, Priority, Status } from "./types";

/* ---------- Storage ---------- */
export const TOKEN_KEY = "salarite_token";
export const USER_KEY = "salarite_user";

/* ---------- Timings ---------- */
export const TOAST_DURATION_MS = 3600;
export const SEARCH_DEBOUNCE_MS = 350;

/* ---------- Navigation ---------- */
export type View = "overview" | "tasks" | "interviews" | "activity";

export interface NavItem {
  id: View;
  icon: string;
  label: string;
  employerLabel?: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "tasks", icon: "✓", label: "My assigned tasks", employerLabel: "Task management" },
  { id: "interviews", icon: "▣", label: "Interview schedule" },
  { id: "activity", icon: "↗", label: "Activity log" },
];

export const getNavLabel = (item: NavItem, isEmployer: boolean) =>
  isEmployer && item.employerLabel ? item.employerLabel : item.label;

export const getViewLabel = (view: View, isEmployer: boolean) => {
  const item = NAV_ITEMS.find((n) => n.id === view);
  return item ? getNavLabel(item, isEmployer) : "";
};

/* ---------- Tasks ---------- */
export const statusLabel: Record<Status, string> = {
  assigned: "Assigned",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const priorityLabel: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const priorityRank: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export const STATUS_OPTIONS = Object.entries(statusLabel) as [Status, string][];
export const PRIORITY_OPTIONS = Object.entries(priorityLabel) as [Priority, string][];
export const FINISHED_STATUSES: readonly Status[] = ["completed", "cancelled"];
export const MAX_ACTIVE_PROGRESS = 99;

export const DEFAULT_CATEGORY = "Recruitment";
export const TASK_CATEGORIES = [
  "Recruitment",
  "Interview Coordination",
  "HR Operations",
  "Reporting",
  "Onboarding",
  "Candidate Experience",
] as const;

/* ---------- Interviews ---------- */
export const INTERVIEW_MODES: readonly { value: Mode; label: string }[] = [
  { value: "video", label: "Video call" },
  { value: "voice", label: "Voice call" },
  { value: "chat", label: "Chat" },
];

export const MODE_ICON: Record<Mode, string> = {
  video: "▣",
  voice: "◖",
  chat: "☷",
};

export const INTERVIEW_DURATIONS = [15, 30, 45, 60, 90] as const;
export const DEFAULT_MEETING_URL = "https://meet.google.com/";
