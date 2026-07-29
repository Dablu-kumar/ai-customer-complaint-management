import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  FileText, 
  ShieldAlert, 
  Clock, 
  Workflow, 
  History, 
  CornerDownRight, 
  CheckCircle,
  Download,
  AlertOctagon,
  Calendar,
  Globe,
  Settings as SettingsIcon,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { fetchComplaintById, updateComplaint, submitRiskAssessment } from '../store/slices/complaintSlice';
import Footer from '../components/Footer';

const ComplaintDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedComplaint, loading } = useSelector((state) => state.complaints);

  const [severityScore, setSeverityScore] = useState(3);
  const [probabilityScore, setProbabilityScore] = useState(3);
  const [riskRationale, setRiskRationale] = useState('');

  useEffect(() => {
    dispatch(fetchComplaintById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedComplaint && selectedComplaint.risk_assessments?.length > 0) {
      const latest = selectedComplaint.risk_assessments[selectedComplaint.risk_assessments.length - 1];
      setSeverityScore(latest.severity_score);
      setProbabilityScore(latest.probability_score);
    }
  }, [selectedComplaint]);

  const handleStatusClick = (nextStatus) => {
    dispatch(updateComplaint({ id: selectedComplaint.id, updateData: { status: nextStatus } }));
  };

  const handleRiskSubmit = (e) => {
    e.preventDefault();
    dispatch(submitRiskAssessment({
      id: selectedComplaint.id,
      riskData: {
        severity_score: parseInt(severityScore),
        probability_score: parseInt(probabilityScore),
        rationale: riskRationale
      }
    })).then(() => {
      setRiskRationale('');
    });
  };

  if (loading && !selectedComplaint) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTop: '4px solid var(--accent-cyan)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading investigation record...</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!selectedComplaint) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Complaint record not found</h3>
        <Link to="/complaints" className="btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Back to Registry
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/complaints" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <ArrowLeft size={16} />
          Back to Complaint Registry
        </Link>
      </div>

      {/* Main Grid split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Complaint core facts & AI analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fact card */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'monospace', fontWeight: 600 }}>CASE FILE RECORD #{selectedComplaint.id}</span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 0 0' }}>{selectedComplaint.product_name}</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manufacturer: <strong>{selectedComplaint.company_name || 'N/A'}</strong></p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`badge badge-risk-${selectedComplaint.severity.toLowerCase() === 'critical' ? 'high' : (selectedComplaint.severity.toLowerCase() === 'major' ? 'medium' : 'low')}`}>
                  {selectedComplaint.severity} Severity
                </span>
                <span className={`badge badge-risk-${selectedComplaint.risk_level.toLowerCase()}`}>
                  {selectedComplaint.risk_level} Risk
                </span>
              </div>
            </div>

            {/* QMS Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              fontSize: '0.9rem',
              marginBottom: '28px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Batch Number</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{selectedComplaint.batch_number}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Reporter / Customer</span>
                <strong>{selectedComplaint.customer_name || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Incident Date</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>{selectedComplaint.complaint_date || new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Region / Country</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Globe size={14} color="var(--text-muted)" />
                  <span>{selectedComplaint.country || 'United States'}</span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              fontSize: '0.9rem',
              borderTop: '1px solid rgba(255,255,255,0.03)',
              paddingTop: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Mfg Date</span>
                <span>{selectedComplaint.mfg_date || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Expiry Date</span>
                <span>{selectedComplaint.exp_date || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Assigned Quality Dept</span>
                <span>{selectedComplaint.recommended_department || 'Manufacturing QA'}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '20px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Complaint Narrative Description</span>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                {selectedComplaint.description}
              </p>
            </div>
          </div>

          {/* AI Investigation Card */}
          <div className="glass-panel" style={{ padding: '32px', background: 'rgba(168, 85, 247, 0.02)', borderColor: 'rgba(168, 85, 247, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', margin: 0 }}>
                <Brain size={18} />
                AI Copilot Co-Pilot analysis
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  Extract: {selectedComplaint.extraction_confidence || 99}%
                </span>
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--risk-low)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  Risk: {selectedComplaint.risk_confidence || 96}%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>AI Extracted Summary:</strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selectedComplaint.summary}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>AI Suggested Root Cause:</strong>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                    "{selectedComplaint.root_cause || 'Analyzing machine records...'}"
                  </p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>AI suggested Investigation Checklist:</strong>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {selectedComplaint.suggested_investigation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FMEA Risk Assessment */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <ShieldAlert size={18} color="var(--accent-cyan)" />
              FMEA Quantitative Risk Matrix
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <form onSubmit={handleRiskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Severity Score (1-5)</label>
                    <select className="form-select" value={severityScore} onChange={(e) => setSeverityScore(e.target.value)}>
                      <option value="1">1 - Negligible (Cosmetic Packaging)</option>
                      <option value="2">2 - Minor (Minor packaging damage)</option>
                      <option value="3">3 - Moderate (Product defect, no safety hazard)</option>
                      <option value="4">4 - Major (Inefficacy, potential batch error)</option>
                      <option value="5">5 - Critical (Adverse Safety incident / Death)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Probability Score (1-5)</label>
                    <select className="form-select" value={probabilityScore} onChange={(e) => setProbabilityScore(e.target.value)}>
                      <option value="1">1 - Remote (Extremely unlikely)</option>
                      <option value="2">2 - Low (Occasional reports)</option>
                      <option value="3">3 - Medium (Moderate recurrence)</option>
                      <option value="4">4 - High (Frequent batch issues)</option>
                      <option value="5">5 - Frequent (Regular occurrences)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Rationale Justification</label>
                    <textarea 
                      className="form-input" 
                      rows={2} 
                      placeholder="QA justification statement for FMEA risk ratings..."
                      value={riskRationale}
                      onChange={(e) => setRiskRationale(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Re-calculate Risk RPN
                  </button>
                </form>
              </div>

              {/* RPN Display */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Priority Number (RPN)</span>
                <h2 style={{ fontSize: '3.4rem', fontWeight: 900, margin: '8px 0', color: (severityScore * probabilityScore) >= 15 ? 'var(--risk-high)' : ((severityScore * probabilityScore) >= 8 ? 'var(--risk-medium)' : 'var(--risk-low)') }}>
                  {severityScore * probabilityScore}
                </h2>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: (severityScore * probabilityScore) >= 15 ? 'rgba(244,63,94,0.1)' : ((severityScore * probabilityScore) >= 8 ? 'rgba(251,191,36,0.1)' : 'rgba(16,185,129,0.1)'),
                  color: (severityScore * probabilityScore) >= 15 ? 'var(--risk-high)' : ((severityScore * probabilityScore) >= 8 ? 'var(--risk-medium)' : 'var(--risk-low)'),
                  fontWeight: 700
                }}>
                  {(severityScore * probabilityScore) >= 15 ? 'HIGH RISK ACTION REQUIRED' : ((severityScore * probabilityScore) >= 8 ? 'MEDIUM RISK MONITORING' : 'LOW RISK ACCEPTABLE')}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: QMS Stepper, CAPA plans, attachments, history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stepper progress */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
              <Workflow size={15} color="var(--accent-cyan)" />
              QMS Stepper Status
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              {/* Stepper bar vertical */}
              <div style={{
                position: 'absolute',
                top: '12px', left: '11px', bottom: '12px',
                width: '2px',
                background: 'rgba(255,255,255,0.05)',
                zIndex: 0
              }} />

              {["OPEN", "UNDER REVIEW", "INVESTIGATION", "CAPA", "VERIFICATION", "CLOSED"].map((step, idx, arr) => {
                const isActive = selectedComplaint.status === step;
                const isPassed = arr.indexOf(selectedComplaint.status) >= idx;
                return (
                  <button
                    key={step}
                    onClick={() => handleStatusClick(step)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      zIndex: 2,
                      width: '100%',
                      padding: '4px 0',
                      textAlign: 'left',
                      outline: 'none'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'var(--bg-primary)' : (isPassed ? 'var(--accent-cyan)' : 'var(--bg-secondary)'),
                      border: isPassed ? '2px solid var(--accent-cyan)' : '2px solid rgba(255,255,255,0.1)',
                      boxShadow: isActive ? '0 0 10px var(--accent-cyan)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isPassed && !isActive && <CheckCircle size={12} color="var(--accent-cyan)" />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isActive ? 'var(--accent-cyan)' : (isPassed ? 'var(--text-primary)' : 'var(--text-muted)')
                      }}>{step}</span>
                      {isActive && <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)' }}>Current milestone step</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CAPA Recommendation */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', color: 'var(--accent-purple)' }}>
              <Zap size={15} />
              Approved CAPA action items
            </h3>
            <div style={{
              fontSize: '0.85rem',
              lineHeight: '1.5',
              color: 'var(--text-secondary)',
              background: 'rgba(255,255,255,0.01)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              whiteSpace: 'pre-line'
            }}>
              {selectedComplaint.capa || 'No CAPA plan assigned yet.'}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <FileText size={15} color="var(--accent-cyan)" />
              Original Attachments
            </h3>
            {selectedComplaint.documents?.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No attachments uploaded.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedComplaint.documents?.map((doc) => (
                  <div key={doc.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{doc.file_name}</span>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline Audit Logs */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <History size={15} color="var(--accent-purple)" />
              21 CFR Part 11 Audit Trail
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              {selectedComplaint.audit_logs?.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                  <CornerDownRight size={10} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div>
                      <strong>{log.action}</strong> <span style={{ color: 'var(--text-muted)' }}>by {log.user_name || 'System'}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3', margin: 0 }}>{log.description}</p>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default ComplaintDetails;
