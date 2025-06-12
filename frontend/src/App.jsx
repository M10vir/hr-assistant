import React from 'react';
import InterviewUploader from './components/InterviewUploader';
import ResumeScoreDashboard from './components/ResumeScoreDashboard';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🤖 AI-Powered HR Recruitment Assistant</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>🎙 Interview Analysis</h2>
        <InterviewUploader />
      </section>

      <section>
        <h2>📄 Resume Scoring Dashboard</h2>
        <ResumeScoreDashboard />
      </section>
    </div>
  );
}

export default App;
