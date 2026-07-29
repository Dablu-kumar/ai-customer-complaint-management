import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px solid var(--border-glass)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
      opacity: 0.5
    }}>
      <div>
        <strong>AIVOA.AI</strong> · Enterprise Quality QMS v1.0
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <span>Engine: <strong>LangGraph StateMachine</strong></span>
        <span>Provider: <strong>Groq Cloud API</strong></span>
      </div>
    </footer>
  );
};

export default Footer;
