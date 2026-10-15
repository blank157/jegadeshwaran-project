import React, { useState } from 'react';
import { previewMessage, saveMessage } from '../services/messageService';
import toast from 'react-hot-toast';
import './CreateMessagePage.css';

const INITIAL_FORM = {
  messageType: 'MT103',
  messageReference: '',
  bankOperationCode: 'CRED',
  transactionDate: new Date().toISOString().split('T')[0],
  currency: 'USD',
  amount: '',
  orderingCustomer: '',
  beneficiary: '',
  remittanceInfo: '',
  chargesCode: 'SHA',
  senderBic: '',
  receiverBic: '',
};

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'SGD', 'HKD',
  'INR', 'AED', 'SAR', 'NOK', 'SEK', 'DKK', 'NZD', 'MXN', 'BRL', 'ZAR'
];

function FormField({ label, name, required, error, children }) {
  return (
    <div className="form-group">
      <label className={`form-label${required ? ' required' : ''}`} htmlFor={name}>{label}</label>
      {children}
      {error && <span className="form-error">⚠️ {error}</span>}
    </div>
  );
}

function CreateMessagePage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [previewText, setPreviewText] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'preview'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.messageReference.trim()) errs.messageReference = 'Message reference is required';
    else if (form.messageReference.length > 16) errs.messageReference = 'Max 16 characters allowed';
    else if (!/^[A-Za-z0-9/\-?:().,'+ ]{1,16}$/.test(form.messageReference)) {
      errs.messageReference = 'Contains unsupported SWIFT characters';
    }

    if (!form.transactionDate) errs.transactionDate = 'Value date is required';
    else {
      const date = new Date(form.transactionDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (date < thirtyDaysAgo) errs.transactionDate = 'Date cannot be more than 30 days in the past';
    }

    if (!form.amount) errs.amount = 'Amount is required';
    else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      errs.amount = 'Amount must be greater than 0';
    }

    if (!form.orderingCustomer.trim()) errs.orderingCustomer = 'Ordering customer (:50K:) is required';
    else if (form.orderingCustomer.length > 140) errs.orderingCustomer = 'Max 140 characters allowed';

    if (!form.beneficiary.trim()) errs.beneficiary = 'Beneficiary (:59:) is required';
    else if (form.beneficiary.length > 140) errs.beneficiary = 'Max 140 characters allowed';

    if (form.remittanceInfo && form.remittanceInfo.length > 140) {
      errs.remittanceInfo = 'Max 140 characters allowed';
    }

    const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    const cleanSenderBic = form.senderBic.trim().toUpperCase();
    const cleanReceiverBic = form.receiverBic.trim().toUpperCase();

    if (!cleanSenderBic) errs.senderBic = 'Sender BIC is required';
    else if (!bicRegex.test(cleanSenderBic)) {
      errs.senderBic = 'Invalid BIC format (8 or 11 chars, e.g. DEUTDEDB or DEUTDEDBXXX)';
    }

    if (!cleanReceiverBic) errs.receiverBic = 'Receiver BIC is required';
    else if (!bicRegex.test(cleanReceiverBic)) {
      errs.receiverBic = 'Invalid BIC format (8 or 11 chars, e.g. CHASUS33 or CHASUS33XXX)';
    }

    return errs;
  };

  const buildPayload = () => ({
    ...form,
    senderBic: form.senderBic.trim().toUpperCase(),
    receiverBic: form.receiverBic.trim().toUpperCase(),
    amount: parseFloat(form.amount),
  });

  const handlePreview = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix validation errors before generating preview');
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await previewMessage(buildPayload());
      if (res.success) {
        setPreviewText(res.data);
        setStep('preview');
        toast.success('MT103 preview generated');
      } else {
        toast.error(res.error || 'Preview generation failed');
      }
    } catch (err) {
      const apiData = err.response?.data;
      if (apiData?.data && typeof apiData.data === 'object') {
        setErrors(apiData.data);
      }
      toast.error(apiData?.error || 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await saveMessage(buildPayload());
      if (res.success) {
        toast.success('SWIFT MT103 message saved to database!');
        setForm({
          ...INITIAL_FORM,
          transactionDate: new Date().toISOString().split('T')[0],
        });
        setPreviewText(null);
        setStep('form');
      } else {
        toast.error(res.error || 'Failed to save message');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save message');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCopy = () => {
    if (previewText) {
      navigator.clipboard.writeText(previewText);
      toast.success('SWIFT message copied to clipboard');
    }
  };

  const handleEdit = () => {
    setStep('form');
  };

  const handleRegenerate = async () => {
    setPreviewLoading(true);
    try {
      const res = await previewMessage(buildPayload());
      if (res.success) {
        setPreviewText(res.data);
        toast.success('Message regenerated');
      } else {
        toast.error(res.error || 'Regeneration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to regenerate message');
    } finally {
      setPreviewLoading(false);
    }
  };

  const fillDemoData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setForm({
      messageType: 'MT103',
      messageReference: `REF2026${randomSuffix}`,
      bankOperationCode: 'CRED',
      transactionDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
      amount: '25000.00',
      orderingCustomer: '/DE89370400440532013000\nGLOBAL TECH GMBH\nFRIEDRICHSTRASSE 100\nBERLIN GERMANY',
      beneficiary: '/US33CHAS0002012345678901\nAPEX SOLUTIONS INC\n350 FIFTH AVENUE\nNEW YORK US',
      remittanceInfo: `INVOICE INV-${randomSuffix} SETTLEMENT`,
      chargesCode: 'SHA',
      senderBic: 'DEUTDEDB',
      receiverBic: 'CHASUS33',
    });
    setErrors({});
    toast.success('Sample MT103 fields populated');
  };

  return (
    <div className="create-page">
      <div className="page-header create-header-row">
        <div>
          <h1 className="page-title">Create SWIFT Message</h1>
          <p className="page-subtitle">Generate an MT103 Single Customer Credit Transfer message</p>
        </div>
        {step === 'form' && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={fillDemoData}>
            ✨ Fill Sample Data
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        <div className={`step-item ${step === 'form' ? 'active' : 'done'}`}>
          <span className="step-num">1</span>
          <span className="step-label">Enter MT103 Fields</span>
        </div>
        <div className="step-line" />
        <div className={`step-item ${step === 'preview' ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">Review & Save</span>
        </div>
      </div>

      {step === 'form' && (
        <div className="card form-card">
          <div className="form-section">
            <h3 className="form-section-title">🏦 Header & Reference</h3>
            <div className="form-grid form-grid-3">
              <FormField label="Message Type" name="messageType" required>
                <select name="messageType" id="messageType" className="form-control"
                  value={form.messageType} onChange={handleChange}>
                  <option value="MT103">MT103 — Customer Credit Transfer</option>
                </select>
              </FormField>
              <FormField label="Sender's Reference (:20:)" name="messageReference" required error={errors.messageReference}>
                <input id="messageReference" name="messageReference"
                  className={`form-control ${errors.messageReference ? 'error' : ''}`}
                  placeholder="e.g. REF20261012001" maxLength={16}
                  value={form.messageReference} onChange={handleChange} />
              </FormField>
              <FormField label="Bank Operation Code (:23B:)" name="bankOperationCode" required>
                <select name="bankOperationCode" id="bankOperationCode" className="form-control"
                  value={form.bankOperationCode} onChange={handleChange}>
                  <option value="CRED">CRED — Normal Credit Transfer</option>
                  <option value="CRTS">CRTS — Test Message</option>
                  <option value="SPAY">SPAY — SWIFTPay</option>
                  <option value="SPRI">SPRI — Priority</option>
                  <option value="SSTD">SSTD — Standard</option>
                </select>
              </FormField>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">🏦 Correspondent BIC Codes (Blocks 1 & 2)</h3>
            <div className="form-grid">
              <FormField label="Sender BIC" name="senderBic" required error={errors.senderBic}>
                <input id="senderBic" name="senderBic"
                  className={`form-control ${errors.senderBic ? 'error' : ''}`}
                  placeholder="e.g. DEUTDEDB or DEUTDEDBXXX" maxLength={11}
                  value={form.senderBic} onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                  onBlur={(e) => setForm(p => ({ ...p, senderBic: e.target.value.toUpperCase() }))} />
              </FormField>
              <FormField label="Receiver BIC" name="receiverBic" required error={errors.receiverBic}>
                <input id="receiverBic" name="receiverBic"
                  className={`form-control ${errors.receiverBic ? 'error' : ''}`}
                  placeholder="e.g. CHASUS33 or CHASUS33XXX" maxLength={11}
                  value={form.receiverBic} onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                  onBlur={(e) => setForm(p => ({ ...p, receiverBic: e.target.value.toUpperCase() }))} />
              </FormField>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">💰 Value Date, Currency & Interbank Settled Amount (:32A:)</h3>
            <div className="form-grid form-grid-3">
              <FormField label="Value Date" name="transactionDate" required error={errors.transactionDate}>
                <input id="transactionDate" name="transactionDate" type="date"
                  className={`form-control ${errors.transactionDate ? 'error' : ''}`}
                  value={form.transactionDate} onChange={handleChange} />
              </FormField>
              <FormField label="Currency" name="currency" required>
                <select name="currency" id="currency" className="form-control"
                  value={form.currency} onChange={handleChange}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Amount" name="amount" required error={errors.amount}>
                <input id="amount" name="amount" type="number" step="0.01" min="0.01"
                  className={`form-control ${errors.amount ? 'error' : ''}`}
                  placeholder="e.g. 15000.00"
                  value={form.amount} onChange={handleChange} />
              </FormField>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">👥 Customer & Remittance Fields</h3>
            <div className="form-stack">
              <FormField label="Ordering Customer (:50K:)" name="orderingCustomer" required error={errors.orderingCustomer}>
                <textarea id="orderingCustomer" name="orderingCustomer" rows={3}
                  className={`form-control ${errors.orderingCustomer ? 'error' : ''}`}
                  placeholder={"/Account Number\nFull Name\nAddress Line\nCity Country"}
                  value={form.orderingCustomer} onChange={handleChange} />
                <small className="char-count">{form.orderingCustomer.length}/140</small>
              </FormField>
              <FormField label="Beneficiary Customer (:59:)" name="beneficiary" required error={errors.beneficiary}>
                <textarea id="beneficiary" name="beneficiary" rows={3}
                  className={`form-control ${errors.beneficiary ? 'error' : ''}`}
                  placeholder={"/Account Number\nBeneficiary Name\nAddress Line\nCity Country"}
                  value={form.beneficiary} onChange={handleChange} />
                <small className="char-count">{form.beneficiary.length}/140</small>
              </FormField>
              <FormField label="Remittance Information (:70:)" name="remittanceInfo" error={errors.remittanceInfo}>
                <input id="remittanceInfo" name="remittanceInfo"
                  className={`form-control ${errors.remittanceInfo ? 'error' : ''}`}
                  placeholder="e.g. INVOICE INV-2026-001 PAYMENT" maxLength={140}
                  value={form.remittanceInfo} onChange={handleChange} />
                <small className="char-count">{form.remittanceInfo.length}/140</small>
              </FormField>
              <FormField label="Details of Charges (:71A:)" name="chargesCode" required>
                <div className="radio-group">
                  {[
                    ['SHA', 'SHA — Shared Charges (Default)'],
                    ['OUR', 'OUR — Ordering Customer Pays All'],
                    ['BEN', 'BEN — Beneficiary Pays All']
                  ].map(([val, label]) => (
                    <label key={val} className={`radio-option ${form.chargesCode === val ? 'selected' : ''}`}>
                      <input type="radio" name="chargesCode" value={val}
                        checked={form.chargesCode === val} onChange={handleChange} />
                      {label}
                    </label>
                  ))}
                </div>
              </FormField>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary"
              onClick={() => { setForm(INITIAL_FORM); setErrors({}); }}>
              🗑️ Clear Form
            </button>
            <button type="button" className="btn btn-primary" onClick={handlePreview} disabled={previewLoading}>
              {previewLoading ? 'Generating Preview...' : '👁️ Generate SWIFT Preview'}
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && previewText && (
        <div className="preview-section">
          <div className="card preview-card">
            <div className="preview-header">
              <div>
                <h3 className="preview-title">Generated SWIFT MT103 Message</h3>
                <p className="preview-sub">Formatted by backend MT103 generator service</p>
              </div>
              <span className="badge badge-yellow">Educational Preview</span>
            </div>
            <div className="preview-disclaimer">
              ⚠️ Educational Message Preview — Not validated for live SWIFT FIN network transmission.
            </div>
            <pre className="message-preview" readOnly>{previewText}</pre>
          </div>

          <div className="preview-actions card">
            <h4>Message Actions</h4>
            <div className="action-buttons">
              <button type="button" className="btn btn-secondary" onClick={handleCopy}>
                📋 Copy Text
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleEdit}>
                ✏️ Edit Fields
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleRegenerate} disabled={previewLoading}>
                {previewLoading ? 'Regenerating...' : '🔄 Regenerate'}
              </button>
              <button type="button" className="btn btn-success" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? 'Saving...' : '💾 Save to Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateMessagePage;
