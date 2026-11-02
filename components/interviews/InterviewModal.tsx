import { useMemo, useState, type FormEvent } from "react";
import type { InterviewPayload } from "@/lib/api";
import { DEFAULT_MEETING_URL, INTERVIEW_DURATIONS, INTERVIEW_MODES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/format";
import type { Mode, Task } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";

interface InterviewModalProps {
  tasks: Task[];
  userId: number;
  onClose: () => void;
  onSave: (payload: InterviewPayload) => Promise<void>;
}

interface FormState {
  name: string;
  email: string;
  mode: Mode;
  date: string;
  duration: number;
  url: string;
  taskId: string;
  notes: string;
}

export function InterviewModal({ tasks, userId, onClose, onSave }: InterviewModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    mode: "video",
    date: "",
    duration: 30,
    url: DEFAULT_MEETING_URL,
    taskId: "",
    notes: "",
  });

  const assignedTasks = useMemo(
    () => tasks.filter((t) => t.assignee_id === userId),
    [tasks, userId],
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.date || new Date(form.date) <= new Date()) {
      setError("Please choose a future date and time.");
      return;
    }
    if (form.mode === "video" && !form.url.trim()) {
      setError("Add the video meeting URL.");
      return;
    }

    setBusy(true);
    try {
      await onSave({
        candidate_name: form.name.trim(),
        candidate_email: form.email || undefined,
        related_task_id: form.taskId ? Number(form.taskId) : null,
        mode: form.mode,
        scheduled_start: new Date(form.date).toISOString(),
        duration_minutes: form.duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        meeting_url: form.url.trim(),
        notes: form.notes || undefined,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not schedule interview."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Schedule an interview"
      subtitle="Add a candidate conversation to the shared team calendar."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="form-wide">
          Candidate full name
          <input
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Candidate name"
          />
        </label>

        <label className="form-wide">
          Candidate email (optional)
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="candidate@example.com"
          />
        </label>

        <label>
          Interview format
          <select value={form.mode} onChange={(e) => setField("mode", e.target.value as Mode)}>
            {INTERVIEW_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Duration
          <select
            value={form.duration}
            onChange={(e) => setField("duration", Number(e.target.value))}
          >
            {INTERVIEW_DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </select>
        </label>

        <label className="form-wide">
          Date & time
          <input
            required
            type="datetime-local"
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
          />
        </label>

        <label className="form-wide">
          Meeting / call link
          <input
            required
            type="url"
            value={form.url}
            onChange={(e) => setField("url", e.target.value)}
            placeholder="https://meet.google.com/..."
          />
          <small className="field-help">
            Add the real meeting, voice-call, or chat link so both roles can join from the schedule.
          </small>
        </label>

        <label className="form-wide">
          Related task (optional)
          <select value={form.taskId} onChange={(e) => setField("taskId", e.target.value)}>
            <option value="">No related task</option>
            {assignedTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>

        <label className="form-wide">
          Interview notes
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Agenda, interviewer prep, or candidate context…"
          />
        </label>

        {error && <div className="auth-error form-wide">{error}</div>}

        <div className="modal-actions form-wide">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Scheduling…" : "Schedule interview"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
