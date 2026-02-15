import React from 'react';
import {
  Search,
  Bell,
  UserCircle,
  HelpCircle
} from 'lucide-react';

const TopNavbar = () => {
  return (
    <header className="top-navbar">
      {/* LEFT: SEARCH */}
      <div className="topbar-left">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects, machinery, or engineers…"
            aria-label="Global Search"
          />
        </div>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="topbar-right">
        <button
          className="icon-btn"
          title="Help & Documentation"
          aria-label="Help"
        >
          <HelpCircle size={20} />
        </button>

        <button
          className="icon-btn notification-wrapper"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="user-profile-nav">
          <div className="user-info-text">
            <span className="user-name">Super Admin</span>
            <span className="user-role">Chief Engineer</span>
          </div>

          <UserCircle
            size={36}
            className="user-avatar"
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
