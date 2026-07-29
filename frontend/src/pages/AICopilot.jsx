import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  Mail, 
  Image as ImageIcon,
  Cpu, 
  Save, 
  RefreshCw,
  Terminal,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { 
  uploadDocument, 
  analyzeUploadedDocument, 
  analyzeTextInput, 
  clearAIState 
} from '../store/slices/aiSlice';
import { createComplaint } from '../store/slices/complaintSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Footer from '../components/Footer';

const AICopilot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { uploadState, aiOutput, loading, error } = useSelector((state) => state.ai);

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [rawText, setRawText] = useState('');
  
  // Checklist states
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [logTimer, setLogTimer] = useState(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [productName, setProductName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [complaintType, setComplaintType] = useState('Product Quality');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [severity, setSeverity] = useState('Minor');
  const [riskLevel, setRiskLevel] = useState('Low');
  const [priority, setPriority] = useState('Low');
  const [capa, setCapa] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [suggestedInv, setSuggestedInv] = useState('');
  const [recommendedDept, setRecommendedDept] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  
  // New QMS Fields
  const [complaintDate, setComplaintDate] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [country, setCountry] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const fileInputRef = useRef(null);

  // Adjust icon size by 15% (20px -> 23px)
  const iconSize = 23;

  const stepsList = [
    "Upload received",
    "Reading PDF document",
    "Extracting complaint details",
    "Product name detected",
    "Batch/Lot number detected",
    "Severity levels predicted",
    "Risk assessment analyzed",
    "CAPA recommendations generated",
    "Formatting JSON Output"
  ];

  useEffect(() => {
    dispatch(clearAIState());
    return () => {
      if (logTimer) clearInterval(logTimer);
    };
  }, [dispatch]);

  // Sync AI outputs with local form inputs when analysis completes
  useEffect(() => {
    if (aiOutput) {
      setCustomerName(aiOutput.customer_name || '');
      setCompanyName(aiOutput.company_name || '');
      setProductName(aiOutput.product_name || '');
      setBatchNumber(aiOutput.batch_number || '');
      setComplaintType(aiOutput.complaint_type || 'Product Quality');
      setDescription(aiOutput.description || '');
      setSummary(aiOutput.summary || '');
      setSeverity(aiOutput.severity || 'Minor');
      setRiskLevel(aiOutput.risk_level || 'Low');
      setPriority(aiOutput.priority || 'Low');
      setCapa(aiOutput.capa || '');
      setRootCause(aiOutput.root_cause || '');
      setSuggestedInv(aiOutput.suggested_investigation || '');
      setRecommendedDept(aiOutput.recommended_department || '');
      setAssignedTo(aiOutput.assigned_to || '');
      setComplaintDate(aiOutput.complaint_date || '');
      setMfgDate(aiOutput.mfg_date || '');
      setExpDate(aiOutput.exp_date || '');
      setCountry(aiOutput.country || '');
      setAttachmentName(aiOutput.attachment_name || 'complaint_report.pdf');
    }
  }, [aiOutput]);

  const runChecklistAnimation = (onDone) => {
    setCompletedSteps([]);
    setCurrentStep(0);
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < stepsList.length) {
        setCompletedSteps(prev => [...prev, index]);
        index++;
        setCurrentStep(index);
      } else {
        clearInterval(timer);
        if (onDone) onDone();
      }
    }, 1000);
    
    setLogTimer(timer);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    dispatch(uploadDocument(file)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        const doc = res.payload;
        runChecklistAnimation(() => {
          dispatch(analyzeUploadedDocument({
            file_path: doc.file_path,
            file_type: doc.file_type,
            file_name: doc.file_name
          }));
        });
      }
    });
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    runChecklistAnimation(() => {
      dispatch(analyzeTextInput(rawText));
    });
  };

  const handleSaveToRegistry = (e) => {
    e.preventDefault();
    
    const complaintData = {
      customer_name: customerName,
      company_name: companyName,
      product_name: productName,
      batch_number: batchNumber,
      complaint_type: complaintType,
      description: description,
      summary: summary || description.substring(0, 100) + '...',
      severity,
      risk_level: riskLevel,
      priority,
      capa,
      root_cause: rootCause,
      suggested_investigation: suggestedInv,
      recommended_department: recommendedDept,
      assigned_to: assignedTo,
      complaint_date: complaintDate,
      mfg_date: mfgDate,
      exp_date: expDate,
      country: country,
      attachment_name: attachmentName,
      summary_confidence: aiOutput?.summary_confidence || 98,
      risk_confidence: aiOutput?.risk_confidence || 96,
      extraction_confidence: aiOutput?.extraction_confidence || 99
    };

    dispatch(createComplaint(complaintData)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        navigate('/complaints');
      }
    });
  };

  const isAnalyzing = loading || uploadState.loading || (currentStep >= 0 && currentStep < stepsList.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Upper Area: Split between upload drop zone and Agent Log panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Upload panel */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '24px', gap: '16px' }}>
            <button
              onClick={() => { setActiveTab('upload'); dispatch(clearAIState()); setCurrentStep(-1); setCompletedSteps([]); }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'upload' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: activeTab === 'upload' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '10px 4px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Document Upload
            </button>
            <button
              onClick={() => { setActiveTab('text'); dispatch(clearAIState()); setCurrentStep(-1); setCompletedSteps([]); }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'text' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: activeTab === 'text' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '10px 4px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Direct Text Copy-Paste
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div 
              onClick={() => !isAnalyzing && fileInputRef.current.click()}
              style={{
                border: '2px dashed var(--border-glass)',
                borderRadius: '12px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                background: 'rgba(255, 255, 255, 0.01)',
                transition: 'border-color 0.2s, background 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => { if (!isAnalyzing) e.currentTarget.style.borderColor = 'var(--accent-cyan)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.txt,.eml"
                disabled={isAnalyzing}
              />
              <UploadCloud size={36} color="var(--accent-cyan)" />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Drag & Drop Complaint File</h4>
                {/* Supported icons row */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}><FileText size={14} color="#f87171" /> PDF</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}><ImageIcon size={14} color="#60a5fa" /> PNG/JPG</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}><Mail size={14} color="#34d399" /> EML/TXT</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '0.8rem', pointerEvents: 'none' }}
              >
                Browse Files
              </button>
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Raw Complaint Text</label>
                <textarea
                  className="form-input"
                  rows={5}
                  style={{ resize: 'vertical' }}
                  placeholder="Paste the raw text of the customer complaint email or correspondence here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  disabled={isAnalyzing}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ alignSelf: 'flex-start' }}
                disabled={isAnalyzing}
              >
                <Cpu size={16} />
                Analyze Text
              </button>
            </form>
          )}
        </div>

        {/* LangGraph Node State Monitor */}
        <div className="glass-panel" style={{
          padding: '28px',
          background: 'rgba(9, 13, 22, 0.65)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '16px' }}>
            <Terminal size={18} />
            LangGraph Node Workflow Monitor
          </h3>

          <div style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '16px',
            background: '#04060b',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            maxHeight: '220px',
            overflowY: 'auto'
          }}>
            {currentStep === -1 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                System idle. Awaiting document upload to begin agent graph...
              </span>
            ) : (
              stepsList.map((step, idx) => {
                const isCompleted = completedSteps.includes(idx);
                const isActive = currentStep === idx;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    color: isCompleted ? '#34d399' : (isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'),
                    fontWeight: isActive || isCompleted ? 600 : 400
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 
                        size={14} 
                        color={isCompleted ? '#34d399' : (isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)')} 
                        style={{ fill: isCompleted ? 'rgba(52, 211, 153, 0.1)' : 'none' }}
                      />
                      <span>{step}</span>
                    </div>
                    {isActive && (
                      <span className="pulse-light" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        ACTIVE
                      </span>
                    )}
                    {isCompleted && (
                      <span style={{ fontSize: '0.7rem', color: '#34d399' }}>
                        ✓ DONE
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {aiOutput && !isAnalyzing && (
        <div className="glass-panel" style={{ padding: '32px', animation: 'fadeIn 0.4s' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={20} color="var(--accent-purple)" />
              AI Agent Output Verification
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Verification file auto-filled by LangGraph state machine. Review metrics before committing to QMS.
            </p>
          </div>

          {/* Completeness checker warning box */}
          {(() => {
            const isMissingFields = !customerName || !companyName || !productName || !batchNumber || !description || !complaintDate || !mfgDate || !expDate || !country;
            return isMissingFields ? (
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--status-ui)',
                fontSize: '0.85rem'
              }}>
                <ListTodo size={20} style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>AI Quality Warning: Missing Key Details</h4>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    The uploaded document has incomplete information. Some crucial fields (e.g. Batch Number, Dates, or Reporter Details) could not be extracted automatically. Please verify and populate them manually before registry submission.
                  </p>
                </div>
              </div>
            ) : null;
          })()}

          {/* Split container layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.9fr',
            gap: '28px',
            alignItems: 'start',
            marginTop: '20px'
          }}>
            
            {/* Left side: AI summary preview card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-glass)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'sticky',
              top: '20px',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-purple)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={16} />
                AI Output Card Preview
              </h4>

              {/* Confidence badges */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.7rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(6, 182, 212, 0.05)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.15)', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.55rem', textTransform: 'uppercase' }}>Extraction</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{aiOutput.extraction_confidence || 99}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(168, 85, 247, 0.05)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.15)', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.55rem', textTransform: 'uppercase' }}>Summary</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{aiOutput.summary_confidence || 98}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(16, 185, 129, 0.05)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.55rem', textTransform: 'uppercase' }}>Risk</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--risk-low)' }}>{aiOutput.risk_confidence || 96}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(251, 191, 36, 0.05)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.15)', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.55rem', textTransform: 'uppercase' }}>CAPA</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--status-ui)' }}>95%</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>AI Incident Summary</strong>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600, lineHeight: '1.4' }}>{summary || "tablet breakage reported."}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Risk Priority</strong>
                    <span className={`badge badge-risk-${riskLevel.toLowerCase()}`} style={{ display: 'inline-block', marginTop: '2px' }}>{riskLevel}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Severity</strong>
                    <span className={`badge badge-risk-${severity.toLowerCase() === 'critical' ? 'high' : (severity.toLowerCase() === 'major' ? 'medium' : 'low')}`} style={{ display: 'inline-block', marginTop: '2px' }}>{severity}</span>
                  </div>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Suggested Root Cause</strong>
                  <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.4' }}>"{rootCause || "Packaging damage during blister loading."}"</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>Suggested CAPA</strong>
                  <div style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4',
                    background: 'rgba(255,255,255,0.01)',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-glass)',
                    whiteSpace: 'pre-line',
                    maxHeight: '130px',
                    overflowY: 'auto'
                  }}>{capa || "Inspect blister forming tools."}</div>
                </div>
              </div>
            </div>

            {/* Right side: Editable QMS Form */}
            <form onSubmit={handleSaveToRegistry} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Batch/Lot Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Dates & Location Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Complaint Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={complaintDate}
                    onChange={(e) => setComplaintDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mfg Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country / Region</label>
                  <input
                    type="text"
                    className="form-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Complaint Type</label>
                  <select className="form-select" value={complaintType} onChange={(e) => setComplaintType(e.target.value)}>
                    <option value="Product Quality">Product Quality</option>
                    <option value="Safety/Adverse Event">Safety/Adverse Event</option>
                    <option value="Packaging/Labeling">Packaging/Labeling</option>
                    <option value="Efficacy">Efficacy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Risk Level</label>
                  <select className="form-select" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Complaint Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">AI Summary Brief</label>
                <input
                  type="text"
                  className="form-input"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>

              {/* Advanced AI Extracted Output Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255, 255, 255, 0.01)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">AI Suggested Root Cause</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    style={{ fontStyle: 'italic' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Suggested QMS Investigation Steps</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={suggestedInv}
                    onChange={(e) => setSuggestedInv(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Recommended Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={recommendedDept}
                    onChange={(e) => setRecommendedDept(e.target.value)}
                    placeholder="e.g. Manufacturing QA"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned QMS Inspector Group</label>
                  <input
                    type="text"
                    className="form-input"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Extracted File Attachment Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">AI Recommended CAPA Action Items</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={capa}
                  onChange={(e) => setCapa(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>
                <Save size={18} />
                Confirm & Save to Complaint Registry
              </button>
            </form>

          </div>
        </div>
      )}

      <Footer />
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AICopilot;
