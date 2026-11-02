import { FINISHED_STATUSES } from "./constants";
import type { Status, Task } from "./types";

const LOCALE = "en-IN";

// Intl formatters are expensive to create, so build them once.
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const weekdayFormat = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const todayFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatDate = (iso?: string | null) =>
  iso ? dateFormat.format(new Date(iso)) : "No deadline";
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));
export const formatToday = (d = new Date()) => todayFormat.format(d);
export const formatEyebrowDate = (d = new Date()) => weekdayFormat.format(d).toUpperCase();
export const formatTaskId = (id: number) => `TASK-${String(id).padStart(4, "0")}`;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const firstName = (name: string) => name.split(" ")[0];
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const getErrorMessage = (e: unknown, fallback: string) =>
  e instanceof Error ? e.message : fallback;

/* ---------- Task helpers ---------- */
export const isFinished = (status: Status) => FINISHED_STATUSES.includes(status);

export const isOverdue = (task: Task) =>
  !!task.due_at && new Date(task.due_at) < new Date() && !isFinished(task.status);

// <input type="datetime-local"> needs LOCAL time ("YYYY-MM-DDTHH:mm"), not UTC.
export function toDateTimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
