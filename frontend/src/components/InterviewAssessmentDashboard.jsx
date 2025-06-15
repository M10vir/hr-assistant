import React, { useEffect, useState } from 'react';

const InterviewAssessmentDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/interview/assessment/submissions")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching submissions:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading interview submissions...</p>;

  return (
    <div>
      <h2>🧠 Interview Assessment Dashboard</h2>
      {submissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Job Title</th>
              <th>Submitted At</th>
              <th>Answers</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((item, idx) => (
              <tr key={idx}>
                <td>{item.candidate_name}</td>
                <td>{item.email}</td>
                <td>{item.phone_number}</td>
                <td>{item.job_title}</td>
                <td>{new Date(item.submitted_at).toLocaleString()}</td>
                <td>
                  <ul>
                    {item.answers.map((answer, i) => (
                      <li key={i}>{answer}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InterviewAssessmentDashboard;
