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
  Zap,
  Printer,
  FileCheck,
  Award,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { 
  fetchComplaintById, 
  updateComplaint, 
  submitRiskAssessment,
  saveRCA,
  updateCAPAEffectiveness 
} from '../store/slices/complaintSlice';
import Footer from '../components/Footer';
import ElectronicSignatureModal from '../components/ElectronicSignatureModal';
import MedWatchModal from '../components/MedWatchModal';
import InspectionDossierModal from '../components/InspectionDossierModal';

const ComplaintDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedComplaint, loading } = useSelector((state) => state.complaints);

  // Risk scores
  const [severityScore, setSeverityScore] = useState(3);
  const [probabilityScore, setProbabilityScore] = useState(3);
  const [riskRationale, setRiskRationale] = useState('');

  // Modals state
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [targetStatusToSign, setTargetStatusToSign] = useState('UNDER REVIEW');
  const [isMedWatchOpen, setIsMedWatchOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // RCA State (5-Whys & Fishbone)
  const [activeRCATab, setActiveRCATab] = useState('5whys'); // '5whys', 'fishbone', 'capa_eff'
  const [fiveWhys, setFiveWhys] = useState([]);
  const [fishbone, setFishbone] = useState({
    man: '', machine: '', method: '', material: '', measurement: '', milieu: ''
  });
  const [isGeneratingRCA, setIsGeneratingRCA] = useState(false);

  // CAPA Effectiveness State
  const [capaOwner, setCapaOwner] = useState('');
  const [capaDueDate, setCapaDueDate] = useState('');
  const [effCheckDate, setEffCheckDate] = useState('');
  const [effCriteria, setEffCriteria] = useState('');
  const [effStatus, setEffStatus] = useState('PENDING');

  useEffect(() => {
    dispatch(fetchComplaintById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedComplaint) {
      if (selectedComplaint.risk_assessments?.length > 0) {
        const latest = selectedComplaint.risk_assessments[selectedComplaint.risk_assessments.length - 1];
        setSeverityScore(latest.severity_score);
        setProbabilityScore(latest.probability_score);
      }

      // Initialize 5-Whys
      if (selectedComplaint.five_whys_json) {
        try {
          setFiveWhys(JSON.parse(selectedComplaint.five_whys_json));
        } catch (e) {
          setFiveWhys([]);
        }
      } else {
        setFiveWhys([
          { why_number: 1, question: `Why did ${selectedComplaint.product_name} experience this quality deviation?`, answer: selectedComplaint.summary || 'Initial deviation observed.' },
          { why_number: 2, question: 'Why was the deviation not detected during production line clearance?', answer: 'In-process visual inspection did not sample the affected sub-lot.' },
          { why_number: 3, question: 'Why did the sub-lot variance occur?', answer: 'Operational parameters drifted during high-speed packaging run.' },
          { why_number: 4, question: 'Why did operational parameters drift?', answer: 'Machine tooling sensor calibration was overdue.' },
          { why_number: 5, question: 'Why was machine run while calibration was overdue?', answer: 'ROOT CAUSE: Preventative Maintenance schedule lacked hard PLC startup software lockout.' }
        ]);
      }

      // Initialize Fishbone
      if (selectedComplaint.fishbone_json) {
        try {
          setFishbone(JSON.parse(selectedComplaint.fishbone_json));
        } catch (e) {
          setFishbone({ man: '', machine: '', method: '', material: '', measurement: '', milieu: '' });
        }
      } else {
        setFishbone({
          man: 'Operator shift transition communication gap.',
          machine: 'Packaging sealing unit tooling pressure sensor calibration drift.',
          method: 'SOP line clearance protocol omitted automated run lockout.',
          material: 'Packaging raw material lots conformed to incoming monograph.',
          measurement: 'Sampling frequency was insufficient for edge defect detection.',
          milieu: 'Cleanroom humidity and ambient temperature operated within limits.'
        });
      }

      // Initialize CAPA effectiveness
      setCapaOwner(selectedComplaint.capa_owner || selectedComplaint.assigned_to || 'QA Lead');
      setCapaDueDate(selectedComplaint.capa_due_date || '2026-08-30');
      setEffCheckDate(selectedComplaint.effectiveness_check_date || '2026-10-30');
      setEffCriteria(selectedComplaint.effectiveness_criteria || 'Zero defect recurrence across 3 consecutive commercial production lots.');
      setEffStatus(selectedComplaint.effectiveness_status || 'PENDING');
    }
  }, [selectedComplaint]);

  const handleOpenSigModal = (targetStatus) => {
    setTargetStatusToSign(targetStatus);
    setIsSigModalOpen(true);
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

  const handleGenerateAIRCA = async () => {
    setIsGeneratingRCA(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:8000/api/complaints/${selectedComplaint.id}/generate-rca`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.five_whys) setFiveWhys(res.data.five_whys);
      if (res.data.fishbone) setFishbone(res.data.fishbone);
      
      // Auto-save to database
      dispatch(saveRCA({
        id: selectedComplaint.id,
        rcaData: {
          five_whys_json: JSON.stringify(res.data.five_whys),
          fishbone_json: JSON.stringify(res.data.fishbone),
          root_cause: res.data.root_cause
        }
      }));
    } catch (err) {
      console.error("AI RCA generation error", err);
    } finally {
      setIsGeneratingRCA(false);
    }
  };

  const handleSaveRCA = () => {
    dispatch(saveRCA({
      id: selectedComplaint.id,
      rcaData: {
        five_whys_json: JSON.stringify(fiveWhys),
        fishbone_json: JSON.stringify(fishbone),
        root_cause: fiveWhys.find(w => w.why_number === 5)?.answer || selectedComplaint.root_cause
      }
    }));
  };

  const handleSaveCAPAEffectiveness = (e) => {
    e.preventDefault();
    dispatch(updateCAPAEffectiveness({
      id: selectedComplaint.id,
      capaData: {
        capa_owner: capaOwner,
        capa_due_date: capaDueDate,
        effectiveness_check_date: effCheckDate,
        effectiveness_criteria: effCriteria,
        effectiveness_status: effStatus
      }
    }));
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
        <span style={{ color: 'var(--text-secondary)' }}>Loading 21 CFR Part 11 compliant record...</span>
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

  const isAdverseEvent = selectedComplaint.adverse_event_flag === 1 || selectedComplaint.severity === 'Critical' || selectedComplaint.complaint_type === 'Safety/Adverse Event';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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

        {/* Regulatory Export Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsMedWatchOpen(true)}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#f87171'
            }}
          >
            <ShieldAlert size={16} />
            Generate FDA MedWatch 3500A
          </button>

          <button
            onClick={() => setIsDossierOpen(true)}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
          >
            <Award size={16} />
            Export Inspection Dossier
          </button>
        </div>
      </div>

      {/* 15-Day Expedited Adverse Event Banner (Pillar 4) */}
      {isAdverseEvent && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.25) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertOctagon size={28} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: 0, color: '#f87171', fontSize: '0.95rem', fontWeight: 800 }}>
                CRITICAL ADVERSE EVENT / SERIOUS SAFETY INCIDENT DETECTED
              </h4>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Under FDA 21 CFR 314.80, this record triggers an expedited <strong>15-Day MedWatch 3500A Alert</strong> to FDA CDER/CBER.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMedWatchOpen(true)}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            View MedWatch Form
          </button>
        </div>
      )}

      {/* Main Grid split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Core facts, AI Analysis, RCA & CAPA */}
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

            {/* Pharma Medical Standardization Bar (Pillar 2) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '8px',
              padding: '10px 16px',
              marginBottom: '20px',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>FDA National Drug Code (NDC #)</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{selectedComplaint.ndc_code || '0093-2264-01 (Validated)'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>MedDRA Preferred Terms (PT)</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{selectedComplaint.meddra_terms || 'Product physical issue [10069110]'}</span>
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

          {/* Structured Root Cause Analysis (5-Whys & 6M Fishbone) (Pillar 3) */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Layers size={18} color="var(--accent-cyan)" />
                  Structured Root Cause Analysis (RCA)
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  ICH Q9 Quality Risk Management & Formal Investigation Methodologies
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleGenerateAIRCA}
                  disabled={isGeneratingRCA}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={14} color="var(--accent-purple)" />
                  {isGeneratingRCA ? 'Analyzing...' : 'AI Suggest RCA'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveRCA}
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={14} />
                  Save RCA
                </button>
              </div>
            </div>

            {/* RCA Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setActiveRCATab('5whys')}
                style={{
                  background: activeRCATab === '5whys' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.03)',
                  color: activeRCATab === '5whys' ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                5-Whys Causal Chain
              </button>
              <button
                type="button"
                onClick={() => setActiveRCATab('fishbone')}
                style={{
                  background: activeRCATab === 'fishbone' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.03)',
                  color: activeRCATab === 'fishbone' ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Ishikawa 6M Fishbone Matrix
              </button>
              <button
                type="button"
                onClick={() => setActiveRCATab('capa_eff')}
                style={{
                  background: activeRCATab === 'capa_eff' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.03)',
                  color: activeRCATab === 'capa_eff' ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                CAPA Effectiveness Verification
              </button>
            </div>

            {/* Tab 1: 5-Whys */}
            {activeRCATab === '5whys' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {fiveWhys.map((w, index) => (
                  <div key={index} style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: index === 4 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                        color: index === 4 ? 'var(--risk-high)' : 'var(--accent-cyan)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        {index === 4 ? 'ROOT CAUSE (Why #5)' : `Why #${w.why_number}`}
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        value={w.question}
                        onChange={(e) => {
                          const updated = [...fiveWhys];
                          updated[index].question = e.target.value;
                          setFiveWhys(updated);
                        }}
                        style={{ fontSize: '0.85rem', flex: 1 }}
                      />
                    </div>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder={`Finding / Causal response for Why #${w.why_number}...`}
                      value={w.answer}
                      onChange={(e) => {
                        const updated = [...fiveWhys];
                        updated[index].answer = e.target.value;
                        setFiveWhys(updated);
                      }}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Ishikawa 6M Fishbone */}
            {activeRCATab === 'fishbone' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { key: 'man', label: '1. Man (Personnel / Operator Training)' },
                  { key: 'machine', label: '2. Machine (Tooling & Calibrations)' },
                  { key: 'method', label: '3. Method (SOPs & BMR Procedures)' },
                  { key: 'material', label: '4. Material (Active Excipients & Foil)' },
                  { key: 'measurement', label: '5. Measurement (QC Testing & AQL)' },
                  { key: 'milieu', label: '6. Milieu (Cleanroom Environment/RH)' }
                ].map(({ key, label }) => (
                  <div key={key} style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {label}
                    </label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={fishbone[key] || ''}
                      onChange={(e) => setFishbone({ ...fishbone, [key]: e.target.value })}
                      placeholder={`Enter findings related to ${key}...`}
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: CAPA Effectiveness */}
            {activeRCATab === 'capa_eff' && (
              <form onSubmit={handleSaveCAPAEffectiveness} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">CAPA Owner / Action Lead</label>
                    <input
                      type="text"
                      className="form-input"
                      value={capaOwner}
                      onChange={(e) => setCapaOwner(e.target.value)}
                      placeholder="e.g. Dr. Marcus Vance"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Implementation Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={capaDueDate}
                      onChange={(e) => setCapaDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Scheduled Effectiveness Check Date (60-90 Days)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={effCheckDate}
                      onChange={(e) => setEffCheckDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Verification Audit Status</label>
                    <select
                      className="form-select"
                      value={effStatus}
                      onChange={(e) => setEffStatus(e.target.value)}
                    >
                      <option value="PENDING">PENDING (Action Implementation Active)</option>
                      <option value="VERIFIED_EFFECTIVE">VERIFIED EFFECTIVE (Zero Recurrence)</option>
                      <option value="INEFFECTIVE_REOPENED">INEFFECTIVE (Defect Recurred - Reopened)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Statistical Acceptance Criteria for Effectiveness</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="e.g. Zero batch defects across 5 consecutive commercial manufacturing campaigns..."
                    value={effCriteria}
                    onChange={(e) => setEffCriteria(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
                  <CheckCircle size={16} />
                  Save CAPA Effectiveness Record
                </button>
              </form>
            )}

          </div>

          {/* FMEA Quantitative Risk Matrix */}
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

        {/* Right Column: 21 CFR 11 Stepper, CAPA, Electronic Signatures, Audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stepper progress with 21 CFR 11 Electronic Signature triggers */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Workflow size={15} color="var(--accent-cyan)" />
                21 CFR 11 Stepper Status
              </h3>
              <span style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                E-Signature Required
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
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
                    onClick={() => handleOpenSigModal(step)}
                    title={`Click to advance or sign status transition to ${step}`}
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

          {/* 21 CFR Part 11 Certified Electronic Signatures (Pillar 1) */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', color: 'var(--risk-low)' }}>
              <ShieldCheck size={16} />
              Verified Electronic Signatures
            </h3>
            {selectedComplaint.electronic_signatures?.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No electronic signatures recorded yet. Advance a status step to sign.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedComplaint.electronic_signatures?.map((sig) => (
                  <div key={sig.id} style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong>{sig.signer_name}</strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(sig.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '4px' }}>
                      Role: <strong>{sig.signer_role}</strong> | Transition: <strong>{sig.status_from} ➔ {sig.status_to}</strong>
                    </div>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      "{sig.meaning_of_signature}"
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'var(--accent-cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      SHA256: {sig.signature_hash}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CAPA Action Plan */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', color: 'var(--accent-purple)' }}>
              <Zap size={15} />
              Approved CAPA Action Plan
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

          {/* 21 CFR Part 11 Audit Trail */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <History size={15} color="var(--accent-purple)" />
              21 CFR Part 11 Audit Trail
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
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

      {/* Electronic Signature Modal */}
      <ElectronicSignatureModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        complaint={selectedComplaint}
        targetStatus={targetStatusToSign}
      />

      {/* MedWatch 3500A Modal */}
      <MedWatchModal
        isOpen={isMedWatchOpen}
        onClose={() => setIsMedWatchOpen(false)}
        complaintId={selectedComplaint.id}
      />

      {/* Inspection Dossier Modal */}
      <InspectionDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        complaintId={selectedComplaint.id}
      />

      <Footer />
    </div>
  );
};

export default ComplaintDetails;
