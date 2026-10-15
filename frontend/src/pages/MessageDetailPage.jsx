import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessageById } from '../services/messageService';
import toast from 'react-hot-toast';
import './MessageDetailPage.css';

const FORMAT_AMOUNT = (amount, currency) => {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency || ''} ${amount}`;
  }
};

const FORMAT_DATE = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const FORMAT_DATETIME = (dtStr) => {
  if (!dtStr) return '—';
  return new Date(dtStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

function DetailRow({ label, value, mono }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={`detail-value${mono ? ' mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}

function MessageDetailPage() {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMessageById(id);
      if (res.success && res.data) {
        setMessage(res.data);
      } else {
        setError(res.error || 'Message not found');
      }
    } catch (err) {
      if (err.response?.status === 404) setError('Message not found');
      else setError('Unable to load message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCopy = () => {
    if (message?.generatedMessage) {
      navigator.clipboard.writeText(message.generatedMessage);
      toast.success('Message copied to clipboard');
    }
  };

  if (loading) return (
    <div className="loading-overlay"><div className="spinner" /></div>
  );

  if (error) return (
    <div className="detail-page">
      <div className="page-header">
        <Link to="/inquiry" className="back-link">← Back to Inquiry</Link>
      </div>
      <div className="card error-card">
        <div className="error-icon">⚠️</div>
        <h3>{error}</h3>
        <div className="error-actions">
          <button className="btn btn-secondary" onClick={fetchMessage}>Retry</button>
          <Link to="/inquiry" className="btn btn-primary">Back to Inquiry</Link>
        </div>
      </div>
    </div>
  );

  if (!message) return null;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <Link to="/inquiry" className="back-link">← Back to Inquiry</Link>
          <h1 className="page-title" style={{ marginTop: 8 }}>Message Detail</h1>
          <p className="page-subtitle">
            <code className="ref-highlight">{message.messageReference}</code>
            &nbsp;&nbsp;<span className="badge badge-blue">{message.messageType}</span>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleCopy}>
          📋 Copy SWIFT Message
        </button>
      </div>

      <div className="detail-grid">
        {/* Left: Message fields */}
        <div className="card detail-fields">
          <h3 className="section-title">📋 Message Information</h3>
          <DetailRow label="Reference (:20:)" value={message.messageReference} mono />
          <DetailRow label="Message Type" value={message.messageType} />
          <DetailRow label="Bank Op Code (:23B:)" value={message.bankOperationCode} />
          <DetailRow label="Charges (:71A:)" value={message.chargesCode} />

          <h3 className="section-title" style={{ marginTop: 24 }}>💰 Settlement (:32A:)</h3>
          <DetailRow label="Value Date" value={FORMAT_DATE(message.transactionDate)} />
          <DetailRow label="Currency" value={message.currency} />
          <DetailRow label="Amount" value={FORMAT_AMOUNT(message.amount, message.currency)} />

          <h3 className="section-title" style={{ marginTop: 24 }}>🏦 Correspondent BICs</h3>
          <DetailRow label="Sender BIC" value={message.senderBic} mono />
          <DetailRow label="Receiver BIC" value={message.receiverBic} mono />

          <h3 className="section-title" style={{ marginTop: 24 }}>👥 Parties & Remittance</h3>
          <DetailRow label="Ordering (:50K:)" value={message.orderingCustomer} />
          <DetailRow label="Beneficiary (:59:)" value={message.beneficiary} />
          <DetailRow label="Remittance (:70:)" value={message.remittanceInfo} />

          <h3 className="section-title" style={{ marginTop: 24 }}>⏱ Audit Info</h3>
          <DetailRow label="Database ID" value={`#${message.id}`} />
          <DetailRow label="Created By" value={message.createdBy} />
          <DetailRow label="Created Timestamp" value={FORMAT_DATETIME(message.createdAt)} />
        </div>

        {/* Right: Generated message */}
        <div className="card message-text-card">
          <div className="message-text-header">
            <h3 className="section-title" style={{ marginBottom: 0 }}>📨 Generated SWIFT FIN Text</h3>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>📋 Copy</button>
          </div>
          <div className="message-disclaimer">
            ⚠️ Educational preview — not validated for actual SWIFT network transmission
          </div>
          <pre className="message-preview-detail">{message.generatedMessage}</pre>
        </div>
      </div>
    </div>
  );
}

export default MessageDetailPage;
