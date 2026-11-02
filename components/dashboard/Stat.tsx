import { memo } from "react";

interface StatProps {
  icon: string;
  label: string;
  value: number;
  hint: string;
}

export const Stat = memo(function Stat({ icon, label, value, hint }: StatProps) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
});
