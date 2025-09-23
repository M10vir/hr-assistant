import React, { useEffect, useMemo, useState } from 'react';

/**
 * AI Recommendations modal
 * - Pick a JD (from /jd/list)
 * - Generate top candidates (GET /recommend/recommendations?jd_id=&limit=)
 * - Persist snapshot (POST /recommend/save { jd_id, limit })
 * - View history (GET /recommend/history?jd_id=)
 *
 * Styling matches your neon border look.
 */
const ResumeRecommendation = ({ onClose }) => {
  const [jdList, setJdList] = useState([]);
  const [jdId, setJdId] = useState('');
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [rows, setRows] = useState([]);          // freshly generated
  const [history, setHistory] = useState([]);    // saved snapshots
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'history'

  // Load JD list on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('http://localhost:8000/jd/list');
        if (!res.ok) throw new Error(`JD list fetch failed (${res.status})`);
        const data = await res.json();
        if (alive) setJdList(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message || 'Failed to load JDs');
      }
    })();
    return () => { alive = false; };
  }, []);

  const jdTitle = useMemo(() => {
    const j = jdList.find(j => String(j.id) === String(jdId));
    return j?.job_title || '';
  }, [jdList, jdId]);

  const handleGenerate = async () => {
    if (!jdId) return setErr('Please select a Job Description.');
    setErr(null);
    setLoading(true);
    setRows([]);
    try {
      const url = `http://localhost:8000/recommend/recommendations?jd_id=${jdId}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Generate failed (${res.status})`);
      const data = await res.json();
      const recs = Array.isArray(data?.recommendations) ? data.recommendations : [];
      setRows(recs);
      setActiveTab('generate');
    } catch (e) {
      setErr(e.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!jdId) return setErr('Select a JD before saving.');
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/recommend/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_id: Number(jdId), limit: Number(limit) }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      // After save, refresh history tab
      await loadHistory(jdId);
      setActiveTab('history');
    } catch (e) {
      setErr(e.message || 'Failed to save recommendation snapshot');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (id = jdId) => {
    if (!id) return;
    setErr(null);
    setLoading(true);
    setHistory([]);
    try {
      const res = await fetch(`http://localhost:8000/recommend/history?jd_id=${id}`);
      if (!res.ok) throw new Error(`History fetch failed (${res.status})`);
      const data = await res.json();
      setHistory(Array.isArray(data?.history) ? data.history : []);
    } catch (e) {
      setErr(e.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // UI Helpers
  const scoreColor = (n) => {
    const v = Number(n);
    if (isNaN(v)) return '#ccc';
    if (v >= 90) return '#00ff9d';
    if (v >= 75) return '#b3ff00';
    return '#ffcf66';
  };
  const displayNum = (v) => (v === null || v === undefined ? '—' : v);
  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Header */}
        <div style={header}>
          <h3 style={{ margin: 0 }}>🤖 AI Recommendations</h3>
          <button onClick={onClose} style={closeBtn} aria-label="Close">✕</button>
        </div>

        {/* Controls */}
        <div style={controlsRow}>
          <select
            value={jdId}
            onChange={(e) => setJdId(e.target.value)}
            style={selectStyle}
          >
            <option value="">— Select Job Description —</option>
            {jdList.map(j => (
              <option key={j.id} value={j.id}>{j.job_title}</option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            style={inputStyle}
            placeholder="Limit"
            title="Number of candidates to fetch"
          />

          <button style={btn} onClick={handleGenerate} disabled={loading || !jdId}>
            {loading ? 'Working…' : 'Generate'}
          </button>
          <button style={btn} onClick={handleSave} disabled={loading || !jdId}>
            Save Snapshot
          </button>
          <button style={btnGhost} onClick={() => { loadHistory(); setActiveTab('history'); }} disabled={!jdId || loading}>
            View History
          </button>
        </div>

        {/* Status */}
        {err && <p style={errorText}>Error: {err}</p>}
        {jdId && <p style={hintText}>JD: <strong>{jdTitle}</strong></p>}

        {/* Tabs */}
        <div style={tabRow}>
          <button
            onClick={() => setActiveTab('generate')}
            style={activeTab === 'generate' ? tabActive : tab}
          >
            Top Matches
          </button>
          <button
            onClick={() => { setActiveTab('history'); loadHistory(); }}
            style={activeTab === 'history' ? tabActive : tab}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'generate' && (
            rows.length === 0 ? (
              <p style={infoText}>{loading ? 'Loading…' : 'No results yet. Click Generate.'}</p>
            ) : (
              <table style={table}>
                <thead>
                  <tr style={theadRow}>
                    <th style={th}>#</th>
                    <th style={th}>Candidate</th>
                    <th style={th}>Filename</th>
                    <th style={th}>Relevance</th>
                    <th style={th}>ATS</th>
                    <th style={th}>Readability</th>
                    <th style={th}>Email</th>
                    <th style={th}>Phone</th>
                    <th style={th}>Created</th>
                    <th style={th}>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={`${r.candidate_id}-${idx}`} style={tr}>
                      <td style={td}>{idx + 1}</td>
                      <td style={td}>{r.candidate_name || '—'}</td>
                      <td style={td}>{r.filename || '—'}</td>
                      <td style={{ ...td, fontWeight: 700, color: scoreColor(r.relevance_score) }}>{displayNum(r.relevance_score)}</td>
                      <td style={{ ...td, fontWeight: 700, color: scoreColor(r.ats_score) }}>{displayNum(r.ats_score)}</td>
                      <td style={td}>{displayNum(r.readability_score)}</td>
                      <td style={td}>{r.email || '—'}</td>
                      <td style={td}>{r.phone_number || '—'}</td>
                      <td style={td}>{fmtDate(r.created_at)}</td>
                      <td style={{ ...td, textAlign: 'left', maxWidth: 360, whiteSpace: 'normal' }}>{r.why || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {activeTab === 'history' && (
            history.length === 0 ? (
              <p style={infoText}>{loading ? 'Loading…' : 'No history yet. Save a snapshot first.'}</p>
            ) : (
              <table style={table}>
                <thead>
                  <tr style={theadRow}>
                    <th style={th}>#</th>
                    <th style={th}>Saved At</th>
                    <th style={th}>Candidate</th>
                    <th style={th}>Filename</th>
                    <th style={th}>Relevance</th>
                    <th style={th}>ATS</th>
                    <th style={th}>Readability</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={`${h.id}-${idx}`} style={tr}>
                      <td style={td}>{idx + 1}</td>
                      <td style={td}>{fmtDate(h.created_at)}</td>
                      <td style={td}>{h.candidate_name || '—'}</td>
                      <td style={td}>{h.filename || '—'}</td>
                      <td style={{ ...td, fontWeight: 700, color: scoreColor(h.relevance_score) }}>{displayNum(h.relevance_score)}</td>
                      <td style={{ ...td, fontWeight: 700, color: scoreColor(h.ats_score) }}>{displayNum(h.ats_score)}</td>
                      <td style={td}>{displayNum(h.readability_score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/* --- Styles (match your neon theme & borders) --- */
const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 9999
};
const modal = {
  backgroundColor: '#161616',
  border: '1px solid #00ffe7',
  boxShadow: '0 0 10px #00ffe7',
  borderRadius: '10px',
  width: 'min(1100px, 95vw)',
  maxHeight: '90vh',
  overflow: 'hidden',
  color: '#fff',
  fontFamily: 'sans-serif',
};
const header = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '1rem 1.25rem', borderBottom: '1px solid #00ffe7', background: '#1e1e1e'
};
const closeBtn = {
  background: 'transparent', border: '1px solid #00ffe7', color: '#fff',
  borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer'
};
const controlsRow = {
  display: 'flex', gap: '0.6rem', padding: '1rem 1.25rem', alignItems: 'center', flexWrap: 'wrap'
};
const selectStyle = {
  backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #00ffe7',
  borderRadius: 6, padding: '0.6rem 0.8rem', minWidth: 260
};
const inputStyle = {
  backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #00ffe7',
  borderRadius: 6, padding: '0.6rem 0.8rem', width: 90
};
const btn = {
  backgroundColor: '#2c2c2c', color: '#fff', border: '1px solid #00ffe7',
  borderRadius: 6, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 700
};
const btnGhost = {
  backgroundColor: 'transparent', color: '#fff', border: '1px solid #00ffe7',
  borderRadius: 6, padding: '0.6rem 1rem', cursor: 'pointer'
};
const tabRow = { display: 'flex', gap: '0.5rem', padding: '0 1.25rem 0.75rem' };
const tab = {
  background: 'transparent', color: '#fff', border: '1px solid #00ffe7',
  borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer'
};
const tabActive = {
  ...tab, background: '#00ffe733', boxShadow: '0 0 6px #00ffe7 inset'
};
const infoText = { color: '#ccc', padding: '1rem 1.25rem' };
const hintText = { color: '#9fe3ff', padding: '0 1.25rem 0.5rem' };
const errorText = { color: 'tomato', padding: '0 1.25rem 0.5rem' };

const table = {
  width: 'calc(100% - 2.5rem)', margin: '0 1.25rem 1.25rem', borderCollapse: 'collapse',
  fontSize: '0.95rem', backgroundColor: '#1e1e1e'
};
const theadRow = { backgroundColor: '#2c2c2c', color: '#fff' };
const th = {
  border: '1px solid #00ffe7', padding: '0.6rem', fontWeight: 'bold', color: '#00ffe7', whiteSpace: 'nowrap'
};
const tr = { borderBottom: '1px solid #333' };
const td = {
  padding: '0.6rem', border: '1px solid #00ffe7', color: '#ccc', textAlign: 'center', whiteSpace: 'nowrap'
};

export default ResumeRecommendation; 
