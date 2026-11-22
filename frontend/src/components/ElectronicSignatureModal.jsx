import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Lock, AlertTriangle, Key, X } from 'lucide-react';
import { signStatusTransition } from '../store/slices/complaintSlice';

const MEANING_OPTIONS = {
  "UNDER REVIEW": [
    "I certify that I have conducted initial intake verification and routed for clinical review.",
    "I confirm preliminary risk classification is appropriate under current SOP."
  ],
  "INVESTIGATION": [
    "I authorize formal laboratory and batch production record investigation.",
    "I confirm retention samples and manufacturing logs are quarantined for review."
  ],
  "CAPA": [
    "I authorize the implementation of the specified Corrective and Preventive Actions (CAPA).",
    "I confirm root cause analysis has been validated by Quality Assurance."
  ],
  "VERIFICATION": [
    "I confirm CAPA implementation has commenced and is pending effectiveness verification.",
    "I certify that batch quarantine controls remain active during verification."
  ],
  "CLOSED": [
    "I officially certify closure of this complaint under cGMP and FDA 21 CFR Part 11 guidelines. CAPA verified effective.",
    "I confirm all regulatory reporting obligations (FDA MedWatch 3500A / EudraVigilance) are fulfilled."
  ],
  "OPEN": [
    "I certify re-opening of this complaint file for supplementary investigation."
  ]
};

const ElectronicSignatureModal = ({ isOpen, onClose, complaint, targetStatus }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [password, setPassword] = useState('');
  const [meaning, setMeaning] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = MEANING_OPTIONS[targetStatus] || [
    `I certify and authorize transition of complaint status to ${targetStatus}.`
  ];

  // Set default meaning when targetStatus changes
  React.useEffect(() => {
    if (options.length > 0) {
      setMeaning(options[0]);
    }
  }, [targetStatus]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    try {
      const res = await dispatch(signStatusTransition({
        id: complaint.id,
        signData: {
          password,
          meaning_of_signature: meaning,
          target_status: targetStatus,
          notes
        }
      }));

      if (res.meta.requestStatus === 'fulfilled') {
        setPassword('');
        setNotes('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.12)',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid rgba(6, 182, 212, 0.25)'
          }}>
            <ShieldCheck size={28} color="var(--accent-cyan)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              21 CFR Part 11 Electronic Signature
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              FDA Legal Electronic Record Affirmation
            </span>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div style={{
          background: 'rgba(251, 191, 36, 0.08)',
          border: '1px solid rgba(251, 191, 36, 0.25)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.8rem',
          color: 'var(--status-ui)',
          lineHeight: '1.4',
          marginBottom: '20px'
        }}>
          <strong>Legal Notice:</strong> Under US FDA 21 CFR Part 11.200 and EU Annex 11, entering your password confirms that this electronic signature is the legally binding equivalent of your handwritten signature.
        </div>

        {/* Transition Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.02)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-glass)',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Current Status</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{complaint.status}</strong>
          </div>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>➔</span>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Target Status</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>{targetStatus}</strong>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Signer Identity & Role</label>
            <input
              type="text"
              className="form-input"
              value={`${user?.full_name || user?.username || 'Authorized User'} (${user?.role || 'QualityAssurance'})`}
              disabled
              style={{ opacity: 0.8, cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label className="form-label">Meaning / Legal Reason for Signing</label>
            <select
              className="form-select"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
            >
              {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Re-authenticate User Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your system password to authorize"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div>
            <label className="form-label">Audit Justification Notes (Optional)</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Provide reason for this status change or specific batch findings..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !password}
              style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
            >
              <ShieldCheck size={18} />
              {isSubmitting ? 'Verifying & Signing...' : 'Affirm Electronic Signature'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '12px 20px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ElectronicSignatureModal;
