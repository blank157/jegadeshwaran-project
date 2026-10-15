import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getMessages } from '../services/messageService';
import './MessageInquiryPage.css';

const FORMAT_DATE = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const FORMAT_DATETIME = (dtStr) => {
  if (!dtStr) return '—';
  const d = new Date(dtStr);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const FORMAT_NUMBER = (amount) => {
  if (amount == null) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

function MessageInquiryPage() {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    reference: initialRef,
    messageType: '',
    fromDate: '',
    toDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    reference: initialRef,
    messageType: '',
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    const refFromUrl = searchParams.get('ref') || '';
    setFilters((prev) => ({ ...prev, reference: refFromUrl }));
    setAppliedFilters((prev) => ({ ...prev, reference: refFromUrl }));
  }, [searchParams]);

  const fetchMessages = useCallback(
    async (page = 0, filterParams = appliedFilters) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, size: pagination.size };
        if (filterParams.reference) params.reference = filterParams.reference.trim();
        if (filterParams.messageType) params.messageType = filterParams.messageType;
        if (filterParams.fromDate) params.fromDate = filterParams.fromDate;
        if (filterParams.toDate) params.toDate = filterParams.toDate;
        const res = await getMessages(params);
        if (res.success && res.data) {
          setMessages(res.data.content || []);
          setPagination((prev) => ({
            ...prev,
            page: res.data.page,
            totalElements: res.data.totalElements,
            totalPages: res.data.totalPages,
          }));
        } else {
          setError(res.error || 'Failed to load messages');
        }
      } catch (err) {
        setError('Unable to connect to server. Please check the backend is running.');
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters, pagination.size]
  );

  useEffect(() => {
    fetchMessages(0, appliedFilters);
  }, [appliedFilters, fetchMessages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    const empty = { reference: '', messageType: '', fromDate: '', toDate: '' };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const handlePageChange = (newPage) => {
    fetchMessages(newPage, appliedFilters);
  };

  return (
    <div className="inquiry-page">
      <div className="page-header">
        <h1 className="page-title">Message Inquiry</h1>
        <p className="page-subtitle">Search, filter, and inspect saved SWIFT MT messages</p>
      </div>

      {/* Search filters */}
      <div className="card filter-card">
        <form onSubmit={handleSearch}>
          <div className="filter-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="reference">
                Message Reference (:20:)
              </label>
              <input
                id="reference"
                className="form-control"
                placeholder="Search by reference..."
                value={filters.reference}
                onChange={(e) => setFilters((p) => ({ ...p, reference: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="messageType">
                Message Type
              </label>
              <select
                id="messageType"
                className="form-control"
                value={filters.messageType}
                onChange={(e) => setFilters((p) => ({ ...p, messageType: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="MT103">MT103</option>
                <option value="MT202">MT202</option>
                <option value="MT700">MT700</option>
                <option value="MT910">MT910</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fromDate">
                Value Date From
              </label>
              <input
                id="fromDate"
                type="date"
                className="form-control"
                value={filters.fromDate}
                onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="toDate">
                Value Date To
              </label>
              <input
                id="toDate"
                type="date"
                className="form-control"
                value={filters.toDate}
                onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
              ↺ Reset Filters
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Search Messages →
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="card results-card">
        <div className="results-header">
          <h3 className="results-title">
            {loading
              ? 'Searching...'
              : `${pagination.totalElements} message${pagination.totalElements !== 1 ? 's' : ''} found`}
          </h3>
          <span className="pill-select-badge">MySQL Store • Live</span>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
            <button className="retry-btn" onClick={() => fetchMessages(pagination.page)}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        ) : messages.length === 0 && !error ? (
          <div className="empty-state">
            <div className="icon">📨</div>
            <p>No messages found</p>
            <small>Try adjusting your search filters or create a new SWIFT message.</small>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Reference (:20:)</th>
                    <th>Type</th>
                    <th>Value Date</th>
                    <th>Settled Amount (:32A:)</th>
                    <th>Sender BIC</th>
                    <th>Receiver BIC</th>
                    <th>Charges</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id}>
                      <td>
                        <code className="ref-code">{msg.messageReference}</code>
                      </td>
                      <td>
                        <span className="badge badge-coral">{msg.messageType}</span>
                      </td>
                      <td>{FORMAT_DATE(msg.transactionDate)}</td>
                      <td className="amount-cell">
                        <span className="currency-symbol">{msg.currency}</span>{' '}
                        {FORMAT_NUMBER(msg.amount)}
                      </td>
                      <td>
                        <code className="bic-code">{msg.senderBic}</code>
                      </td>
                      <td>
                        <code className="bic-code">{msg.receiverBic}</code>
                      </td>
                      <td>
                        <span className="pill-select-badge">{msg.chargesCode}</span>
                      </td>
                      <td className="date-cell">{FORMAT_DATETIME(msg.createdAt)}</td>
                      <td>
                        <Link to={`/inquiry/${msg.id}`} className="btn btn-dark btn-sm">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={pagination.page === 0}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  ← Prev
                </button>
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const p = pagination.page < 3 ? i : pagination.page - 2 + i;
                    if (p >= pagination.totalPages) return null;
                    return (
                      <button
                        key={p}
                        className={`page-btn ${p === pagination.page ? 'active' : ''}`}
                        onClick={() => handlePageChange(p)}
                      >
                        {p + 1}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="page-btn"
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next →
                </button>
                <span className="page-info">
                  Page {pagination.page + 1} of {pagination.totalPages} &middot;{' '}
                  {pagination.totalElements} total
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MessageInquiryPage;
