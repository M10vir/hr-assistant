import React, { useEffect, useState } from 'react';

const InterviewAssessmentDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/interview/assessment/submissions")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching submissions:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={infoText}>Loading interview submissions...</p>;

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>🧠 Interview Assessment Dashboard</h2>

      {submissions.length === 0 ? (
        <p style={infoText}>No submissions found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Candidate Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Job Title</th>
                <th style={thStyle}>Submitted At</th>
                <th style={thStyle}>Answers & Feedback</th>
                <th style={thStyle}>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item, idx) => {
                const feedbackArray = item.feedback || [];
                const totalScore = feedbackArray.reduce((sum, f) => sum + (f.score || 0), 0);
                const grandPercent = item.grand_score_percent || 0;

                return (
                  <tr key={idx} style={rowStyle}>
                    <td style={tdStyle}>{item.candidate_name || '-'}</td>
                    <td style={tdStyle}>{item.email || '-'}</td>
                    <td style={tdStyle}>{item.phone_number || '-'}</td>
                    <td style={tdStyle}>{item.job_title || '-'}</td>
                    <td style={tdStyle}>
                      {item.submitted_at
                        ? new Date(item.submitted_at).toLocaleString()
                        : '-'}
                    </td>
                    <td style={tdStyle}>
                      <ul style={feedbackListStyle}>
                        {feedbackArray.map((entry, i) => (
                          <li key={i} style={feedbackItemStyle}>
                            <strong>Q{entry.question_number}:</strong> {entry.answer}
                            <br />
                            <em><strong>Feedback:</strong> {entry.feedback}</em>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={tdHighlightStyle}>
                      {totalScore}/30
                      <br />
                      ({grandPercent}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 🎨 Unified Styling

const containerStyle = {
  backgroundColor: '#161616',
  padding: '2rem 1.5rem',
  borderRadius: '10px',
  maxWidth: '1200px',
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
  textAlign: 'center',
  color: '#fff'
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

const thStyle = {
  border: '1px solid #00ffe7',
  padding: '0.8rem',
  fontWeight: 'bold',
  color: '#00ffe7',
  textAlign: 'center'
};

const rowStyle = {
  borderBottom: '1px solid #333'
};

const tdStyle = {
  padding: '0.6rem',
  border: '1px solid #00ffe7',
  color: '#ccc',
  verticalAlign: 'top',
  textAlign: 'center'
};

const tdHighlightStyle = {
  ...tdStyle,
  fontWeight: 'bold',
  color: '#fff'
};

const feedbackListStyle = {
  listStyleType: 'none',
  padding: 0,
  textAlign: 'left'
};

const feedbackItemStyle = {
  marginBottom: '1rem',
  borderBottom: '1px solid #333',
  paddingBottom: '0.5rem'
};

export default InterviewAssessmentDashboard;
 
