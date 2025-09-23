// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Home + features (all live under components/)
import Home from './components/Home.jsx';
import JDUploader from './components/JDUploader.jsx';
import ResumeUploader from './components/ResumeUploader.jsx';
import ResumeScoreDashboard from './components/ResumeScoreDashboard.jsx';
import ResumeRecommendation from './components/ResumeRecommendation.jsx';
import InterviewUploader from './components/InterviewUploader.jsx';
import InterviewAssessmentForm from './components/InterviewAssessmentForm.jsx';
import InterviewAssessmentDashboard from './components/InterviewAssessmentDashboard.jsx';
import SupportHelpline from './components/SupportHelpline.jsx'; // NEW

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Home />} />

        {/* Core flows */}
        <Route path="/upload-jd" element={<JDUploader />} />
        <Route path="/upload-resume" element={<ResumeUploader />} />
        <Route path="/resume-dashboard" element={<ResumeScoreDashboard />} />
        <Route path="/recommendations" element={<ResumeRecommendation />} />

        {/* Interview */}
        <Route path="/interview-analysis" element={<InterviewUploader />} />
        <Route path="/interview-form" element={<InterviewAssessmentForm />} />
        <Route path="/assessment-dashboard" element={<InterviewAssessmentDashboard />} />

        {/* Support */}
        <Route path="/support" element={<SupportHelpline />} />

        {/* Fallback -> Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
} 
