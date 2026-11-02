import { useMemo } from "react";
import type { View } from "@/lib/constants";
import type { Activity, Interview, Summary, Task } from "@/lib/types";
import { ActivityList } from "@/components/activity/ActivityList";
import { InterviewList } from "@/components/interviews/InterviewList";
import { TaskTable } from "@/components/tasks/TaskTable";
import { Stat } from "./Stat";

interface OverviewProps {
  isEmployer: boolean;
  summary: Summary | null;
  priorityTasks: Task[];
  scheduledInterviews: Interview[];
  upcomingCount: number;
  activity: Activity[];
  onNavigate: (view: View) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCancelInterview: (interview: Interview) => void;
  onChanged: () => Promise<void>;
  onToast: (message: string) => void;
}

export function Overview({
  isEmployer,
  summary,
  priorityTasks,
  scheduledInterviews,
  upcomingCount,
  activity,
  onNavigate,
  onEditTask,
  onDeleteTask,
  onCancelInterview,
  onChanged,
  onToast,
}: OverviewProps) {
  const nextInterviews = useMemo(() => scheduledInterviews.slice(0, 4), [scheduledInterviews]);
  const recentActivity = useMemo(() => activity.slice(0, 4), [activity]);

  const blocked = summary?.counts.blocked ?? 0;
  const overdue = summary?.overdue ?? 0;

  return (
    <>
      <section className="welcome-banner">
        <div className="banner-copy">
          <span className="banner-label">
            <i /> {isEmployer ? "HIRING CONTROL CENTRE" : "YOUR DAILY WORKSPACE"}
          </span>
          <h2>
            {isEmployer ? "Build a better hiring rhythm." : "Small steps. Meaningful progress."}
          </h2>
          <p>
            {isEmployer
              ? "Stay on top of delivery, see every interview, and keep your team aligned."
              : "Focus on your priorities, flag blockers early, and keep candidate conversations on track."}
          </p>
          <button
            className="banner-link"
            onClick={() => onNavigate(isEmployer ? "tasks" : "interviews")}
          >
            {isEmployer ? "Manage team tasks" : "View interview schedule"} <span>→</span>
          </button>
        </div>

        <div className="banner-art">
          <div className="art-ring ring-one" />
          <div className="art-ring ring-two" />
          <div className="art-tile tile-a">
            ✓<small>On track</small>
          </div>
          <div className="art-tile tile-b">
            <span>↗</span>
            <small>Team sync</small>
          </div>
          <div className="art-orb">S</div>
        </div>
      </section>

      <div className="stats-grid">
        <Stat
          icon="▤"
          label={isEmployer ? "Total tasks" : "My tasks"}
          value={summary?.total ?? 0}
          hint="Across your workspace"
        />
        <Stat
          icon="◷"
          label="In progress"
          value={summary?.counts.in_progress ?? 0}
          hint="Actively being worked on"
        />
        <Stat
          icon="⚑"
          label="Needs attention"
          value={blocked + overdue}
          hint={`${overdue} overdue · ${blocked} blocked`}
        />
        <Stat
          icon="▣"
          label="Upcoming interviews"
          value={upcomingCount}
          hint="Scheduled conversations"
        />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-heading">
            <div>
              <h3>{isEmployer ? "Priority tasks" : "Your active tasks"}</h3>
              <p>
                {isEmployer
                  ? "Tasks that could use your attention."
                  : "Your next steps, at a glance."}
              </p>
            </div>
            <button className="text-link" onClick={() => onNavigate("tasks")}>
              View all →
            </button>
          </div>
          <TaskTable
            tasks={priorityTasks}
            employer={isEmployer}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onChanged={onChanged}
            onToast={onToast}
          />
        </section>

        <section className="card">
          <div className="card-heading">
            <div>
              <h3>Upcoming interviews</h3>
              <p>What’s next on the hiring calendar.</p>
            </div>
            <button className="text-link" onClick={() => onNavigate("interviews")}>
              Full schedule →
            </button>
          </div>
          <InterviewList
            items={nextInterviews}
            employer={isEmployer}
            onCancel={onCancelInterview}
          />
        </section>
      </div>

      <section className="card activity-card">
        <div className="card-heading">
          <div>
            <h3>Recent activity</h3>
            <p>Latest updates from your workspace.</p>
          </div>
          <button className="text-link" onClick={() => onNavigate("activity")}>
            Activity log →
          </button>
        </div>
        <ActivityList items={recentActivity} />
      </section>
    </>
  );
}
