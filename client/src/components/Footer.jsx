import React from 'react';

/**
 * Global Footer Component (Deliverable #6)
 * Displays app copyright, author credit, and direct link to GitHub profile.
 */
const Footer = () => {
  return (
    <footer
      style={{
        background: '#07090b',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        color: '#8d949b',
        fontSize: '12px',
        letterSpacing: '0.04em',
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#efe9df', fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}>
          TripVault
        </span>
        <span>© {new Date().getFullYear()} • Crafted by <strong>Krish Kumar</strong></span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a
          href="https://github.com/krish6587/tripvault"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#efe9df',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            background: 'rgba(255, 255, 255, 0.03)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          <span>GitHub</span>
          <span>↗</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
