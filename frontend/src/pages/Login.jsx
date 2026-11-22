import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, Shield, CheckCircle2, UserCheck } from 'lucide-react';
import { login, clearError } from '../store/slices/authSlice';

const DEMO_PERSONAS = [
  {
    name: "Dr. Elena Rostova",
    role: "QualityAssurance (QA Manager)",
    username: "qa_lead",
    password: "Password123",
    description: "Full QMS authority, e-signature sign-off, CAPA authorization, and closure."
  },
  {
    name: "Dr. Marcus Vance",
    role: "Investigator (Lead Clinical)",
    username: "investigator_1",
    password: "Password123",
    description: "Conducts 5-Whys, laboratory investigation, and root cause analysis."
  },
  {
    name: "Alex Rivera",
    role: "IntakeSpecialist (QA Clerk)",
    username: "intake_clerk",
    password: "Password123",
    description: "Logs customer complaints, uploads PDF files, and initiates intake triage."
  },
  {
    name: "Inspector Jonathan Hayes",
    role: "Auditor (FDA/EMA Inspector)",
    username: "auditor_ext",
    password: "Password123",
    description: "External GMP regulatory auditor; inspects 21 CFR 11 audit trails and dossiers."
  }
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [username, setUsername] = useState('qa_lead');
  const [password, setPassword] = useState('Password123');

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      dispatch(login({ username, password }));
    }
  };

  const selectPersona = (p) => {
    setUsername(p.username);
    setPassword(p.password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Decorative Blur Background Glob */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-cyan-glow) 0%, transparent 60%)',
        filter: 'blur(60px)',
        zIndex: 0,
        top: '15%',
        left: '20%'
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 440px) minmax(320px, 420px)',
        gap: '24px',
        maxWidth: '920px',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Left Side: Login Form */}
        <div className="glass-panel" style={{ padding: '40px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.8rem',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
              marginBottom: '14px'
            }}>
              A
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
              AIVOA.<span style={{ color: 'var(--accent-cyan)' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
              Enterprise Pharmaceutical QMS & Complaint Management
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--risk-high)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="username">Username / ID</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Authenticating Credentials...' : 'Sign In to QMS Workspace'}
            </button>
          </form>
        </div>

        {/* Right Side: 21 CFR Part 11 Role Persona Selector */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem' }}>
              <Shield size={18} />
              21 CFR Part 11 Enterprise RBAC
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Click any pharmaceutical role persona below to auto-fill credentials and test role-specific workflows:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DEMO_PERSONAS.map((p) => {
              const isSelected = username === p.username;
              return (
                <div
                  key={p.username}
                  onClick={() => selectPersona(p)}
                  style={{
                    background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                      {p.name}
                    </strong>
                    <span style={{
                      fontSize: '0.65rem',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)'
                    }}>
                      {p.username}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                    {p.role}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    {p.description}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
            * All personas share password: <strong style={{ color: 'var(--accent-cyan)' }}>Password123</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
