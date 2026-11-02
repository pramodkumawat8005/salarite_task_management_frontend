interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, compact = false }: EmptyStateProps) {
  return (
    <div className={compact ? "empty-state compact" : "empty-state"}>
      <span>{icon}</span>
      <b>{title}</b>
      <p>{description}</p>
    </div>
  );
}
