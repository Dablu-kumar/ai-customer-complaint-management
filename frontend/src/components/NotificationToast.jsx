import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { hideNotification } from '../store/slices/notificationSlice';

const NotificationToast = () => {
  const dispatch = useDispatch();
  const { message, type, open } = useSelector((state) => state.notification);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [open, dispatch]);

  if (!open) return null;

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          border: '1px solid rgba(244, 63, 94, 0.4)',
          background: 'rgba(15, 23, 42, 0.9)',
          icon: <AlertTriangle color="var(--risk-high)" size={20} />
        };
      case 'info':
        return {
          border: '1px solid rgba(59, 130, 246, 0.4)',
          background: 'rgba(15, 23, 42, 0.9)',
          icon: <Info color="var(--status-open)" size={20} />
        };
      case 'warning':
        return {
          border: '1px solid rgba(251, 146, 60, 0.4)',
          background: 'rgba(15, 23, 42, 0.9)',
          icon: <AlertTriangle color="var(--risk-medium)" size={20} />
        };
      default:
        return {
          border: '1px solid rgba(16, 185, 129, 0.4)',
          background: 'rgba(15, 23, 42, 0.9)',
          icon: <CheckCircle color="var(--risk-low)" size={20} />
        };
    }
  };

  const currentStyle = getStyles();

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      border: currentStyle.border,
      background: currentStyle.background,
      animation: 'slideIn 0.3s ease-out'
    }}>
      {currentStyle.icon}
      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', maxWidth: '300px' }}>
        {message}
      </span>
      <button 
        onClick={() => dispatch(hideNotification())}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          marginLeft: '8px'
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
