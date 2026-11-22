import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Cpu, Server, Sparkles, ChevronRight, UserCheck, Shield } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [apiStatus, setApiStatus] = useState('connecting');
  const [hasKey, setHasKey] = useState(false);
  const [provider, setProvider] = useState('Groq');
  const [model, setModel] = useState('Gemma2-9B');

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const items = [{ label: 'Dashboard', to: '/' }];
    
    if (path === '/complaints') {
      items.push({ label: 'Complaint Registry', to: '/complaints' });
    } else if (path === '/log') {
      items.push({ label: 'Log Complaint', to: '/log' });
    } else if (path === '/copilot') {
      items.push({ label: 'AI Copilot', to: '/copilot' });
    } else if (path === '/settings') {
      items.push({ label: 'Settings', to: '/settings' });
    } else if (path.startsWith('/complaints/')) {
      items.push({ label: 'Complaint Registry', to: '/complaints' });
      items.push({ label: `File #${path.split('/').pop()}`, to: path });
    }
    
    return items;
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'System Dashboard';
      case '/complaints':
        return 'Complaint Registry';
      case '/log':
        return 'Log Quality Complaint';
      case '/copilot':
        return 'AI Copilot Engine';
      case '/settings':
        return 'System Settings';
      default:
        if (location.pathname.startsWith('/complaints/')) {
          return 'Complaint Investigation File';
        }
        return 'AIVOA.AI QMS';
    }
  };

  useEffect(() => {
    const checkApi = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasKey(res.data.has_groq_key);
        setProvider(res.data.ai_provider);
        setModel(res.data.ai_model);
        setApiStatus('online');
      } catch (e) {
        // Fallback check
        try {
          await axios.get('http://localhost:8000/');
          setApiStatus('online');
        } catch (err) {
          setApiStatus('offline');
        }
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      marginBottom: '24px',
      borderRadius: '16px',
      border: '1px solid var(--border-glass)',
      background: 'var(--bg-glass)'
    }}>
      <div>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight size={10} />}
              {idx === breadcrumbs.length - 1 ? (
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{item.label}</span>
              ) : (
                <Link to={item.to} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{item.label}</Link>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {getPageTitle()}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        
        {/* Chip 1: AI Model */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '12px',
          background: 'rgba(168, 85, 247, 0.08)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--accent-purple)'
        }}>
          <Sparkles size={13} />
          Model: {model.replace('-it', '').toUpperCase()}
        </div>

        {/* Chip 2: AI Provider / Connection */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '12px',
          background: hasKey ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
          border: hasKey ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: hasKey ? 'var(--risk-low)' : 'var(--status-open)'
        }}>
          <Cpu size={13} />
          {hasKey ? `${provider} Connected` : 'Rule Engine'}
        </div>

        {/* Chip 3: LangGraph Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '12px',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--accent-cyan)'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-cyan)',
            display: 'inline-block'
          }} className="pulse-light" />
          LangGraph Running
        </div>

        {/* User Identity & Role Chip (Pillar 1 RBAC) */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <UserCheck size={13} color="var(--accent-cyan)" />
            <span style={{ color: 'var(--text-primary)' }}>{user.full_name || user.username}</span>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '0.65rem'
            }}>
              {user.role}
            </span>
          </div>
        )}

        {/* Server Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-glass)',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          <Server size={13} color={apiStatus === 'online' ? 'var(--risk-low)' : 'var(--status-open)'} />
          <span style={{ color: 'var(--text-secondary)' }}>Backend:</span>
          <span style={{ color: apiStatus === 'online' ? 'var(--risk-low)' : 'var(--status-open)' }}>
            {apiStatus === 'online' ? 'Localhost (Online)' : 'Dev Mode (Localhost)'}
          </span>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
