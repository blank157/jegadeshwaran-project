import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardStats, getMessages } from '../services/messageService';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activitySearch, setActivitySearch] = useState('');
  const [activeTag, setActiveTag] = useState('ALL');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, msgsRes] = await Promise.all([
        getDashboardStats(),
        getMessages({ page: 0, size: 6 }),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (msgsRes.success && msgsRes.data) {
        setRecentMessages(msgsRes.data.content || []);
      }
    } catch (err) {
      setError('Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate real metrics from backend data
  const totalMessages = stats?.totalMessages ?? 0;
  const todayMessages = stats?.todayMessages ?? 0;
  const availableTypesCount = stats?.availableMessageTypes ?? 4;
  const messageTypes = stats?.messageTypes || ['MT103', 'MT202', 'MT700', 'MT910'];

  const totalSettledAmount = recentMessages.reduce(
    (sum, m) => sum + (Number(m.amount) || 0),
    0
  );

  const latestMessage = recentMessages[0] || null;
  const latestAmount = latestMessage ? Number(latestMessage.amount) : 15000.0;

  const todayRatio = totalMessages > 0
    ? Math.min(100, Math.round((todayMessages / totalMessages) * 100))
    : 100;

  const filteredRecent = recentMessages.filter((m) => {
    const matchesSearch =
      !activitySearch.trim() ||
      m.messageReference?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      m.senderBic?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      m.receiverBic?.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesTag =
      activeTag === 'ALL' ||
      (activeTag === 'SHA' && m.chargesCode === 'SHA') ||
      (activeTag === 'OUR' && m.chargesCode === 'OUR');
    return matchesSearch && matchesTag;
  });

  const formatNumber = (val) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);

  return (
    <div className="bento-dashboard">
      {error && (
        <div className="bento-alert-banner">
          <span>⚠️ {error}</span>
          <button className="btn btn-primary btn-sm" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      )}

      {/* TOP BENTO GRID */}
      <div className="bento-top-grid">
        {/* 1. Primary SWIFT Account / Corridor Card (Matches VISA Direct Debits Card) */}
        <div className="bento-card swift-corridor-card">
          <div className="corridor-top">
            <div className="corridor-header-row">
              <span className="swift-fin-mark">SWIFT FIN</span>
              <span className="pill-select-badge">MT103 Direct ▾</span>
            </div>

            <div className="corridor-account-block">
              <span className="muted-caption">Linked to primary BIC node</span>
              <div className="masked-bic-number">
                **** {latestMessage ? latestMessage.messageReference.slice(-4) : '1030'}
              </div>
            </div>

            <div className="corridor-action-pills">
              <button
                type="button"
                className="btn btn-dark corridor-btn"
                onClick={() => navigate('/create')}
              >
                Create MT103
              </button>
              <button
                type="button"
                className="btn btn-secondary corridor-btn"
                onClick={() => navigate('/inquiry')}
              >
                Inquire
              </button>
            </div>
          </div>

          <div className="corridor-bottom">
            <div>
              <span className="muted-caption">Available message types</span>
              <div className="corridor-fee-val">
                <span className="currency-symbol">№</span>
                {loading ? '...' : `${availableTypesCount}.00`}
              </div>
            </div>

            <Link to="/create" className="coral-action-link">
              <span className="coral-circle-mini">✎</span>
              <span>Edit MT103 fields</span>
            </Link>
          </div>
        </div>

        {/* 2. Middle Stacked Totals Column (Matches Total income / Total paid) */}
        <div className="bento-middle-stack">
          <div className="bento-card metric-split-card">
            <div className="metric-card-top">
              <span className="metric-icon-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <span className="pill-select-badge">All Time ▾</span>
            </div>
            <div className="metric-card-bottom">
              <span className="muted-caption">Total stored messages</span>
              <div className="metric-big-number">
                <span className="currency-symbol">№</span>
                {loading ? '...' : totalMessages}
                <span className="metric-sub-inline">
                  &nbsp;(<span className="currency-symbol">$</span>{formatNumber(totalSettledAmount)})
                </span>
              </div>
            </div>
          </div>

          <div className="bento-card metric-split-card">
            <div className="metric-card-top">
              <span className="metric-icon-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span className="pill-select-badge">Today ▾</span>
            </div>
            <div className="metric-card-bottom metric-row-between">
              <div>
                <span className="muted-caption">Messages created today</span>
                <div className="metric-big-number">
                  <span className="currency-symbol">№</span>
                  {loading ? '...' : todayMessages}
                </div>
              </div>
              <Link to="/inquiry" className="coral-action-link">
                <span className="coral-circle-mini">↗</span>
                <span>View<br />in inquiry mode</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Center Circular Lock & Dark Radial Gauge Column */}
        <div className="bento-circles-col">
          <div className="system-lock-circle" onClick={() => navigate('/inquiry')} title="JWT Protected">
            <div className="lock-icon-wrap">🔒</div>
            <span className="lock-label">JWT Secured</span>
          </div>

          <div className="dark-gauge-circle" title="Today's message share">
            <svg className="gauge-svg" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="#2A2A2D"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="#DF6042"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(todayRatio / 100) * 289} 289`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="gauge-center-text">
              <span className="gauge-pct">{todayRatio}%</span>
              <span className="gauge-sub">Today rate</span>
            </div>
          </div>
        </div>

        {/* 4. Right Area: Top 2 Mini Cards + Bottom Wave Stock Card */}
        <div className="bento-right-cluster">
          <div className="bento-right-mini-row">
            {/* Dot Matrix Card (Matches "13 Days" card) */}
            <div className="bento-card mini-days-card">
              <div className="mini-card-icon">🕒</div>
              <div className="mini-days-title">{totalMessages} Saved</div>
              <div className="mini-days-sub">Active MySQL records</div>
              <div className="coral-dot-matrix">
                {Array.from({ length: 16 }, (_, idx) => (
                  <span
                    key={idx}
                    className={`matrix-dot ${idx < Math.max(4, Math.min(16, totalMessages * 3)) ? 'filled' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Grid Pill Comparison Card (Matches 2022/2023 card) */}
            <div className="bento-card mini-grid-card">
              <div className="mini-card-icon">📊</div>
              <div className="grid-Comparing-visual">
                <div className="compare-pill compare-pill-muted">MT202</div>
                <div className="compare-pill compare-pill-coral">MT103</div>
                <div className="compare-stem-muted" />
                <div className="compare-stem-coral" />
              </div>
            </div>
          </div>

          {/* Wave Line Chart Card (Matches Main Stocks $16,073.49 card) */}
          <div className="bento-card wave-stocks-card" onClick={() => navigate('/inquiry')}>
            <div className="wave-card-top">
              <span className="metric-icon-badge">📈</span>
              <div className="wave-card-amount">
                <span className="currency-symbol">$</span>
                {formatNumber(totalSettledAmount || 23500.5)}
              </div>
            </div>

            <div className="wave-svg-wrap">
              <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="coral-wave-svg">
                <defs>
                  <linearGradient id="coralWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DF6042" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#DF6042" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,55 C20,50 35,22 55,32 C75,42 90,15 115,24 C140,33 155,48 180,25 C205,2 225,44 250,20 C270,4 285,38 300,30 L300,70 L0,70 Z"
                  fill="url(#coralWaveGrad)"
                />
                <path
                  d="M0,55 C20,50 35,22 55,32 C75,42 90,15 115,24 C140,33 155,48 180,25 C205,2 225,44 250,20 C270,4 285,38 300,30"
                  fill="none"
                  stroke="#DF6042"
                  strokeWidth="2.2"
                />
              </svg>
            </div>

            <div className="wave-card-bottom">
              <div>
                <div className="wave-title">MT103 Volume</div>
                <div className="muted-caption">CRED &amp; Priority Corridors</div>
              </div>
              <span className="badge badge-coral">+ {todayMessages} Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BENTO GRID */}
      <div className="bento-bottom-grid">
        {/* 1. Concentric Coral Circles Card (Matches "Annual profits" card) */}
        <div className="bento-card concentric-profits-card">
          <div className="bento-section-header">
            <h3 className="bento-card-title">Message catalogue</h3>
            <span className="pill-select-badge">FIN MT ▾</span>
          </div>

          <div className="concentric-rings-stage">
            <div className="concentric-ring ring-4">
              <span className="ring-label">{messageTypes[3] || 'MT910'}</span>
              <div className="concentric-ring ring-3">
                <span className="ring-label">{messageTypes[2] || 'MT700'}</span>
                <div className="concentric-ring ring-2">
                  <span className="ring-label">{messageTypes[1] || 'MT202'}</span>
                  <div className="concentric-ring ring-1" onClick={() => navigate('/create')}>
                    <span className="ring-core-label">
                      {messageTypes[0] || 'MT103'} ({totalMessages})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Activity Manager Card (Matches center "Activity manager" card) */}
        <div className="bento-card activity-manager-card">
          <div className="bento-section-header">
            <h3 className="bento-card-title">Activity manager</h3>
            <div className="activity-header-controls">
              <button
                type="button"
                className="icon-circle-btn mini-ctrl-btn"
                onClick={fetchDashboardData}
                title="Refresh Data"
              >
                ↻
              </button>
              <Link to="/inquiry" className="pill-select-badge">
                ▽ Filters
              </Link>
            </div>
          </div>

          {/* Search & Filter Chips Row */}
          <div className="activity-search-strip">
            <div className="activity-search-input-wrap">
              <span className="search-glyph">🔍</span>
              <input
                type="text"
                placeholder="Search in activities .."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
              />
            </div>

            <div className="activity-filter-chips">
              <button
                type="button"
                className={`chip-pill ${activeTag === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTag('ALL')}
              >
                All MT103 <span className="chip-coral-dot" />
              </button>
              <button
                type="button"
                className={`chip-pill ${activeTag === 'SHA' ? 'active' : ''}`}
                onClick={() => setActiveTag(activeTag === 'SHA' ? 'ALL' : 'SHA')}
              >
                SHA Charges <span>×</span>
              </button>
              <button
                type="button"
                className={`chip-pill ${activeTag === 'OUR' ? 'active' : ''}`}
                onClick={() => setActiveTag(activeTag === 'OUR' ? 'ALL' : 'OUR')}
              >
                OUR Charges <span>×</span>
              </button>
            </div>
          </div>

          {/* 3 Inner Sub-Cards */}
          <div className="activity-inner-trio">
            {/* Inner Card 1: Latest Settlement Equalizer */}
            <div className="activity-subcard">
              <div className="subcard-amount">
                <span className="currency-symbol">$</span>
                {formatNumber(latestAmount)}
                <span className="subcard-ccy">{latestMessage?.currency || 'USD'}</span>
              </div>

              <div className="equalizer-bars">
                {[38, 62, 45, 80, 52, 92, 60, 74, 42, 68].map((h, i) => (
                  <div key={i} className="eq-bar-track">
                    <div
                      className={`eq-bar-fill ${i % 2 === 1 ? 'coral' : 'dark'}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="subcard-dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot active-pill" />
                <span className="dot" />
              </div>
            </div>

            {/* Inner Card 2: Recent Corridors Timeline */}
            <div className="activity-subcard">
              <div className="subcard-header-row">
                <span className="subcard-title">Recent transfers</span>
                <Link to="/inquiry" className="subcard-more">⋮</Link>
              </div>

              <div className="corridor-timeline-list">
                {(filteredRecent.slice(0, 3).length > 0
                  ? filteredRecent.slice(0, 3)
                  : [
                      { id: 1, messageReference: 'REF20261012001', senderBic: 'DEUTDEDB', currency: 'USD' },
                      { id: 2, messageReference: 'REF20261012002', senderBic: 'BARCGB22', currency: 'EUR' },
                    ]
                ).map((item) => (
                  <Link
                    key={item.id || item.messageReference}
                    to={item.id ? `/inquiry/${item.id}` : '/inquiry'}
                    className="timeline-node-item"
                  >
                    <span className="timeline-coral-icon">🏦</span>
                    <div className="timeline-node-text">
                      <strong>{item.messageReference}</strong>
                      <small>{item.senderBic} • {item.currency}</small>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Inner Card 3: Wallet / SWIFT Verification CTA */}
            <div className="activity-subcard verification-subcard">
              <div className="sunburst-svg-wrap">
                <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
                  {Array.from({ length: 16 }, (_, i) => {
                    const angle = (i * 360) / 16;
                    return (
                      <line
                        key={i}
                        x1="24"
                        y1="4"
                        x2="24"
                        y2="14"
                        stroke="#DF6042"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        transform={`rotate(${angle} 24 24)`}
                      />
                    );
                  })}
                  <circle cx="24" cy="24" r="6" stroke="#141414" strokeWidth="1.6" />
                </svg>
              </div>
              <div className="subcard-title">MT103 Generator</div>
              <p className="subcard-desc">
                Validate mandatory tags (:20:, :23B:, :32A:, :50K:, :59:, :71A:) and save to MySQL.
              </p>
              <button
                type="button"
                className="btn btn-primary full-pill-btn"
                onClick={() => navigate('/create')}
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* 3. Right Review / Compliance Rating Card */}
        <div className="bento-card review-rating-card">
          <div className="review-card-top">
            <div className="subcard-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot dark-pill" />
            </div>
            <button
              type="button"
              className="icon-circle-btn mini-ctrl-btn"
              onClick={() => navigate('/create')}
              title="Create Message"
            >
              ↗
            </button>
          </div>

          <div className="review-card-body">
            <span className="muted-caption">SWIFT FIN Standards</span>
            <h4 className="review-question">
              Ready to build or inspect an MT103 message?
            </h4>
            <p className="review-disclaimer">
              Educational preview mode — formatted with blocks 1 to 4.
            </p>
          </div>

          <div className="tag-Quick-pills">
            {[':20:', ':23B:', ':32A:', ':50K:', ':59:'].map((tag) => (
              <button
                key={tag}
                type="button"
                className="tag-circle-btn"
                onClick={() => navigate('/create')}
                title={`Jump to ${tag} field`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
