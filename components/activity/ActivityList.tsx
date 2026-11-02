import { memo } from "react";
import { formatDateTime } from "@/lib/format";
import type { Activity } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";

interface ActivityListProps {
  items: Activity[];
}

export const ActivityList = memo(function ActivityList({ items }: ActivityListProps) {
  if (!items.length) {
    return (
      <EmptyState
        compact
        icon="↗"
        title="No activity yet"
        description="Task changes and progress updates will appear here."
      />
    );
  }

  return (
    <div className="activity-list">
      {items.map((a) => (
        <div className="activity-row" key={a.id}>
          <span className="activity-check">✓</span>
          <div>
            <p>
              <b>{a.actor_name}</b> {a.event_type.replace(/_/g, " ")} <b>{a.task_title}</b>
            </p>
            {a.note && <small>{a.note}</small>}
            <time>{formatDateTime(a.created_at)}</time>
          </div>
        </div>
      ))}
    </div>
  );
});
