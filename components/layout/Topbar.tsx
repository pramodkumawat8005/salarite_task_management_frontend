import { memo } from "react";
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

interface TopbarProps {
  user: User;
  viewLabel: string;
  onLogout: () => void;
}

export const Topbar = memo(function Topbar({ user, viewLabel, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>Workspace</span>
        <b>›</b>
        <strong>{viewLabel}</strong>
      </div>
      <div className="topbar-right">
        <span className="secure-badge">
          <i /> Secure session
        </span>
        <span className="top-avatar">{initials(user.display_name)}</span>
        <button className="logout-btn" onClick={onLogout}>
          Sign out ↗
        </button>
      </div>
    </header>
  );
});
