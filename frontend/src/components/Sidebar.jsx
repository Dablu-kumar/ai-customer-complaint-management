import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  ListTodo, 
  PlusCircle, 
  FileSearch, 
  Settings as SettingsIcon, 
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/complaints', label: 'Complaints List', icon: <ListTodo size={20} /> },
    { to: '/log', label: 'Log Complaint', icon: <PlusCircle size={20} /> },
    { to: '/copilot', label: 'AI Copilot', icon: <FileSearch size={20} /> },
    { to: '/settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      height: 'calc(100vh - 32px)',
      position: 'fixed',
      top: '16px',
      left: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px',
      zIndex: 100
    }}>
      <div>
        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            A
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>AIVOA.AI</h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.1em' }}>QMS INVESTIGATOR</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              })}
              className={({ isActive }) => isActive ? '' : 'sidebar-link-hover'}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            color: 'var(--accent-cyan)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600
          }}>
            {user?.full_name?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.full_name || 'QA Investigator'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldAlert size={10} color="var(--accent-cyan)" />
              {user?.role || 'User'}
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '10px',
            fontSize: '0.9rem',
            color: '#f43f5e',
            borderColor: 'rgba(244, 63, 94, 0.2)'
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
