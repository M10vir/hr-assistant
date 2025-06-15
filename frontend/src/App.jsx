import React from 'react';
import InterviewUploader from './components/InterviewUploader';
import ResumeUploader from './components/ResumeUploader';
import ResumeScoreDashboard from './components/ResumeScoreDashboard';
import ResumeRecommendation from './components/ResumeRecommendation';
import InterviewAssessmentDashboard from './components/InterviewAssessmentDashboard';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🤖 AI-Powered HR Recruitment Assistant</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>🎙 Interview Analysis</h2>
        <InterviewUploader />
      </section>

      <section style={{ marginBottom: '2rem' }}>
        {/* This title was redundant */}
        <ResumeUploader />
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <ResumeScoreDashboard />
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <ResumeRecommendation />
      </section>

      <section>
        <InterviewAssessmentDashboard />
      </section>
    </div>
  );
}

export default App;
