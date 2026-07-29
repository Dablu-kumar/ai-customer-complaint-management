import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Plus, 
  X, 
  Calendar, 
  User, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Send,
  Edit3,
  CornerDownRight,
  Cpu,
  Brain,
  History,
  Workflow
} from 'lucide-react';
import { 
  fetchComplaints, 
  deleteComplaint, 
  fetchComplaintById, 
  updateComplaint, 
  submitRiskAssessment,
  clearSelected
} from '../store/slices/complaintSlice';
import Footer from '../components/Footer';

const ComplaintList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { list, selectedComplaint, loading } = useSelector((state) => state.complaints);

  // Filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Drawer details drawer visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Status updating state in Drawer
  const [statusVal, setStatusVal] = useState('OPEN');

  // Risk assessment form state in Drawer
  const [severityScore, setSeverityScore] = useState(3);
  const [probabilityScore, setProbabilityScore] = useState(3);
  const [riskRationale, setRiskRationale] = useState('');

  // Manual CAPA edit state
  const [capaVal, setCapaVal] = useState('');
  const [isEditingCapa, setIsEditingCapa] = useState(false);

  // Adjust icon size by 15% (20px -> 23px)
  const iconSize = 23;

  const loadData = () => {
    dispatch(fetchComplaints({
      search,
      complaint_type: typeFilter,
      severity: severityFilter,
      risk_level: riskFilter,
      status: statusFilter
    }));
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, severityFilter, riskFilter, statusFilter, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setSeverityFilter('');
    setRiskFilter('');
    setStatusFilter('');
    dispatch(fetchComplaints({}));
  };

  const handleDelete = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this complaint record? This action will permanently remove it from the QMS registry and delete all associated audits.')) {
      dispatch(deleteComplaint(id)).then(() => {
        if (selectedComplaint && selectedComplaint.id === id) {
          setIsDrawerOpen(false);
        }
      });
    }
  };

  const openDrawerDetails = (id) => {
    dispatch(fetchComplaintById(id)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        const c = res.payload;
        setStatusVal(c.status);
        setCapaVal(c.capa || '');
        setIsDrawerOpen(true);
      }
    });
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    dispatch(clearSelected());
  };

  const handleStatusChangeInDrawer = (e) => {
    const nextStatus = e.target.value;
    setStatusVal(nextStatus);
    dispatch(updateComplaint({ id: selectedComplaint.id, updateData: { status: nextStatus } }));
  };

  const handleCapaSave = (e) => {
    e.preventDefault();
    dispatch(updateComplaint({ id: selectedComplaint.id, updateData: { capa: capaVal } })).then(() => {
      setIsEditingCapa(false);
    });
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Filters & Search Control Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="var(--accent-cyan)" />
            Search and Filter Filters
          </h3>
          {/* + New Complaint Button */}
          <Link to="/log" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Plus size={16} />
            New Complaint
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'flex-end'
        }}>
          {/* Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, minWidth: '240px' }}>
            <label className="form-label">Search registry</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="Product, Batch, Customer, Details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '150px' }}>
            <label className="form-label">Type</label>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="Product Quality">Product Quality</option>
              <option value="Safety/Adverse Event">Safety/Adverse Event</option>
              <option value="Packaging/Labeling">Packaging/Labeling</option>
              <option value="Efficacy">Efficacy</option>
            </select>
          </div>

          {/* Severity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '120px' }}>
            <label className="form-label">Severity</label>
            <select className="form-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="">All Severities</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Risk Level */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '120px' }}>
            <label className="form-label">Risk Level</label>
            <select className="form-select" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="">All Risks</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '140px' }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="UNDER REVIEW">UNDER REVIEW</option>
              <option value="INVESTIGATION">INVESTIGATION</option>
              <option value="CAPA">CAPA</option>
              <option value="VERIFICATION">VERIFICATION</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '12px 18px' }}>
              Apply
            </button>
            <button type="button" onClick={handleResetFilters} className="btn-secondary" style={{ padding: '12px 18px' }}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Complaint List Display */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading && list.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              border: '4px solid rgba(255, 255, 255, 0.1)',
              borderTop: '4px solid var(--accent-cyan)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>Loading registry...</span>
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            No complaints found matching the criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Product Details</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Batch/Lot</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Customer Reporter</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Severity</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Risk</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Priority</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Created</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Last Updated</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '18px 16px' }}>
                      <button 
                        onClick={() => openDrawerDetails(c.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                      >
                        #{c.id}
                      </button>
                    </td>
                    <td style={{ padding: '18px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.product_name || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{c.company_name || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '18px 16px', fontFamily: 'monospace', fontSize: '0.9rem' }}>{c.batch_number || 'N/A'}</td>
                    <td style={{ padding: '18px 16px', fontSize: '0.9rem' }}>{c.customer_name || 'N/A'}</td>
                    <td style={{ padding: '18px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c.complaint_type || 'N/A'}</td>
                    <td style={{ padding: '18px 16px' }}>
                      <span className={`badge badge-risk-${c.severity.toLowerCase() === 'critical' ? 'high' : (c.severity.toLowerCase() === 'major' ? 'medium' : 'low')}`}>
                        {c.severity}
                      </span>
                    </td>
                    <td style={{ padding: '18px 16px' }}>
                      <span className={`badge badge-risk-${c.risk_level.toLowerCase()}`}>
                        {c.risk_level}
                      </span>
                    </td>
                    <td style={{ padding: '18px 16px' }}>
                      <span className={`badge badge-risk-${(c.priority || 'low').toLowerCase()}`}>
                        {c.priority || 'Low'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 16px' }}>
                      <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '')}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '18px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '18px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.updated_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '18px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => openDrawerDetails(c.id)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                          <Eye size={14} />
                        </button>
                        <button onClick={(e) => handleDelete(c.id, e)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out right-hand Drawer Details Panel */}
      {isDrawerOpen && selectedComplaint && (
        <>
          {/* Overlay */}
          <div className="drawer-overlay" onClick={closeDrawer} />
          
          {/* Drawer Content */}
          <div className="drawer-content" style={{
            position: 'fixed',
            top: 0, right: 0, bottom: 0,
            width: '100%',
            maxWidth: '620px',
            background: 'rgba(9, 13, 22, 0.98)',
            backdropFilter: 'blur(15px)',
            borderLeft: '1px solid var(--border-glass)',
            zIndex: 1001,
            padding: '30px',
            overflowY: 'auto',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            animation: 'slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, fontFamily: 'monospace' }}>COMPLAINT FILE #{selectedComplaint.id}</span>
                <h2 style={{ fontSize: '1.3rem', margin: '4px 0 0 0', fontWeight: 700 }}>{selectedComplaint.product_name}</h2>
              </div>
              <button onClick={closeDrawer} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Visual Stepper */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span className="form-label" style={{ fontSize: '0.7rem' }}>QMS Lifecycle Progression</span>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                padding: '10px 0'
              }}>
                {/* Horizontal line */}
                <div style={{
                  position: 'absolute',
                  top: '18px', left: '20px', right: '20px',
                  height: '2px',
                  background: 'rgba(255,255,255,0.05)',
                  zIndex: 0
                }} />
                
                {/* Colored fill line */}
                {(() => {
                  const statuses = ["OPEN", "UNDER REVIEW", "INVESTIGATION", "CAPA", "VERIFICATION", "CLOSED"];
                  const currentIdx = statuses.indexOf(selectedComplaint.status);
                  const widthPct = (currentIdx / (statuses.length - 1)) * 100;
                  return (
                    <div style={{
                      position: 'absolute',
                      top: '18px', left: '20px',
                      width: `calc(${widthPct}% - 40px)`,
                      height: '2px',
                      background: 'var(--accent-cyan)',
                      zIndex: 1,
                      transition: 'width 0.3s ease'
                    }} />
                  );
                })()}

                {/* Steps */}
                {["OPEN", "UNDER REVIEW", "INVESTIGATION", "CAPA", "VERIFICATION", "CLOSED"].map((step, idx, arr) => {
                  const isActive = selectedComplaint.status === step;
                  const isPassed = arr.indexOf(selectedComplaint.status) >= idx;
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => {
                        setStatusVal(step);
                        dispatch(updateComplaint({ id: selectedComplaint.id, updateData: { status: step } }));
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        zIndex: 2,
                        width: '75px',
                        padding: 0,
                        outline: 'none'
                      }}
                    >
                      <div style={{
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? 'var(--bg-primary)' : (isPassed ? 'var(--accent-cyan)' : 'var(--bg-secondary)'),
                        border: isPassed ? '2px solid var(--accent-cyan)' : '2px solid rgba(255,255,255,0.1)',
                        boxShadow: isActive ? '0 0 10px var(--accent-cyan)' : 'none',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isPassed && !isActive && <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />}
                      </div>
                      <span style={{
                        fontSize: '0.52rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        textTransform: 'uppercase',
                        lineHeight: '1.2'
                      }}>
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duplicate Batch Alert Warning */}
            {selectedComplaint.duplicate_count > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--risk-high)',
                fontSize: '0.85rem'
              }}>
                <ShieldAlert size={24} style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>Active Batch Deviation warning</h4>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    There are <strong>{selectedComplaint.duplicate_count}</strong> other complaints registered in the registry for Batch <strong>{selectedComplaint.batch_number}</strong>. This indicates a potential systemic manufacturing issue.
                  </p>
                </div>
              </div>
            )}

            {/* AI Extracted Fields Output Panel */}
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(168, 85, 247, 0.03)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)', margin: 0 }}>
                  <Brain size={16} />
                  AI Agent Output & Confidence
                </h3>
                {/* Confidence Badges */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                    Extr: {selectedComplaint.extraction_confidence || 99}%
                  </span>
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--risk-low)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    Risk: {selectedComplaint.risk_confidence || 96}%
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Complaint Summary:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selectedComplaint.summary}</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>AI Priority:</strong>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`badge badge-risk-${selectedComplaint.priority.toLowerCase()}`}>
                        {selectedComplaint.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Recommended Department:</strong>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedComplaint.recommended_department || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>AI-Suggested Root Cause:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                    "{selectedComplaint.root_cause || 'Analyzing...'}"
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Suggested Investigation Plan:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {selectedComplaint.suggested_investigation || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* QA CAPA Plan */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Corrective & Preventive Action (CAPA)</strong>
                <button 
                  onClick={() => setIsEditingCapa(!isEditingCapa)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit3 size={12} />
                  {isEditingCapa ? 'Cancel' : 'Edit CAPA'}
                </button>
              </div>
              {isEditingCapa ? (
                <form onSubmit={handleCapaSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={capaVal}
                    onChange={(e) => setCapaVal(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', alignSelf: 'flex-end' }}>
                    Save CAPA
                  </button>
                </form>
              ) : (
                <div style={{
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  whiteSpace: 'pre-line'
                }}>
                  {selectedComplaint.capa || 'No CAPA documented.'}
                </div>
              )}
            </div>

            {/* Manual Risk Matrix FMEA */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="var(--accent-cyan)" />
                FMEA Risk Calculator
              </h4>
              <form onSubmit={handleRiskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Severity (1-5)</label>
                    <select className="form-select" value={severityScore} onChange={(e) => setSeverityScore(e.target.value)} style={{ padding: '8px', fontSize: '0.8rem' }}>
                      <option value="1">1 - Negligible</option>
                      <option value="2">2 - Minor</option>
                      <option value="3">3 - Moderate</option>
                      <option value="4">4 - Major</option>
                      <option value="5">5 - Critical</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Probability (1-5)</label>
                    <select className="form-select" value={probabilityScore} onChange={(e) => setProbabilityScore(e.target.value)} style={{ padding: '8px', fontSize: '0.8rem' }}>
                      <option value="1">1 - Remote</option>
                      <option value="2">2 - Low</option>
                      <option value="3">3 - Medium</option>
                      <option value="4">4 - High</option>
                      <option value="5">5 - Frequent</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.65rem' }}>Rationale Justification</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Enter risk choice justification..."
                    value={riskRationale}
                    onChange={(e) => setRiskRationale(e.target.value)}
                    required
                    style={{ fontSize: '0.8rem', padding: '8px' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', alignSelf: 'flex-start' }}>
                  Update Risk Assessment
                </button>
              </form>
            </div>

            {/* Audit Logs Timelines */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} color="var(--accent-purple)" />
                Part 11 Audit Trail History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedComplaint.audit_logs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                    <CornerDownRight size={10} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <div>
                        <strong>{log.action}</strong> <span style={{ color: 'var(--text-muted)' }}>by {log.user_name || 'System'}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>{log.description}</p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      <Footer />
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .table-row-hover { transition: background-color 0.2s; }
        .table-row-hover:hover { background-color: rgba(255, 255, 255, 0.02); }
        .drawer-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ComplaintList;
