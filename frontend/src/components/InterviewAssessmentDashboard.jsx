// frontend/src/components/InterviewAssessmentDashboard.jsx

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

  if (loading) return <p>Loading interview submissions...</p>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>🧠 Interview Assessment Dashboard</h2>

      {submissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          cellSpacing="0"
          style={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Job Title</th>
              <th>Submitted At</th>
              <th>Answers & Feedback</th>
              <th>Grand Total</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((item, idx) => {
              const feedbackArray = item.feedback || [];
              const totalScore = feedbackArray.reduce((sum, f) => sum + (f.score || 0), 0);
              const grandPercent = item.grand_score_percent || 0;

              return (
                <tr key={idx}>
                  <td>{item.candidate_name || "-"}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.phone_number || "-"}</td>
                  <td>{item.job_title || "-"}</td>
                  <td>
                    {item.submitted_at
                      ? new Date(item.submitted_at).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <ul style={{ paddingLeft: '1.2em' }}>
                      {feedbackArray.map((entry, i) => (
                        <li key={i}>
                          <strong>Q{entry.question_number}:</strong> {entry.answer}
                          <br />
                          <em><strong>Feedback:</strong> {entry.feedback}</em>
                          <hr />
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {totalScore}/30
                    <br />
                    ({grandPercent}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InterviewAssessmentDashboard; 
