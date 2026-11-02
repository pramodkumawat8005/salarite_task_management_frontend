import { useCallback, useState } from "react";
import { api, type InterviewPayload, type TaskPayload } from "@/lib/api";
import { STATUS_OPTIONS, getViewLabel, type View } from "@/lib/constants";
import { getErrorMessage } from "@/lib/format";
import type { Interview, Task, User } from "@/lib/types";
import { useToast } from "@/hooks/useToast";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ActivityList } from "@/components/activity/ActivityList";
import { InterviewList } from "@/components/interviews/InterviewList";
import { InterviewModal } from "@/components/interviews/InterviewModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskTable } from "@/components/tasks/TaskTable";
import { Toast } from "@/components/ui/Toast";
import { Overview } from "./Overview";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// One value describes which modal is open (and for which task) — no separate `editing` state.
type ModalState =
  { type: "create-task" } | { type: "edit-task"; task: Task } | { type: "schedule" } | null;

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const isEmployer = user.role === "employer";
  const isHr = user.role === "virtual_hr";

  const [view, setView] = useState<View>("overview");
  const [modal, setModal] = useState<ModalState>(null);
  const { toast, showToast, clearToast } = useToast();

  const {
    tasks,
    interviews,
    summary,
    activity,
    hrUsers,
    scheduledInterviews,
    upcomingCount,
    priorityTasks,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    refresh,
  } = useWorkspace(user);

  /* ---------- Modal openers ---------- */
  const closeModal = useCallback(() => setModal(null), []);
  const openCreateTask = useCallback(() => setModal({ type: "create-task" }), []);
  const openEditTask = useCallback((task: Task) => setModal({ type: "edit-task", task }), []);
  const openSchedule = useCallback(() => setModal({ type: "schedule" }), []);
  const showHelp = useCallback(
    () => showToast("For this demo, contact your workspace administrator."),
    [showToast],
  );

  /* ---------- Actions ---------- */
  const saveTask = useCallback(
    async (payload: TaskPayload) => {
      if (modal?.type === "edit-task") {
        await api.updateTask(modal.task.id, payload);
        showToast("Task updated successfully.");
      } else {
        await api.createTask(payload);
        showToast("Task created and assigned.");
      }
      setModal(null);
      await refresh();
    },
    [modal, refresh, showToast],
  );

  const removeTask = useCallback(
    async (task: Task) => {
      if (!confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
      try {
        await api.deleteTask(task.id);
        showToast("Task deleted.");
        await refresh();
      } catch (e) {
        showToast(getErrorMessage(e, "Could not delete task."));
      }
    },
    [refresh, showToast],
  );

  const createInterview = useCallback(
    async (payload: InterviewPayload) => {
      await api.createInterview(payload);
      setModal(null);
      showToast("Interview scheduled. It is visible to both Employer and HR.");
      await refresh();
    },
    [refresh, showToast],
  );

  const cancelInterview = useCallback(
    async (interview: Interview) => {
      const reason = prompt("Reason for cancelling this interview?");
      if (!reason?.trim()) return;
      try {
        await api.cancelInterview(interview.id, reason);
        showToast("Interview cancelled.");
        await refresh();
      } catch (e) {
        showToast(getErrorMessage(e, "Could not cancel interview."));
      }
    },
    [refresh, showToast],
  );

  /* ---------- Render helpers ---------- */
  const viewLabel = getViewLabel(view, isEmployer);

  const renderModal = () => {
    if (!modal) return null;
    switch (modal.type) {
      case "schedule":
        return (
          <InterviewModal
            tasks={tasks}
            userId={user.id}
            onClose={closeModal}
            onSave={createInterview}
          />
        );
      case "create-task":
        return <TaskModal task={null} hrUsers={hrUsers} onClose={closeModal} onSave={saveTask} />;
      case "edit-task":
        return (
          <TaskModal task={modal.task} hrUsers={hrUsers} onClose={closeModal} onSave={saveTask} />
        );
    }
  };

  return (
    <main className="app-shell">
      <Sidebar
        user={user}
        view={view}
        scheduledCount={scheduledInterviews.length}
        onNavigate={setView}
        onHelp={showHelp}
        onLogout={onLogout}
      />

      <section className="main-area">
        <Topbar user={user} viewLabel={viewLabel} onLogout={onLogout} />

        <div className="content">
          <PageHeader
            user={user}
            view={view}
            viewLabel={viewLabel}
            onCreateTask={openCreateTask}
            onSchedule={openSchedule}
          />

          {error && (
            <div className="error-banner">
              ⚠ {error}
              <button onClick={() => void refresh()}>Retry</button>
            </div>
          )}

          {view === "overview" && (
            <Overview
              isEmployer={isEmployer}
              summary={summary}
              priorityTasks={priorityTasks}
              scheduledInterviews={scheduledInterviews}
              upcomingCount={upcomingCount}
              activity={activity}
              onNavigate={setView}
              onEditTask={openEditTask}
              onDeleteTask={removeTask}
              onCancelInterview={cancelInterview}
              onChanged={refresh}
              onToast={showToast}
            />
          )}

          {view === "tasks" && (
            <section className="card list-card">
              <div className="toolbar">
                <label className="search-box">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by task title or description"
                  />
                </label>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {isEmployer && (
                  <button className="btn btn-primary" onClick={openCreateTask}>
                    ＋ Create task
                  </button>
                )}
              </div>
              <TaskTable
                tasks={tasks}
                employer={isEmployer}
                onEdit={openEditTask}
                onDelete={removeTask}
                onChanged={refresh}
                onToast={showToast}
                showFooter
              />
            </section>
          )}

          {view === "interviews" && (
            <section className="card list-card">
              <div className="card-heading">
                <div>
                  <h3>All scheduled interviews</h3>
                  <p>
                    Both Employer and HR can see the same interview calendar. HR owns scheduling.
                  </p>
                </div>
                {isHr && (
                  <button className="btn btn-primary" onClick={openSchedule}>
                    ＋ Schedule interview
                  </button>
                )}
              </div>
              <InterviewList
                items={interviews}
                employer={isEmployer}
                onCancel={cancelInterview}
                showNotes
              />
            </section>
          )}

          {view === "activity" && (
            <section className="card list-card">
              <div className="card-heading">
                <div>
                  <h3>Workspace activity</h3>
                  <p>A chronological audit trail for task progress.</p>
                </div>
              </div>
              <ActivityList items={activity} />
            </section>
          )}

          <footer className="footer">
            <span>© {new Date().getFullYear()} Salarite · People operations, made clearer.</span>
            <span>
              <i /> {loading ? "Syncing…" : "Your workspace is up to date"}
            </span>
          </footer>
        </div>
      </section>

      {renderModal()}
      {toast && <Toast message={toast} onClose={clearToast} />}
    </main>
  );
}
