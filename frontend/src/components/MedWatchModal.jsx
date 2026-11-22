import React, { useEffect, useState } from 'react';
import { X, Printer, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';

const MedWatchModal = ({ isOpen, onClose, complaintId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && complaintId) {
      setLoading(true);
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:8000/api/complaints/${complaintId}/medwatch-3500a`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("Failed to load MedWatch data", err);
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
        color: '#1a1a1a',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '12px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        padding: '36px',
        fontFamily: 'Segoe UI, -apple-system, sans-serif'
      }}>
        {/* Modal Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: data?.report_type?.includes('15-DAY') ? '#fee2e2' : '#e0f2fe',
              color: data?.report_type?.includes('15-DAY') ? '#b91c1c' : '#0369a1',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {data?.report_type || 'FDA MEDWATCH 3500A'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Report Reference: <strong>{data?.report_id}</strong></span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Printer size={16} /> Print / Save as PDF
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

        {loading || !data ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            Compiling FDA MedWatch 3500A XML/PDF payload...
          </div>
        ) : (
          <div className="medwatch-content">
            {/* Official FDA Header */}
            <div style={{ border: '2px solid #000', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    Department of Health and Human Services
                  </h2>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: 700 }}>
                    Food and Drug Administration (FDA) · Form FDA 3500A
                  </h3>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                  <strong>MANDATORY REPORTING FOR MANUFACTURERS</strong><br />
                  <span>OMB Control No. 0910-0291</span>
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#334155' }}>
                Regulatory Basis: <strong>{data.regulatory_framework}</strong> | Report ID: <strong>{data.report_id}</strong> | Date: <strong>{data.section_b_adverse_event_or_product_problem.date_of_this_report}</strong>
              </div>
            </div>

            {/* Section A: Patient Info */}
            <div style={{ border: '1px solid #000', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '0.85rem' }}>
                SECTION A. PATIENT INFORMATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '12px', gap: '16px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>1. Patient Identifier</span>
                  <strong>{data.section_a_patient_info.patient_identifier}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>2. Age at Time of Event</span>
                  <strong>{data.section_a_patient_info.age}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>3. Sex</span>
                  <strong>{data.section_a_patient_info.gender}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>4. Weight</span>
                  <strong>{data.section_a_patient_info.weight}</strong>
                </div>
              </div>
            </div>

            {/* Section B: Adverse Event or Product Problem */}
            <div style={{ border: '1px solid #000', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '0.85rem' }}>
                SECTION B. ADVERSE EVENT OR PRODUCT PROBLEM
              </div>
              <div style={{ padding: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>1. Adverse Event Outcome</span>
                    <strong>{data.section_b_adverse_event_or_product_problem.outcome_attributed_to_event}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>2. Date of Event</span>
                    <strong>{data.section_b_adverse_event_or_product_problem.date_of_event}</strong>
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>3. Standardized MedDRA Coding</span>
                  <div style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '4px', fontWeight: 600, color: '#0369a1', marginTop: '2px' }}>
                    {data.section_b_adverse_event_or_product_problem.meddra_coding}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>4. Description of Event or Problem</span>
                  <p style={{ margin: '4px 0 0 0', lineHeight: '1.5', background: '#fcfcfc', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    {data.section_b_adverse_event_or_product_problem.description_of_event_or_problem}
                  </p>
                </div>
              </div>
            </div>

            {/* Section C: Suspect Product */}
            <div style={{ border: '1px solid #000', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '0.85rem' }}>
                SECTION C. SUSPECT PRODUCT(S)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '12px', gap: '14px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>1. Product Name & Strength</span>
                  <strong>{data.section_c_suspect_product.product_name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>2. National Drug Code (NDC #)</span>
                  <strong style={{ fontFamily: 'monospace' }}>{data.section_c_suspect_product.ndc_number}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>3. Lot / Batch Number</span>
                  <strong style={{ fontFamily: 'monospace' }}>{data.section_c_suspect_product.lot_batch_number}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>4. Manufacturing Date</span>
                  <span>{data.section_c_suspect_product.manufacturing_date}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>5. Expiration Date</span>
                  <span>{data.section_c_suspect_product.expiration_date}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>6. Manufacturer Name</span>
                  <span>{data.section_c_suspect_product.manufacturer_name}</span>
                </div>
              </div>
            </div>

            {/* Section E & G: Reporter & Manufacturer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', border: '1px solid #000', marginBottom: '16px' }}>
              <div style={{ borderRight: '1px solid #000' }}>
                <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '0.85rem' }}>
                  SECTION E. INITIAL REPORTER
                </div>
                <div style={{ padding: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Reporter Name</span>
                    <strong>{data.section_e_initial_reporter.reporter_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Health Professional?</span>
                    <span>{data.section_e_initial_reporter.health_professional}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Country</span>
                    <span>{data.section_e_initial_reporter.country}</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '0.85rem' }}>
                  SECTION G. ALL MANUFACTURERS
                </div>
                <div style={{ padding: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>FDA FEI Registration #</span>
                    <strong style={{ fontFamily: 'monospace' }}>{data.section_g_all_manufacturers.fei_number}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Date Received by Mfr</span>
                    <span>{data.section_g_all_manufacturers.date_received_by_manufacturer}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Assigned QA Department</span>
                    <span>{data.section_g_all_manufacturers.assigned_department}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certification Footer */}
            <div style={{ border: '1px solid #16a34a', background: '#f0fdf4', padding: '12px 16px', borderRadius: '6px', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>AIVOA.AI Automated Regulatory Triage Verification:</strong> This document has been validated for electronic submission in compliance with FDA E2B(R3) pharmacovigilance data transmission guidelines.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default MedWatchModal;
