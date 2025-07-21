import React, { useState } from 'react';

const ResumeRecommendation = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    if (!jobTitle.trim()) {
      setError('Please enter a job title.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/recommend/recommendations?job_title=${encodeURIComponent(jobTitle)}`
      );

      if (!response.ok) throw new Error('Server responded with an error');

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('❌ Failed to fetch recommendations. Please check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>🔍 GPT-Powered Resume Recommendations</h2>

      <input
        type="text"
        placeholder="Enter Job Title (e.g., Machine Learning Engineer)"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={fetchRecommendations}
        disabled={loading}
        style={buttonStyle}
      >
        {loading ? 'Fetching...' : 'Get Recommendations'}
      </button>

      {error && <p style={errorStyle}>{error}</p>}

      {recommendations.length > 0 && (
        <div style={resultContainerStyle}>
          <h3 style={subheadingStyle}>🧠 Top Matched Candidates</h3>
          <ul style={listStyle}>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={listItemStyle}>
                <strong>{rec.candidate_name}</strong> <em>({rec.filename})</em><br />
                <strong>Score:</strong> {rec.recommendation_score} <br />
                <strong>Reason:</strong> {rec.match_reason}
              </li>
            ))}
          </ul>
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
  maxWidth: '800px',
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

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '6px',
  border: '1px solid #00ffe7',
  width: '97%',
  fontSize: '0.95rem',
  backgroundColor: '#1e1e1e',
  color: '#fff',
  marginBottom: '1rem'
};

const buttonStyle = {
  padding: '0.6rem 1.2rem',
  backgroundColor: '#2c2c2c',
  color: '#fff',
  border: '1px solid #00ffe7',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.95rem',
  transition: 'background-color 0.3s ease'
};

const errorStyle = {
  color: 'tomato',
  marginTop: '1rem',
  fontSize: '0.95rem',
  textAlign: 'center'
};

const resultContainerStyle = {
  marginTop: '2rem'
};

const subheadingStyle = {
  fontSize: '1.1rem',
  color: '#00ffe7',
  marginBottom: '1rem',
  textAlign: 'center'
};

const listStyle = {
  listStyleType: 'none',
  paddingLeft: 0
};

const listItemStyle = {
  marginBottom: '1rem',
  backgroundColor: '#1e1e1e',
  padding: '1rem',
  borderRadius: '8px',
  border: '1px solid #00ffe7',
  color: '#ccc',
  fontSize: '0.95rem'
};

export default ResumeRecommendation;
 
