import { memo, useState } from "react";
import { api } from "@/lib/api";
import { MAX_ACTIVE_PROGRESS, priorityLabel, statusLabel } from "@/lib/constants";
import {
  formatDate,
  formatTaskId,
  getErrorMessage,
  initials,
  isFinished,
  isOverdue,
} from "@/lib/format";
import type { Status, Task } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";

interface TaskTableProps {
  tasks: Task[];
  employer: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChanged: () => Promise<void>;
  onToast: (message: string) => void;
  showFooter?: boolean;
}

export const TaskTable = memo(function TaskTable({
  tasks,
  employer,
  onEdit,
  onDelete,
  onChanged,
  onToast,
  showFooter = false,
}: TaskTableProps) {
  if (!tasks.length) {
    return (
      <EmptyState
        icon="✓"
        title="No tasks found"
        description={
          employer
            ? "Create a task and assign it to an HR account."
            : "When a task is assigned to your account, it will appear here."
        }
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>TASK</th>
            {employer && <th>ASSIGNEE</th>}
            <th>PRIORITY</th>
            <th>STATUS</th>
            <th>PROGRESS</th>
            <th>DUE DATE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              employer={employer}
              onEdit={onEdit}
              onDelete={onDelete}
              onChanged={onChanged}
              onToast={onToast}
            />
          ))}
        </tbody>
      </table>

      {showFooter && (
        <div className="table-foot">
          Showing {tasks.length} task{tasks.length === 1 ? "" : "s"}
          <span>Role permissions are enforced by the API.</span>
        </div>
      )}
    </div>
  );
});

/* ---------- Single row (keeps its own editor state) ---------- */

interface TaskRowProps {
  task: Task;
  employer: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChanged: () => Promise<void>;
  onToast: (message: string) => void;
}

const TaskRow = memo(function TaskRow({
  task,
  employer,
  onEdit,
  onDelete,
  onChanged,
  onToast,
}: TaskRowProps) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(task.progress);

  const finished = isFinished(task.status);
  const assigneeName = task.assignee?.display_name;

  const toggleEditor = () => {
    setProgress(Math.min(task.progress, MAX_ACTIVE_PROGRESS)); // always start from latest value
    setOpen((o) => !o);
  };

  const run = async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      onToast(successMessage);
      setOpen(false);
      await onChanged();
    } catch (e) {
      onToast(getErrorMessage(e, "Could not update task."));
    }
  };

  const saveProgress = () =>
    run(
      () => api.progress(task.id, { progress, note: "Progress updated from task list." }),
      "Progress updated.",
    );

  const changeStatus = (status: Status) => {
    let blockerReason: string | undefined;
    if (status === "blocked") {
      blockerReason = prompt("What is blocking this task?")?.trim();
      if (!blockerReason) return;
    }
    return run(
      () =>
        api.status(task.id, {
          status,
          blocker_reason: blockerReason,
          note: "Updated from task list.",
        }),
      `Task marked ${statusLabel[status].toLowerCase()}.`,
    );
  };

  return (
    <tr>
      <td>
        <div className="task-name">
          <span className={`task-dot ${task.priority}`} />
          <span>
            <b>{task.title}</b>
            <small>
              {task.category} · {formatTaskId(task.id)}
            </small>
          </span>
        </div>
      </td>

      {employer && (
        <td>
          <div className="assignee">
            <span className="tiny-avatar">{initials(assigneeName || "HR")}</span>
            {assigneeName || "HR member"}
          </div>
        </td>
      )}

      <td>
        <span className={`priority-pill ${task.priority}`}>{priorityLabel[task.priority]}</span>
      </td>

      <td>
        <span className={`status-pill ${task.status}`}>
          <i />
          {statusLabel[task.status]}
        </span>
      </td>

      <td>
        <div className="progress-cell">
          <div className="progress-track">
            <i style={{ width: `${task.progress}%` }} />
          </div>
          <small>{task.progress}%</small>
        </div>
      </td>

      <td className={isOverdue(task) ? "overdue" : ""}>{formatDate(task.due_at)}</td>

      <td>
        <div className="row-actions">
          {employer ? (
            <>
              <button title="Edit task" onClick={() => onEdit(task)}>
                ✎
              </button>
              <button title="Delete task" className="danger-action" onClick={() => onDelete(task)}>
                ⌫
              </button>
            </>
          ) : (
            <button title="Update task" onClick={toggleEditor}>
              {open ? "×" : "↗"}
            </button>
          )}
        </div>

        {!employer && open && (
          <div className="inline-editor">
            <label>
              Progress <b>{progress}%</b>
              <input
                type="range"
                min={0}
                max={MAX_ACTIVE_PROGRESS}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </label>
            <button className="btn btn-primary btn-small" onClick={() => void saveProgress()}>
              Save progress
            </button>

            {!finished && (
              <div className="quick-status">
                {task.status !== "in_progress" && (
                  <button onClick={() => void changeStatus("in_progress")}>Start</button>
                )}
                {task.status !== "blocked" && (
                  <button onClick={() => void changeStatus("blocked")}>Block</button>
                )}
                <button onClick={() => void changeStatus("completed")}>Complete</button>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
});
