import { memo } from "react";
import { NAV_ITEMS, getNavLabel, type View } from "@/lib/constants";
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

interface SidebarProps {
  user: User;
  view: View;
  scheduledCount: number;
  onNavigate: (view: View) => void;
  onHelp: () => void;
  onLogout: () => void;
}

export const Sidebar = memo(function Sidebar({
  user,
  view,
  scheduledCount,
  onNavigate,
  onHelp,
  onLogout,
}: SidebarProps) {
  const isEmployer = user.role === "employer";

  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("overview");
        }}
      >
        <span className="brand-mark">S</span>
        <span>
          Salarite<small>PEOPLE OPERATIONS</small>
        </span>
      </a>

      <div className="workspace-switch">
        <span className="workspace-dot" />
        <span>
          <b>Hiring workspace</b>
          <small>Team operations</small>
        </span>
        <span className="chevron">⌄</span>
      </div>

      <p className="nav-label">WORKSPACE</p>
      <nav>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {getNavLabel(item, isEmployer)}
            {item.id === "interviews" && scheduledCount > 0 && (
              <span className="nav-count">{scheduledCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <span className="help-icon">✦</span>
          <b>Need a hand?</b>
          <p>Keep your hiring workflow moving smoothly.</p>
          <button onClick={onHelp}>
            Help centre <span>↗</span>
          </button>
        </div>
        <div className="profile-row">
          <span className="avatar">{initials(user.display_name)}</span>
          <span className="profile-info">
            <b>{user.display_name}</b>
            <small>{isEmployer ? "Employer / Hiring manager" : "HR coordinator"}</small>
          </span>
          <button className="logout-mini" title="Sign out" onClick={onLogout}>
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
});
