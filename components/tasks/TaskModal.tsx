import { useState, type FormEvent } from "react";
import type { TaskPayload } from "@/lib/api";
import { DEFAULT_CATEGORY, PRIORITY_OPTIONS, TASK_CATEGORIES } from "@/lib/constants";
import { getErrorMessage, toDateTimeLocal } from "@/lib/format";
import type { Priority, Task, User } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";

interface TaskModalProps {
  task: Task | null;
  hrUsers: User[];
  onClose: () => void;
  onSave: (payload: TaskPayload) => Promise<void>;
}

interface FormState {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  due: string;
  criteria: string;
  assignee: string;
}

export function TaskModal({ task, hrUsers, onClose, onSave }: TaskModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    category: task?.category ?? DEFAULT_CATEGORY,
    due: task?.due_at ? toDateTimeLocal(task.due_at) : "",
    criteria: task?.completion_criteria ?? "",
    assignee: String(task?.assignee_id ?? hrUsers[0]?.id ?? ""),
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.assignee) {
      setError("No HR account is available. Ask an HR teammate to register first.");
      return;
    }

    setBusy(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description,
        priority: form.priority,
        category: form.category,
        completion_criteria: form.criteria,
        due_at: form.due ? new Date(form.due).toISOString() : null,
        assignee_id: Number(form.assignee),
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not save task."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={task ? "Edit task details" : "Create a new task"}
      subtitle={
        task
          ? "Update task details and assignment."
          : "Define the outcome and assign an HR teammate."
      }
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="form-wide">
          Task title
          <input
            required
            minLength={3}
            maxLength={160}
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Screen shortlisted candidates"
          />
        </label>

        <label className="form-wide">
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Add context, instructions, or useful links…"
          />
        </label>

        <label>
          Category
          <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
            {TASK_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select
            value={form.priority}
            onChange={(e) => setField("priority", e.target.value as Priority)}
          >
            {PRIORITY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-wide">
          Assign to HR
          <select value={form.assignee} onChange={(e) => setField("assignee", e.target.value)}>
            <option value="">Select HR account</option>
            {hrUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name} · {u.email}
              </option>
            ))}
          </select>
          {!hrUsers.length && (
            <small className="field-help">
              No HR account found yet. Create an HR account using the registration page.
            </small>
          )}
        </label>

        <label className="form-wide">
          Due date & time
          <input
            type="datetime-local"
            value={form.due}
            onChange={(e) => setField("due", e.target.value)}
          />
        </label>

        <label className="form-wide">
          Completion criteria
          <textarea
            rows={2}
            value={form.criteria}
            onChange={(e) => setField("criteria", e.target.value)}
            placeholder="What does done look like?"
          />
        </label>

        {error && <div className="auth-error form-wide">{error}</div>}

        <div className="modal-actions form-wide">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : task ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
