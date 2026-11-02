import { memo, useMemo } from "react";
import type { View } from "@/lib/constants";
import { firstName, formatEyebrowDate, formatToday } from "@/lib/format";
import type { User } from "@/lib/types";

interface PageHeaderProps {
  user: User;
  view: View;
  viewLabel: string;
  onCreateTask: () => void;
  onSchedule: () => void;
}

function getTitle(view: View, label: string, isEmployer: boolean, name: string) {
  if (view !== "overview") return label;
  return isEmployer ? `Welcome back, ${name}.` : `Good to see you, ${name}.`;
}

function getSubheading(view: View, isEmployer: boolean) {
  switch (view) {
    case "overview":
      return isEmployer
        ? "Your hiring operations, organised in one clear view."
        : "Your assigned work and upcoming candidate conversations, all in one place.";
    case "tasks":
      return isEmployer
        ? "Create, assign, update, and track every task."
        : "Update progress on tasks assigned to your HR account.";
    case "interviews":
      return "A shared schedule of candidate interviews across your team.";
    case "activity":
      return "A transparent timeline of recent task activity.";
  }
}

export const PageHeader = memo(function PageHeader({
  user,
  view,
  viewLabel,
  onCreateTask,
  onSchedule,
}: PageHeaderProps) {
  const isEmployer = user.role === "employer";
  const isHr = user.role === "virtual_hr";
  const today = useMemo(() => new Date(), []);

  return (
    <div className="welcome-row">
      <div>
        <p className="eyebrow">{formatEyebrowDate(today)} · SALARITE WORKSPACE</p>
        <h1>{getTitle(view, viewLabel, isEmployer, firstName(user.display_name))}</h1>
        <p className="subheading">{getSubheading(view, isEmployer)}</p>
      </div>

      <div className="header-actions">
        {isHr && (
          <button className="btn btn-light" onClick={onSchedule}>
            ＋ Schedule interview
          </button>
        )}
        {isEmployer && view === "tasks" && (
          <button className="btn btn-primary" onClick={onCreateTask}>
            ＋ Create task
          </button>
        )}
        {view === "overview" && <span className="date-chip">◷ {formatToday(today)}</span>}
      </div>
    </div>
  );
});
