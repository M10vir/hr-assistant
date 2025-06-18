import React, { useState } from 'react';

const InterviewAssessmentForm = () => {
  const [formData, setFormData] = useState({
    candidate_name: '',
    email: '',
    phone_number: '',
    job_title: ''
  });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/interview/assessment/questions?job_title=${formData.job_title}`
      );
      const data = await res.json();
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(''));
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/interview/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          answers
        })
      });
      const result = await res.json();
      console.log('Submission result:', result);
      setSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  if (submitted) return <p>✅ Thank you! Your answers have been submitted.</p>;

  return (
    <div>
      <h2>📝 Online Interview Assessment</h2>
      <div>
        <input
          type="text"
          name="candidate_name"
          placeholder="Candidate Name"
          value={formData.candidate_name}
          onChange={handleChange}
        />
        <br />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <br />
        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
        />
        <br />
        <input
          type="text"
          name="job_title"
          placeholder="Job Title"
          value={formData.job_title}
          onChange={handleChange}
        />
        <br />
        <button onClick={fetchQuestions}>Start Assessment</button>
      </div>

      {questions.length > 0 && (
        <div>
          <h3>Answer the following questions:</h3>
          {questions.map((q, idx) => (
            <div key={idx}>
              <p><strong>Q{idx + 1}:</strong> {q}</p>
              <textarea
                rows="3"
                cols="80"
                value={answers[idx]}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
              />
              <br />
            </div>
          ))}
          <button onClick={handleSubmit}>Submit Answers</button>
        </div>
      )}
    </div>
  );
};

export default InterviewAssessmentForm;
