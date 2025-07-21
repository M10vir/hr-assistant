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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/interview/assessment/questions?job_title=${formData.job_title}`
      );
      const data = await res.json();
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(''));
      setStarted(true);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAnswerChange = (value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = value;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/interview/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, answers })
      });
      const result = await res.json();
      console.log('Submission result:', result);
      setSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  if (submitted) {
    return <p style={confirmationStyle}>✅ Thank you! Your answers have been submitted.</p>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>📝 Online Interview Assessment</h2>

      {!started && (
        <div style={inputContainerStyle}>
          <input
            type="text"
            name="candidate_name"
            placeholder="Candidate Name"
            value={formData.candidate_name}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="job_title"
            placeholder="Job Title"
            value={formData.job_title}
            onChange={handleChange}
            style={inputStyle}
          />
          <button onClick={fetchQuestions} style={buttonStyle}>Start Assessment</button>
        </div>
      )}

      {started && questions.length > 0 && (
        <div>
          <h3 style={questionStyle}>
            <strong>Q{currentQuestionIndex + 1}:</strong> {questions[currentQuestionIndex]}
          </h3>
          <textarea
            rows="4"
            value={answers[currentQuestionIndex]}
            onChange={(e) => handleAnswerChange(e.target.value)}
            style={textareaStyle}
          />
          {currentQuestionIndex < questions.length - 1 ? (
            <button onClick={handleNext} style={buttonStyle}>Next</button>
          ) : (
            <button onClick={handleSubmit} style={buttonStyle}>Submit Answers</button>
          )}
        </div>
      )}
    </div>
  );
};

// 💄 Consistent Styling

const containerStyle = {
  backgroundColor: '#161616',
  padding: '2rem 1.5rem',
  borderRadius: '10px',
  maxWidth: '580px',
  width: '100%',
  margin: '0 auto',
  color: '#fff',
  fontFamily: 'sans-serif',
  boxShadow: '0 0 10px #00ffe7',
  border: '1px solid #00ffe7'
};

const headingStyle = {
  fontSize: '1.2rem',
  fontWeight: '600',
  marginBottom: '1.5rem',
  textAlign: 'center'
};

const inputContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '1rem'
};

const inputStyle = {
  backgroundColor: '#1e1e1e',
  color: '#fff',
  border: '1px solid #00ffe7',
  borderRadius: '6px',
  padding: '0.6rem',
  fontSize: '0.95rem'
};

const textareaStyle = {
  backgroundColor: '#1e1e1e',
  color: '#fff',
  border: '1px solid #00ffe7',
  borderRadius: '6px',
  padding: '0.8rem',
  width: '100%',
  fontSize: '0.95rem',
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
  alignSelf: 'center'
};

const questionStyle = {
  fontSize: '0.95rem',
  marginBottom: '0.8rem',
  color: '#ccc',
  textAlign: 'center'
};

const confirmationStyle = {
  color: '#00ffe7',
  fontSize: '0.95rem',
  textAlign: 'center',
  marginTop: '1.5rem'
};

export default InterviewAssessmentForm;
 
