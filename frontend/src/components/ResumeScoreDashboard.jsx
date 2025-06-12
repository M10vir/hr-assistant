
import React, { useEffect, useState } from 'react';

const ResumeScoreDashboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/resumes/scores")
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching resume scores:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading resume scores...</p>;

  return (
    <div className="resume-score-dashboard">
      <h2>📊 Resume Scoring Dashboard</h2>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>Candidate Name</th>
            <th>Filename</th>
            <th>Relevance Score</th>
            <th>ATS Score</th>
            <th>Readability Score</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => (
            <tr key={index}>
              <td>{score.candidate_name}</td>
              <td>{score.filename}</td>
              <td>{score.relevance_score}</td>
              <td>{score.ats_score}</td>
              <td>{score.readability_score}</td>
              <td>{new Date(score.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResumeScoreDashboard;
