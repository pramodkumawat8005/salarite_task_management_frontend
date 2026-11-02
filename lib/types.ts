export type Role = "employer" | "virtual_hr";
export type Status = "assigned" | "in_progress" | "blocked" | "completed" | "cancelled";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Mode = "voice" | "video" | "chat";
export interface User {
  id: number;
  display_name: string;
  email: string;
  role: Role;
}
export interface Task {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  progress: number;
  category: string;
  completion_criteria: string;
  blocker_reason?: string | null;
  due_at?: string | null;
  assignee_id: number;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  assignee?: User | null;
}
export interface Activity {
  id: number;
  task_id: number;
  task_title: string;
  actor_name: string;
  event_type: string;
  note?: string | null;
  created_at: string;
}
export interface Interview {
  id: number;
  candidate_name: string;
  candidate_email?: string | null;
  interviewer_id: number;
  related_task_id?: number | null;
  mode: Mode;
  scheduled_start: string;
  duration_minutes: number;
  timezone: string;
  status: "scheduled" | "completed" | "cancelled";
  meeting_url?: string | null;
  notes?: string | null;
  interviewer?: User | null;
}
export interface Summary {
  total: number;
  overdue: number;
  counts: Record<string, number>;
  upcoming_interviews: Interview[];
  recent_activity: Activity[];
}
