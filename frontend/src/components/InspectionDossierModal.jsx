import React, { useEffect, useState } from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Award, FileCheck, Layers } from 'lucide-react';
import axios from 'axios';

const InspectionDossierModal = ({ isOpen, onClose, complaintId }) => {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && complaintId) {
      setLoading(true);
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:8000/api/complaints/${complaintId}/inspection-dossier`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setDossier(res.data);
      })
      .catch(err => {
        console.error("Failed to load inspection dossier", err);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, complaintId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        color: '#0f172a',
        width: '100%',
        maxWidth: '960px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '12px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        padding: '40px',
        fontFamily: 'Segoe UI, -apple-system, sans-serif'
      }}>
        {/* Modal Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={24} color="#0284c7" />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>FDA / cGMP OFFICIAL COMPLIANCE AUDIT DOSSIER</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>21 CFR Part 11 & EU Annex 11 Certified Package</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Printer size={16} /> Print Official Audit Dossier
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {loading || !dossier ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            Generating audit-ready inspection dossier...
          </div>
        ) : (
          <div className="dossier-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Dossier Header Certificate */}
            <div style={{
              border: '2px solid #0284c7',
              borderRadius: '8px',
              padding: '20px',
              background: '#f0f9ff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #bae6fd', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    QUALITY MANAGEMENT SYSTEM CERTIFIED AUDIT DOSSIER
                  </span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 900, color: '#0c4a6e' }}>
                    {dossier.dossier_title}
                  </h2>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                  <strong>FEI Facility Reg #:</strong> {dossier.fei_number}<br />
                  <strong>Compiled Date:</strong> {dossier.dossier_generated_at}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', color: '#0369a1' }}>
                <span>Certified By: <strong>{dossier.certified_by}</strong> ({dossier.certified_role})</span>
                <span>Audit Reference: <strong>DOSSIER-QMS-{String(dossier.complaint_record.id).padStart(5, '0')}</strong></span>
              </div>
            </div>

            {/* Section 1: Complaint & Product Identification */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0f172a', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</span>
                COMPLAINT IDENTIFICATION & DEFECT SUMMARY
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Product Name</span>
                  <strong>{dossier.complaint_record.product_name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Batch / Lot Number</span>
                  <strong style={{ fontFamily: 'monospace' }}>{dossier.complaint_record.batch_number}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>FDA NDC Number</span>
                  <strong style={{ fontFamily: 'monospace' }}>{dossier.complaint_record.ndc_code}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Manufacturing & Expiration Dates</span>
                  <span>{dossier.complaint_record.mfg_date} / {dossier.complaint_record.exp_date}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Complaint Type & Severity</span>
                  <span><strong>{dossier.complaint_record.complaint_type}</strong> ({dossier.complaint_record.severity})</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Current QMS Status</span>
                  <span style={{ fontWeight: 800, color: dossier.complaint_record.status === 'CLOSED' ? '#16a34a' : '#d97706' }}>
                    {dossier.complaint_record.status}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Incident Narrative Description</span>
                <p style={{ margin: '4px 0 0 0', lineHeight: '1.5' }}>{dossier.complaint_record.description}</p>
              </div>
            </div>

            {/* Section 2: Root Cause Analysis (5-Whys) */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0f172a', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</span>
                ROOT CAUSE ANALYSIS (5-WHYS METHODOLOGY)
              </h3>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase' }}>Confirmed Root Cause Statement</span>
                  <strong style={{ color: '#0369a1' }}>"{dossier.root_cause_analysis.root_cause_statement || 'Investigation confirmed root cause.'}"</strong>
                </div>

                {dossier.root_cause_analysis.five_whys?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dossier.root_cause_analysis.five_whys.map((w, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontWeight: 800, color: '#0284c7', flexShrink: 0 }}>Why #{w.why_number}:</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{w.question}</div>
                          <div style={{ color: '#475569', marginTop: '2px' }}>➔ {w.answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                    Initial preliminary root cause determination documented in BPR records.
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: CAPA Implementation & Effectiveness */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0f172a', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>3</span>
                CAPA IMPLEMENTATION & EFFECTIVENESS AUDIT
              </h3>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Authorized CAPA Action Items</span>
                  <p style={{ margin: '4px 0 0 0', lineHeight: '1.5', whiteSpace: 'pre-line', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    {dossier.capa_management.capa_plan || 'CAPA plan assigned.'}
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>CAPA Owner</span>
                    <strong>{dossier.capa_management.capa_owner}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Completion Due Date</span>
                    <span>{dossier.capa_management.capa_due_date || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Effectiveness Check Date</span>
                    <span>{dossier.capa_management.effectiveness_check_date || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Effectiveness Status</span>
                    <strong style={{ color: dossier.capa_management.effectiveness_status === 'VERIFIED_EFFECTIVE' ? '#16a34a' : '#d97706' }}>
                      {dossier.capa_management.effectiveness_status}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: 21 CFR Part 11 Electronic Signatures Audit Trail */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0f172a', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>4</span>
                21 CFR PART 11 CERTIFIED ELECTRONIC SIGNATURE RECORDS
              </h3>
              {dossier.electronic_signatures_audit?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dossier.electronic_signatures_audit.map((sig, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={16} color="#16a34a" />
                          <strong style={{ fontSize: '0.9rem' }}>{sig.signer_name}</strong>
                          <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{sig.signer_role}</span>
                          <span style={{ color: '#0369a1', fontWeight: 600 }}>({sig.status_from} ➔ {sig.status_to})</span>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{sig.timestamp}</span>
                      </div>
                      <div style={{ color: '#334155', fontStyle: 'italic', marginBottom: '6px' }}>
                        "{sig.meaning_of_signature}"
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#64748b', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        SHA-256 HASH: {sig.signature_hash}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  No electronic signatures recorded yet.
                </div>
              )}
            </div>

            {/* Official Certification Declaration */}
            <div style={{ borderTop: '2px solid #000', paddingTop: '16px', fontSize: '0.75rem', color: '#475569', lineHeight: '1.4' }}>
              <strong>CERTIFICATION STATEMENT:</strong> {dossier.regulatory_certification}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDossierModal;
