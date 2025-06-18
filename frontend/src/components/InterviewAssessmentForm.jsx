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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  if (submitted) return <p>Thank you! Your answers have been submitted.</p>;

  return (
    <div>
      <h2>Online Interview Assessment</h2>

      {!started && (
        <div>
          <input
            type="text"
            name="candidate_name"
            placeholder="Candidate Name"
            value={formData.candidate_name}
            onChange={handleChange}
          /><br />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          /><br />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
          /><br />
          <input
            type="text"
            name="job_title"
            placeholder="Job Title"
            value={formData.job_title}
            onChange={handleChange}
          /><br />
          <button onClick={fetchQuestions}>Start Assessment</button>
        </div>
      )}

      {started && questions.length > 0 && (
        <div>
          <h3><strong>Q{currentQuestionIndex + 1}:</strong> {questions[currentQuestionIndex]}</h3>
          <textarea
            rows="4"
            cols="80"
            value={answers[currentQuestionIndex]}
            onChange={(e) => handleAnswerChange(e.target.value)}
          /><br />
          {currentQuestionIndex < questions.length - 1 ? (
            <button onClick={handleNext}>Next</button>
          ) : (
            <button onClick={handleSubmit}>Submit Answers</button>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewAssessmentForm; 
