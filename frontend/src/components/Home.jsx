import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const nav = useNavigate();

  // Live ribbon stats
  const [jdCount, setJdCount] = useState(0);
  const [resumeCount, setResumeCount] = useState(0);
  const [topCount, setTopCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [jdsRes, recentRes, topRes] = await Promise.all([
          fetch('http://localhost:8000/jd/list'),
          fetch('http://localhost:8000/resumes/scores?limit=500'),
          fetch('http://localhost:8000/resumes/top?limit=20'),
        ]);

        const [jds, recent, top] = await Promise.all([
          jdsRes.ok ? jdsRes.json() : [],
          recentRes.ok ? recentRes.json() : [],
          topRes.ok ? topRes.json() : [],
        ]);

        if (!alive) return;
        setJdCount(Array.isArray(jds) ? jds.length : 0);
        setResumeCount(Array.isArray(recent) ? recent.length : 0);
        setTopCount(Array.isArray(top) ? top.length : 0);
      } catch {
        if (!alive) return;
        setJdCount(0);
        setResumeCount(0);
        setTopCount(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div style={pageWrap}>
      {/* Hero */}
      <h1 style={title}>AI-Powered HR Recruitment Assistant</h1>
      <p style={subtitle}>
        Automate screening, scoring, recommendations, and interview analysis—built for the modern recruiter.
      </p>

      {/* Ribbon: live stats */}
      <div style={ribbonWrap}>
        <RibbonItem value={loading ? '—' : jdCount} label="Job Descriptions" />
        <RibbonItem value={loading ? '—' : resumeCount} label="Resumes Processed" />
        <RibbonItem value={loading ? '—' : topCount} label={`Top Candidates (${topCount})`} />
      </div>

      {/* Quick action chips */}
      <div style={chipsWrap}>
        <Chip onClick={() => nav('/upload-jd')}>+ New JD</Chip>
        <Chip onClick={() => nav('/upload-resume')}>Score a Resume</Chip>
        <Chip onClick={() => nav('/resume-dashboard')}>Open Resume Dashboard</Chip>
        <Chip onClick={() => nav('/recommendations')}>AI Recommendations</Chip>
      </div>

      {/* Card grid — all on one page (2 columns on desktop, 1 on narrow) */}
      <div style={grid}>
        <Card
          icon="📄"
          title="Upload JD"
          desc="Store job descriptions for AI matching."
          onClick={() => nav('/upload-jd')}
        />
        <Card
          icon="📬"
          title="Upload Resume"
          desc="AI-powered resume scoring & suggestions."
          onClick={() => nav('/upload-resume')}
        />
        <Card
          icon="📊"
          title="Resume Dashboard"
          desc="ATS, readability, relevance visualized."
          onClick={() => nav('/resume-dashboard')}
        />
        <Card
          icon="🤖"
          title="AI Recommendations"
          desc="Top-fit candidates per JD, with saveable snapshots."
          onClick={() => nav('/recommendations')}
        />
        <Card
          icon="🎙️"
          title="Interview Analysis"
          desc="Upload audio for GPT feedback."
          onClick={() => nav('/interview-analysis')}
        />
        <Card
          icon="📝"
          title="Interview Form"
          desc="Collect structured responses live."
          onClick={() => nav('/interview-form')}
        />
        <Card
          icon="📈"
          title="Assessment Dashboard"
          desc="Score candidates on key metrics."
          onClick={() => nav('/assessment-dashboard')}
        />
        <Card
          icon="🆘"
          title="Hotline Support / Contact us"
          desc="Get help, report issues, or request features."
          onClick={() =>
            window.open(
              'mailto:mohammadtanvirit@outlook.com?subject=HR%20Assistant%20Support&body=Please%20describe%20your%20issue%20or%20request…',
              '_blank'
            )
          }
        />
      </div>
    </div>
  );
};

/* ---------- Small components ---------- */
const RibbonItem = ({ value, label }) => (
  <div style={ribbonItem}>
    <div style={ribbonValue}>{value}</div>
    <div style={ribbonLabel}>{label}</div>
  </div>
);

const Chip = ({ children, onClick }) => (
  <button onClick={onClick} style={chipStyle}>{children}</button>
);

const Card = ({ icon, title, desc, onClick }) => (
  <button onClick={onClick} style={card}>
    <div style={cardIcon}>{icon}</div>
    <div>
      <div style={cardTitle}>{title}</div>
      <div style={cardDesc}>{desc}</div>
    </div>
  </button>
);

/* ---------- Styles (neon, compact, single page) ---------- */
const pageWrap = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '2.25rem 1rem 3rem',
  color: '#fff',
  fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
};

const title = {
  textAlign: 'center',
  fontSize: '2.2rem',
  fontWeight: 800,
  marginBottom: '0.5rem',
};

const subtitle = {
  textAlign: 'center',
  color: '#cfcfcf',
  fontSize: '1rem',
  marginBottom: '1.25rem',
};

/* Ribbon */
const ribbonWrap = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '0.75rem',
  background: 'transparent',
  padding: '0.25rem',
  margin: '0 auto 0.75rem',
  borderRadius: 12,
  boxShadow: '0 0 10px #00ffe7',
  border: '1px solid #00ffe7',
};

const ribbonItem = {
  background: '#112021',
  borderRadius: 10,
  padding: '0.7rem 0.5rem',
  textAlign: 'center',
};

const ribbonValue = {
  fontSize: '1.35rem',
  fontWeight: 800,
  color: '#00ffe7',
  lineHeight: 1.1,
};

const ribbonLabel = {
  fontSize: '0.8rem',
  color: '#c8eaea',
  marginTop: 2,
};

/* Chips */
const chipsWrap = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  justifyContent: 'center',
  marginBottom: '1.25rem',
};

const chipStyle = {
  background: '#122627',
  border: '1px solid #00ffe7',
  color: '#dff',
  borderRadius: 999,
  fontSize: '0.9rem',
  padding: '0.45rem 0.9rem',
  cursor: 'pointer',
  boxShadow: '0 0 8px rgba(0,255,231,0.35)',
};

/* Cards grid */
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns desktop
  gap: '1rem',
};

const card = {
  display: 'flex',
  gap: '0.9rem',
  alignItems: 'flex-start',
  textAlign: 'left',
  padding: '1.1rem 1rem',
  background: '#0e1516',
  border: '1px solid #00ffe7',
  borderRadius: 12,
  boxShadow: '0 0 12px rgba(0,255,231,0.35)',
  cursor: 'pointer',
};

const cardIcon = {
  fontSize: '1.7rem',
  marginTop: 2,
};

const cardTitle = {
  color: '#00ffe7',
  fontWeight: 700,
  fontSize: '1.05rem',
  marginBottom: 6,
};

const cardDesc = {
  color: '#cfcfcf',
  fontSize: '0.93rem',
  lineHeight: 1.35,
};

/* Responsive: keep it on one page but readable */
const media = window.matchMedia?.('(max-width: 780px)');
if (media && media.matches) {
  grid.gridTemplateColumns = '1fr'; // stack cards on narrow screens
}

export default Home; 
