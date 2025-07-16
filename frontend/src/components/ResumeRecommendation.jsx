// frontend/src/components/ResumeRecommendation.jsx
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

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

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
    <div className="recommendation-container" style={{ padding: '2rem', color: '#f5f5f5' }}>
      <h2>🔍 GPT-Powered Resume Recommendations</h2>
      <input
        type="text"
        placeholder="Enter Job Title (e.g., Machine Learning Engineer)"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        style={{
          padding: '0.75rem',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid #ccc'
        }}
      />
      <br />
      <button
        onClick={fetchRecommendations}
        disabled={loading}
        style={{
          padding: '0.6rem 1.2rem',
          fontWeight: 'bold',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '6px'
        }}
      >
        {loading ? 'Fetching...' : 'Get Recommendations'}
      </button>

      {error && <p style={{ color: 'tomato', marginTop: '1rem' }}>{error}</p>}

      {recommendations.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>🧠 Top Matched Candidates</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: '1rem', background: '#333', padding: '1rem', borderRadius: '8px' }}>
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

export default ResumeRecommendation;
