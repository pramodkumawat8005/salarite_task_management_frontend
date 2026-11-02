import { TOKEN_KEY, USER_KEY } from "./constants";
import type {
  Activity,
  Interview,
  Mode,
  Priority,
  Role,
  Status,
  Summary,
  Task,
  User,
} from "./types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

/* ---------- Request / response types ---------- */
export interface AuthResult {
  access_token: string;
  user: User;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload extends LoginPayload {
  display_name: string;
  role: Role;
}
export interface TaskPayload {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  completion_criteria: string;
  due_at?: string | null;
  assignee_id: number;
}
export interface InterviewPayload {
  candidate_name: string;
  candidate_email?: string;
  related_task_id: number | null;
  mode: Mode;
  scheduled_start: string;
  duration_minutes: number;
  timezone: string;
  meeting_url: string;
  notes?: string;
}
export interface TaskFilters {
  search?: string;
  status?: string;
}
export type TaskDetail = Task & {
  activities: Array<Activity & { actor?: { display_name: string } }>;
};

/* ---------- Session helpers ---------- */
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession({ access_token, user }: AuthResult) {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ---------- Core request ---------- */
const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {}
    if (res.status === 401 && typeof window !== "undefined") clearSession();
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/* ---------- Endpoints ---------- */
export const api = {
  // auth
  register: (data: RegisterPayload) =>
    request<AuthResult>("/api/auth/register", json("POST", data)),
  login: (data: LoginPayload) => request<AuthResult>("/api/auth/login", json("POST", data)),
  me: () => request<User>("/api/auth/me"),
  users: () => request<User[]>("/api/users"),

  // dashboard
  summary: () => request<Summary>("/api/dashboard/summary"),
  activity: () => request<Activity[]>("/api/activity"),

  // tasks
  tasks: (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    return request<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
  },
  task: (id: number) => request<TaskDetail>(`/api/tasks/${id}`),
  createTask: (data: TaskPayload) => request<Task>("/api/tasks", json("POST", data)),
  updateTask: (id: number, data: Partial<TaskPayload>) =>
    request<Task>(`/api/tasks/${id}`, json("PATCH", data)),
  deleteTask: (id: number) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  status: (id: number, data: { status: Status; note?: string; blocker_reason?: string }) =>
    request<Task>(`/api/tasks/${id}/status`, json("POST", data)),
  progress: (id: number, data: { progress: number; note?: string }) =>
    request<Task>(`/api/tasks/${id}/progress`, json("POST", data)),

  // interviews
  interviews: () => request<Interview[]>("/api/interviews"),
  createInterview: (data: InterviewPayload) =>
    request<Interview>("/api/interviews", json("POST", data)),
  cancelInterview: (id: number, reason: string) =>
    request<Interview>(`/api/interviews/${id}/cancel`, json("POST", { reason })),
};
