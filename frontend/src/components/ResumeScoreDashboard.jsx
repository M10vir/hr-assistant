// frontend/src/components/ResumeScoreDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';

const API_BASE = 'http://localhost:8000';

const ResumeScoreDashboard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalErr, setModalErr] = useState(null);

  // fetch top rows
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/resumes/top?limit=20`);
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const data = await res.json();
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message || 'Failed to load top resumes');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // open modal and fetch resume text
  const openModal = useCallback(async (id) => {
    setIsOpen(true);
    setActiveId(id);
    setModalLoading(true);
    setModalErr(null);
    setModalData(null);
    try {
      const res = await fetch(`${API_BASE}/resumes/${id}/text`);
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data = await res.json();
      setModalData(data);
    } catch (e) {
      setModalErr(e.message || 'Failed to load resume text');
    } finally {
      setModalLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setActiveId(null);
    setModalData(null);
    setModalErr(null);
  }, []);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeModal]);

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>🏆 Top 20 Resume Scores</h2>

      {loading && <p style={infoText}>Loading top resumes…</p>}
      {err && <p style={errorText}>Error: {err}</p>}
      {!loading && !err && rows.length === 0 && (
        <p style={infoText}>No scored resumes yet. Upload one to see it here.</p>
      )}

      {!loading && !err && rows.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Candidate Name</th>
                <th style={thStyle}>Filename</th>
                <th style={thStyle}>Relevance</th>
                <th style={thStyle}>ATS</th>
                <th style={thStyle}>Readability</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id ?? idx} style={rowStyle}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{r.candidate_name || '—'}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => openModal(r.id)}
                      style={filenameBtn}
                      title="View resume"
                    >
                      {r.filename}
                    </button>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: scoreColor(r.relevance_score) }}>
                    {displayNum(r.relevance_score)}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: scoreColor(r.ats_score) }}>
                    {displayNum(r.ats_score)}
                  </td>
                  <td style={tdStyle}>{displayNum(r.readability_score)}</td>
                  <td style={tdStyle}>{r.email || '—'}</td>
                  <td style={tdStyle}>{r.phone_number || '—'}</td>
                  <td style={tdStyle}>{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div style={modalBackdrop} onClick={closeModal}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <strong>📄 View Resume</strong>
              <button onClick={closeModal} style={closeBtn} aria-label="Close">✖</button>
            </div>

            {modalLoading && <p style={infoText}>Loading resume…</p>}
            {modalErr && <p style={errorText}>Error: {modalErr}</p>}

            {!modalLoading && !modalErr && modalData && (
              <>
                <div style={metaRow}>
                  <span><b>Name:</b> {modalData.candidate_name || '—'}</span>
                  <span><b>Email:</b> {modalData.email || '—'}</span>
                  <span><b>Phone:</b> {modalData.phone_number || '—'}</span>
                </div>
                <div style={metaRow}>
                  <span><b>Filename:</b> {modalData.filename}</span>
                  <span><b>Uploaded:</b> {formatDate(modalData.created_at)}</span>
                  <span>
                    <a
                      href={`${API_BASE}/resumes/${activeId}/download`}
                      style={downloadBtn}
                      title="Download original file"
                    >
                      ⬇ Download original
                    </a>
                  </span>
                </div>
                <div style={resumeBox}>
                  <pre style={resumePre}>{modalData.resume_text || '(No text stored)'}</pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* Helpers */
const scoreColor = (v) => {
  const n = Number(v);
  if (isNaN(n)) return '#ccc';
  if (n >= 90) return '#00ff9d';     // great
  if (n >= 75) return '#b3ff00';     // good
  return '#ffcf66';                  // meh
};

const displayNum = (v) => (v === null || v === undefined ? '—' : v);

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso; // fallback raw
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

/* 🎨 Styling (kept consistent with your current UI) */
const containerStyle = {
  backgroundColor: '#161616',
  padding: '2rem 1.5rem',
  borderRadius: '10px',
  maxWidth: '1500px',
  width: '100%',
  margin: '0 auto',
  color: '#fff',
  fontFamily: 'sans-serif',
  boxShadow: '0 0 10px #00ffe7',
  border: '1px solid #00ffe7'
};

const headingStyle = {
  fontSize: '1.2rem',
  marginBottom: '1.5rem',
  fontWeight: '600',
  color: '#fff',
  textAlign: 'center'
};

const infoText = {
  color: '#ccc',
  fontSize: '0.95rem',
  textAlign: 'center',
  padding: '1rem'
};

const errorText = {
  color: 'tomato',
  fontSize: '0.95rem',
  textAlign: 'center',
  padding: '1rem'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.95rem',
  backgroundColor: '#1e1e1e'
};

const headerRowStyle = {
  backgroundColor: '#2c2c2c',
  color: '#fff'
};

const thStyle = {
  border: '1px solid #00ffe7',
  padding: '0.8rem',
  fontWeight: 'bold',
  color: '#00ffe7',
  whiteSpace: 'nowrap'
};

const rowStyle = {
  borderBottom: '1px solid #333'
};

const tdStyle = {
  padding: '0.6rem',
  border: '1px solid #00ffe7',
  color: '#ccc',
  textAlign: 'center',
  whiteSpace: 'nowrap'
};

const filenameBtn = {
  background: 'transparent',
  border: 'none',
  color: '#00ffe7',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.95rem',
  padding: 0
};

/* Modal styles */
const modalBackdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modalCard = {
  width: 'min(1000px, 92vw)',
  maxHeight: '85vh',
  background: '#161616',
  border: '1px solid #00ffe7',
  boxShadow: '0 0 12px #00ffe7',
  borderRadius: '10px',
  padding: '1rem 1rem 1.25rem',
  overflow: 'hidden',
  color: '#fff'
};

const modalHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.5rem'
};

const closeBtn = {
  background: '#2c2c2c',
  color: '#fff',
  border: '1px solid #00ffe7',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  padding: '0.25rem 0.6rem'
};

const metaRow = {
  display: 'flex',
  gap: '1.25rem',
  flexWrap: 'wrap',
  fontSize: '0.92rem',
  color: '#ccc',
  margin: '0.25rem 0'
};

const downloadBtn = {
  background: '#2c2c2c',
  color: '#fff',
  border: '1px solid #00ffe7',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  padding: '0.25rem 0.6rem',
  textDecoration: 'none'
};

const resumeBox = {
  marginTop: '0.6rem',
  backgroundColor: '#000',
  border: '1px solid #333',
  borderRadius: '6px',
  padding: '0.8rem',
  overflow: 'auto',
  maxHeight: '60vh'
};

const resumePre = {
  whiteSpace: 'pre-wrap',
  color: '#ccc',
  fontSize: '0.95rem',
  margin: 0
};

export default ResumeScoreDashboard; 
