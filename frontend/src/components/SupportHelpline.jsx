// frontend/src/components/SupportHelpline.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const box = {
  backgroundColor: '#161616',
  color: '#fff',
  border: '1px solid #00ffe7',
  boxShadow: '0 0 10px #00ffe7',
  borderRadius: '10px',
  padding: '1.5rem',
  maxWidth: 900,
  margin: '2rem auto',
  fontFamily: 'sans-serif',
};

const h1 = { marginTop: 0, fontSize: '1.4rem', color: '#00ffe7' };
const p  = { color: '#ccc', lineHeight: 1.6 };
const row = { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' };
const pill = {
  border: '1px solid #00ffe7',
  borderRadius: '999px',
  padding: '0.5rem 0.9rem',
  color: '#00ffe7',
  textDecoration: 'none'
};

export default function SupportHelpline() {
  return (
    <div style={box}>
      <h1 style={h1}>🆘 Hotline Support / Contact us</h1>
      <p style={p}>
        Need help, want to report an issue, or request a feature? We’re here for you.
      </p>
      <ul style={{ color: '#ccc', marginTop: '0.5rem' }}>
        <li>📧 Email: <a href="mailto:support@example.com">support@example.com</a></li>
        <li>☎️ Phone: <a href="tel:+10000000000">+1 (000) 000-0000</a></li>
        <li>🐛 Bug report: <a href="mailto:support@example.com?subject=Bug%20Report">open a ticket via email</a></li>
      </ul>

      <div style={row}>
        <Link to="/" style={pill}>← Back to Home</Link>
        <Link to="/upload-jd" style={pill}>+ New JD</Link>
        <Link to="/upload-resume" style={pill}>Score a Resume</Link>
        <Link to="/recommendations" style={pill}>AI Recommendations</Link>
      </div>
    </div>
  );
}
