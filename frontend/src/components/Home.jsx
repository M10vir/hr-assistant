import React, { useState } from 'react';
import ResumeUploader from './ResumeUploader';
import JDUploader from './JDUploader';
import ResumeScoreDashboard from './ResumeScoreDashboard';
import ResumeRecommendation from './ResumeRecommendation';
import InterviewUploader from './InterviewUploader';
import InterviewAssessmentForm from './InterviewAssessmentForm';
import InterviewAssessmentDashboard from './InterviewAssessmentDashboard';

const ModalWrapper = ({ children, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: '#161616',
      color: '#fff',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '1500px',
      width: '90%',
      border: '1px solid #00ffe7',
      boxShadow: '0 0 10px #00ffe7',
      maxHeight: '75vh',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#2c2c2c',
            color: '#fff',
            border: '1px solid #00ffe7',
            padding: '6px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'background 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00ffe7'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2c2c2c'}
        >
          ✖ CLOSE
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Home = () => {
  const [activeModal, setActiveModal] = useState(null);

  const cards = [
    { title: '📁 Upload JD', desc: 'Store job descriptions for AI matching.', key: 'jd' },
    { title: '📄 Upload Resume', desc: 'AI-powered resume scoring & suggestions.', key: 'resume' },
    { title: '📊 Resume Dashboard', desc: 'ATS, readability, relevance visualized.', key: 'resumeDashboard' },
    { title: '🤖 AI Recommendations', desc: 'Smart candidate suggestions via LLM.', key: 'aiRecommendations' },
    { title: '🎙️ Interview Analysis', desc: 'Upload audio for GPT feedback.', key: 'interviewAnalysis' },
    { title: '📝 Interview Form', desc: 'Collect structured responses live.', key: 'interviewForm' },
    { title: '📈 Assessment Dashboard', desc: 'Score candidates on key metrics.', key: 'assessmentDashboard' }
  ];

  const renderModal = () => {
    switch (activeModal) {
      case 'jd': return <ModalWrapper onClose={() => setActiveModal(null)}><JDUploader /></ModalWrapper>;
      case 'resume': return <ModalWrapper onClose={() => setActiveModal(null)}><ResumeUploader /></ModalWrapper>;
      case 'resumeDashboard': return <ModalWrapper onClose={() => setActiveModal(null)}><ResumeScoreDashboard /></ModalWrapper>;
      case 'aiRecommendations': return <ModalWrapper onClose={() => setActiveModal(null)}><ResumeRecommendation /></ModalWrapper>;
      case 'interviewAnalysis': return <ModalWrapper onClose={() => setActiveModal(null)}><InterviewUploader /></ModalWrapper>;
      case 'interviewForm': return <ModalWrapper onClose={() => setActiveModal(null)}><InterviewAssessmentForm /></ModalWrapper>;
      case 'assessmentDashboard': return <ModalWrapper onClose={() => setActiveModal(null)}><InterviewAssessmentDashboard /></ModalWrapper>;
      default: return null;
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      color: '#fff',
      minHeight: '100vh',
      padding: '50px 20px',
      fontFamily: 'sans-serif'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '2.2rem', color: '#00ffe7' }}>🚀 AI-Powered HR Recruitment Assistant</h1>
        <p style={{ color: '#ccc', maxWidth: '700px', margin: '10px auto' }}>
          Automate screening, scoring, and interview analysis with advanced AI tools built for the modern recruiter.
        </p>
      </header>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {cards.map(({ title, desc, key }) => (
          <div
            key={key}
            onClick={() => setActiveModal(key)}
            style={{
              background: '#1e1e1e',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              border: '1px solid #00ffe7',
              boxShadow: '0 0 10px #00ffe7',
              transition: 'transform 0.2s ease-in-out'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
          >
            <h3 style={{ color: '#00ffe7', marginBottom: '12px' }}>{title}</h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem' }}>{desc}</p>
          </div>
        ))}
      </section>

      {renderModal()}
    </div>
  );
};

export default Home;
 
