import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/authService';
import toast from 'react-hot-toast';
import './Layout.css';

function Layout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const now = new Date();
  const dayNumber = now.getDate();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });

  const getPageSubtitle = () => {
    if (location.pathname.startsWith('/create')) return 'MT103 Creator';
    if (location.pathname.startsWith('/inquiry')) return 'Message Inquiry';
    return 'Dashboard';
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/inquiry?ref=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      navigate('/inquiry');
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    onLogout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="app-outer-frame">
      <div className="app-canvas-shell">
        {/* Top Navigation Header */}
        <header className="fin-header">
          <div className="fin-header-left">
            <button
              type="button"
              className="icon-circle-btn menu-eq-btn"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle Navigation"
              title="Menu"
            >
              <span className="eq-lines">
                <span />
                <span />
              </span>
            </button>

            <div className="fin-brand" onClick={() => navigate('/dashboard')}>
              <div className="fin-brand-logo">№</div>
              <div className="fin-brand-text">
                <span className="fin-brand-title">Financial</span>
                <span className="fin-brand-sub">{getPageSubtitle()}</span>
              </div>
            </div>

            <nav className={`fin-top-nav ${drawerOpen ? 'open' : ''}`}>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `fin-nav-pill ${isActive ? 'active' : ''}`}
                onClick={() => setDrawerOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/create"
                className={({ isActive }) => `fin-nav-pill ${isActive ? 'active' : ''}`}
                onClick={() => setDrawerOpen(false)}
              >
                Create SWIFT Message
              </NavLink>
              <NavLink
                to="/inquiry"
                className={({ isActive }) => `fin-nav-pill ${isActive ? 'active' : ''}`}
                onClick={() => setDrawerOpen(false)}
              >
                Message Inquiry
              </NavLink>
              <button
                type="button"
                className="fin-nav-pill fin-nav-logout"
                onClick={() => {
                  setDrawerOpen(false);
                  setShowLogoutModal(true);
                }}
              >
                Logout
              </button>
            </nav>
          </div>

          <div className="fin-header-right">
            <button
              type="button"
              className="icon-circle-btn plus-quick-btn"
              onClick={() => navigate('/create')}
              title="Create New MT103 Message"
              aria-label="Create New MT103 Message"
            >
              +
            </button>

            <div className="fin-user-chip">
              <div className="fin-user-avatar">
                {user?.fullName?.[0] || user?.username?.[0] || 'A'}
              </div>
              <div className="fin-user-meta">
                <span className="fin-user-name">{user?.fullName || user?.username}</span>
                <span className="fin-user-role">
                  {user?.role === 'ADMIN' ? 'SWIFT Administrator' : 'SWIFT Operator'}
                </span>
              </div>
            </div>

            <form className="fin-search-box" onSubmit={handleQuickSearch}>
              <button type="submit" className="icon-circle-btn search-circle-icon" aria-label="Search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <input
                type="text"
                className="fin-search-input"
                placeholder="Start searching here ..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
              />
            </form>

            <button
              type="button"
              className="header-logout-pill"
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Second Hero Row: Date Widget + Coral CTA + Greeting Banner */}
        <section className="fin-hero-strip">
          <div className="fin-hero-left">
            <div className="fin-date-circle">{dayNumber}</div>
            <div className="fin-date-meta">
              <span>{weekday},</span>
              <span>{monthName}</span>
            </div>

            <div className="fin-hero-divider" />

            <button
              type="button"
              className="btn btn-primary fin-cta-pill"
              onClick={() => navigate(location.pathname === '/create' ? '/inquiry' : '/create')}
            >
              <span>{location.pathname === '/create' ? 'Show Messages' : 'Create MT103'}</span>
              <span className="cta-arrow">→</span>
            </button>

            <button
              type="button"
              className="icon-circle-btn calendar-dot-btn"
              onClick={() => navigate('/inquiry')}
              title="View Message History"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="coral-notif-dot" />
            </button>
          </div>

          <div className="fin-hero-right">
            <div className="fin-greeting-block">
              <h2 className="fin-greeting-title">
                Hey, Need help?<span className="wave-hand">👋</span>
              </h2>
              <p className="fin-greeting-prompt">
                <span className="coral-caret">|</span>Generate or inspect SWIFT MT103 transfers!
              </p>
            </div>
            <button
              type="button"
              className="fin-mic-circle"
              onClick={() => navigate('/create')}
              title="Quick Create MT103"
              aria-label="Quick Create MT103"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </section>

        {/* Workspace Body with Left Floating Action Pill Rail + Main Content */}
        <div className="fin-workspace-body">
          <aside className="fin-left-rail">
            <div className="fin-rail-capsule">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `rail-icon-link ${isActive ? 'active' : ''}`}
                title="Dashboard"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </NavLink>
              <NavLink
                to="/inquiry"
                className={({ isActive }) => `rail-icon-link ${isActive ? 'active' : ''}`}
                title="Message Inquiry"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </NavLink>
              <button
                type="button"
                className="rail-plus-btn"
                onClick={() => navigate('/create')}
                title="Create SWIFT MT103"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="icon-circle-btn rail-logout-btn"
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
              aria-label="Logout"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </aside>

          <main className="fin-main-stage">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-badge">№</div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of your SWIFT session?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLogout}>
                Logout →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
