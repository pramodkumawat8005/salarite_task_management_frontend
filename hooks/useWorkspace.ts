import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { SEARCH_DEBOUNCE_MS, priorityRank } from "@/lib/constants";
import { getErrorMessage, isFinished } from "@/lib/format";
import type { Activity, Interview, Summary, Task, User } from "@/lib/types";
import { useDebounce } from "./useDebounce";

const MAX_PRIORITY_TASKS = 5;

export function useWorkspace(user: User) {
  const isEmployer = user.role === "employer";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [hrUsers, setHrUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");
  const latestTaskRequest = useRef(0);

  // Tasks depend on filters, so they are fetched separately from everything else.
  // Typing in the search box now triggers 1 request instead of 5.
  const loadTasks = useCallback(async () => {
    const requestId = ++latestTaskRequest.current;
    const data = await api.tasks({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
    });
    // Ignore out-of-order responses from older searches.
    if (requestId === latestTaskRequest.current) setTasks(data);
  }, [debouncedSearch, statusFilter]);

  const loadMeta = useCallback(async () => {
    const [s, i, a, h] = await Promise.all([
      api.summary(),
      api.interviews(),
      api.activity(),
      // Only the employer needs the HR list (for the "assign to" dropdown).
      isEmployer ? api.users() : Promise.resolve<User[]>([]),
    ]);
    setSummary(s);
    setInterviews(i);
    setActivity(a);
    setHrUsers(h);
  }, [isEmployer]);

  const track = useCallback(async (job: () => Promise<void>) => {
    setPending((n) => n + 1);
    setError("");
    try {
      await job();
    } catch (e) {
      setError(getErrorMessage(e, "Could not load workspace."));
    } finally {
      setPending((n) => n - 1);
    }
  }, []);

  useEffect(() => {
    void track(loadTasks);
  }, [track, loadTasks]);

  useEffect(() => {
    void track(loadMeta);
  }, [track, loadMeta]);

  // Call after any create / update / delete.
  const refresh = useCallback(
    () => track(async () => void (await Promise.all([loadTasks(), loadMeta()]))),
    [track, loadTasks, loadMeta],
  );

  /* ---------- Derived data ---------- */
  const scheduledInterviews = useMemo(
    () => interviews.filter((i) => i.status === "scheduled"),
    [interviews],
  );

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return scheduledInterviews.filter((i) => new Date(i.scheduled_start).getTime() > now).length;
  }, [scheduledInterviews]);

  const priorityTasks = useMemo(
    () =>
      tasks
        .filter((t) => !isFinished(t.status))
        .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
        .slice(0, MAX_PRIORITY_TASKS),
    [tasks],
  );

  return {
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
    loading: pending > 0,
    error,
    refresh,
  };
}
