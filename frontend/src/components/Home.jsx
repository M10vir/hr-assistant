// frontend/src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🚀 Welcome to the AI-Powered HR Recruitment Assistant</h2>

      <p style={descriptionStyle}>
        Revolutionize your recruitment process with AI-driven resume scoring, smart job matching,
        and intelligent interview analysis — all in one unified platform.
      </p>

      <div style={gridStyle}>
        {features.map((feature, index) => (
          <Link to={feature.link} key={index} style={{ textDecoration: 'none' }}>
            <div style={cardStyle}>
              <div style={iconStyle}>{feature.icon}</div>
              <h3 style={cardTitleStyle}>{feature.title}</h3>
              <p style={cardDescStyle}>{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Feature List with Route Links
const features = [
  {
    icon: '📄',
    title: 'Upload Job Descriptions',
    description: 'Import and store JD files for matching with top candidate profiles.',
    link: '/jd-upload',
  },
  {
    icon: '📤',
    title: 'Upload Resumes',
    description: 'Submit DOCX or PDF resumes for instant AI-powered scoring.',
    link: '/resume-upload',
  },
  {
    icon: '📊',
    title: 'Resume Dashboard',
    description: 'Visualize relevance, ATS, and readability scores in real time.',
    link: '/resume-dashboard',
  },
  {
    icon: '🧠',
    title: 'AI Recommendations',
    description: 'Get top candidate suggestions based on job title and fit score.',
    link: '/recommendation',
  },
  {
    icon: '🎙',
    title: 'Interview Analysis',
    description: 'Analyze spoken responses with GPT feedback and confidence ratings.',
    link: '/interview',
  },
  {
    icon: '📝',
    title: 'Online Interview Form',
    description: 'Deliver interactive assessments and capture structured answers.',
    link: '/interview-form',
  },
  {
    icon: '📋',
    title: 'Assessment Dashboard',
    description: 'Review interview scores and candidate performance at a glance.',
    link: '/assessment-dashboard',
  },
];

// 🎨 Styles
const containerStyle = {
  textAlign: 'center',
  padding: '3rem 2rem',
  backgroundColor: '#121212',
  color: '#ffffff',
  maxWidth: '1200px',
  margin: '0 auto',
};

const titleStyle = {
  fontSize: '2.4rem',
  marginBottom: '1rem',
  color: '#00BFFF',
};

const descriptionStyle = {
  fontSize: '1.1rem',
  color: '#ccc',
  marginBottom: '2.5rem',
  lineHeight: '1.6',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1.8rem',
};

const cardStyle = {
  background: '#1e1e1e',
  borderRadius: '12px',
  padding: '1.8rem 1.5rem',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  border: '1px solid #333',
  boxShadow: '0 4px 10px rgba(0, 191, 255, 0.05)',
  textAlign: 'left',
  cursor: 'pointer',
};

const cardTitleStyle = {
  fontSize: '1.2rem',
  color: '#00BFFF',
  marginBottom: '0.5rem',
};

const cardDescStyle = {
  fontSize: '0.95rem',
  color: '#ccc',
};

const iconStyle = {
  fontSize: '2rem',
  marginBottom: '0.6rem',
};

export default Home; 
