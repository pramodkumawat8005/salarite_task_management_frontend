import { memo } from "react";
import { MODE_ICON } from "@/lib/constants";
import { capitalize, formatDateTime } from "@/lib/format";
import type { Interview } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";

interface InterviewListProps {
  items: Interview[];
  employer: boolean;
  onCancel: (interview: Interview) => void;
  showNotes?: boolean;
}

export const InterviewList = memo(function InterviewList({
  items,
  employer,
  onCancel,
  showNotes = false,
}: InterviewListProps) {
  if (!items.length) {
    return (
      <EmptyState
        compact
        icon="▣"
        title="No interviews scheduled"
        description="Scheduled interviews will appear here for both roles."
      />
    );
  }

  return (
    <div className="interview-list">
      {items.map((i) => {
        const isScheduled = i.status === "scheduled";
        return (
          <article className="interview-item" key={i.id}>
            <div className={`interview-mode ${i.mode}`}>{MODE_ICON[i.mode]}</div>

            <div className="interview-info">
              <div className="interview-title">
                <b>{i.candidate_name}</b>
                <span className={`interview-status ${i.status}`}>{i.status}</span>
              </div>
              <p>
                {capitalize(i.mode)} interview · {i.duration_minutes} min
              </p>
              <div className="interview-meta">
                <span>◷ {formatDateTime(i.scheduled_start)}</span>
                <span>♙ {i.interviewer?.display_name || "HR"}</span>
              </div>
              {showNotes && i.notes && <p className="interview-notes">{i.notes}</p>}
            </div>

            <div className="interview-actions">
              {isScheduled && i.meeting_url && (
                <a className="join-btn" href={i.meeting_url} target="_blank" rel="noreferrer">
                  Join ↗
                </a>
              )}
              {!employer && isScheduled && (
                <button className="cancel-link" onClick={() => onCancel(i)}>
                  Cancel
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
});
