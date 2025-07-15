// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import JDUploader from './components/JDUploader';
import ResumeUploader from './components/ResumeUploader';
import ResumeScoreDashboard from './components/ResumeScoreDashboard';
import ResumeRecommendation from './components/ResumeRecommendation';
import InterviewUploader from './components/InterviewUploader';
import InterviewAssessmentDashboard from './components/InterviewAssessmentDashboard';
import InterviewAssessmentForm from './components/InterviewAssessmentForm';
import Home from './components/Home';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🤖 AI-Powered HR Recruitment Assistant</h1>

      {/* ✅ Navigation Links */}
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/jd-upload" style={{ marginRight: '1rem' }}>Upload JD</Link>
        <Link to="/resume-upload" style={{ marginRight: '1rem' }}>Upload Resume</Link>
        <Link to="/resume-dashboard" style={{ marginRight: '1rem' }}>Resume Dashboard</Link>
        <Link to="/recommendation" style={{ marginRight: '1rem' }}>Recommendations</Link>
        <Link to="/interview-upload" style={{ marginRight: '1rem' }}>Interview</Link>
        <Link to="/assessment-form" style={{ marginRight: '1rem' }}>Interview Form</Link>
        <Link to="/assessment-dashboard">Assessment Dashboard</Link>
      </nav>

      {/* ✅ Routes Definition */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/" element={<ResumeScoreDashboard />} />
        <Route path="/jd-upload" element={<JDUploader />} />
        <Route path="/resume-upload" element={<ResumeUploader />} />
        <Route path="/resume-dashboard" element={<ResumeScoreDashboard />} />
        <Route path="/recommendation" element={<ResumeRecommendation />} />
        <Route path="/interview-upload" element={<InterviewUploader />} />
        <Route path="/assessment-form" element={<InterviewAssessmentForm />} />
        <Route path="/assessment-dashboard" element={<InterviewAssessmentDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
