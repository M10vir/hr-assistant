// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import components
import Home from './components/Home';
import JDUploader from './components/JDUploader';
import ResumeUploader from './components/ResumeUploader';
import ResumeScoreDashboard from './components/ResumeScoreDashboard';
import ResumeRecommendation from './components/ResumeRecommendation';
import InterviewUploader from './components/InterviewUploader'; // ✅ fixed import
import InterviewAssessmentForm from './components/InterviewAssessmentForm';
import InterviewAssessmentDashboard from './components/InterviewAssessmentDashboard';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jd-upload" element={<JDUploader />} />
      <Route path="/resume-upload" element={<ResumeUploader />} />
      <Route path="/resume-dashboard" element={<ResumeScoreDashboard />} />
      <Route path="/recommendations" element={<ResumeRecommendation />} />
      <Route path="/interview" element={<InterviewUploader />} /> {/* ✅ fixed route */}
      <Route path="/interview-form" element={<InterviewAssessmentForm />} />
      <Route path="/assessment-dashboard" element={<InterviewAssessmentDashboard />} />
    </Routes>
  );
};

export default App;
