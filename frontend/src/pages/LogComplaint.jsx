import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Cpu } from 'lucide-react';
import { createComplaint } from '../store/slices/complaintSlice';

const LogComplaint = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [productName, setProductName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [complaintType, setComplaintType] = useState('Product Quality');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [severity, setSeverity] = useState('Minor');
  const [riskLevel, setRiskLevel] = useState('Low');
  const [capa, setCapa] = useState('');
  const [assignedTo, setAssignedTo] = useState('QA Team');

  const handleSubmit = (e) => {
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
      capa,
      status: 'Open',
      assigned_to: assignedTo
    };

    dispatch(createComplaint(complaintData)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        navigate('/complaints');
      }
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner Suggesting AI Copilot */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Cpu size={22} color="var(--accent-cyan)" />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Save Time with AI Auto-Fill</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Upload your PDF complaint sheets, images, or emails and let our LLM fill this form for you.
            </p>
          </div>
        </div>
        <Link to="/copilot" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Launch AI Copilot
        </Link>
      </div>

      {/* Manual Entry Form */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Log Customer Complaint
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Customer/Reporter Name</label>
              <input
                type="text"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Company/Clinic/Pharmacy</label>
              <input
                type="text"
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Mount Sinai Pharmacy"
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
                placeholder="e.g. Ibuprofen 400mg Tablets"
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
                placeholder="e.g. LOT-998A"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
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
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Complaint Description</label>
            <textarea
              className="form-input"
              rows={4}
              style={{ resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the complaint in detail..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Summary Brief (1 Sentence)</label>
            <input
              type="text"
              className="form-input"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Retain samples inspected due to capsule chipping report"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial CAPA Action Plan</label>
            <textarea
              className="form-input"
              rows={3}
              style={{ resize: 'vertical' }}
              value={capa}
              onChange={(e) => setCapa(e.target.value)}
              placeholder="List down immediate quarantine steps or testing protocols..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Inspector / Team</label>
            <input
              type="text"
              className="form-input"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Quality Assurance Team"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
              <Save size={18} />
              Register Complaint
            </button>
            <button type="button" onClick={() => navigate('/complaints')} className="btn-secondary" style={{ padding: '12px 24px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogComplaint;
