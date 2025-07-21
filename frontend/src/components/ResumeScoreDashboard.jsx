import React, { useEffect, useState } from 'react';

const ResumeScoreDashboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/resumes/scores')
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching resume scores:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={infoText}>Loading resume scores...</p>;
  if (scores.length === 0) return <p style={infoText}>No resume scores available.</p>;

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>📊 Resume Scoring Dashboard</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
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
            {scores.map((score, index) => (
              <tr key={index} style={rowStyle}>
                <td style={tdStyle}>{score.candidate_name}</td>
                <td style={tdStyle}>{score.filename}</td>
                <td style={tdStyle}>{score.relevance_score}</td>
                <td style={tdStyle}>{score.ats_score}</td>
                <td style={tdStyle}>{score.readability_score}</td>
                <td style={tdStyle}>{score.email || '—'}</td>
                <td style={tdStyle}>{score.phone_number || '—'}</td>
                <td style={tdStyle}>{new Date(score.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 🎨 Unified Styling

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
  color: '#00ffe7'
};

const rowStyle = {
  borderBottom: '1px solid #333'
};

const tdStyle = {
  padding: '0.6rem',
  border: '1px solid #00ffe7',
  color: '#ccc',
  textAlign: 'center'
};

export default ResumeScoreDashboard;
 
