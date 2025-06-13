import React, { useState } from 'react';

const ResumeRecommendation = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/recommend/recommendations?job_title=${encodeURIComponent(jobTitle)}`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError('Failed to fetch recommendations.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔍 AI-Based Resume Recommendations</h2>
      <input
        type="text"
        placeholder="Enter Job Title (e.g., Data Scientist)"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={fetchRecommendations} disabled={!jobTitle || loading}>
        {loading ? 'Fetching...' : 'Get Recommendations'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {recommendations.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Top Candidates</h3>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>{rec.candidate_name}</strong> ({rec.filename})<br />
                Score: {rec.recommendation_score} - {rec.match_reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumeRecommendation;
