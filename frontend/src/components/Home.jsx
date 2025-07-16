// frontend/src/components/Home.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/jd/upload-jd/', formData);
      alert('JD uploaded successfully!');
      setShowModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload JD.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🚀 Welcome to the AI-Powered HR Recruitment Assistant</h2>

      <p style={descriptionStyle}>
        Revolutionize your recruitment process with AI-driven resume scoring, smart job matching,
        and intelligent interview analysis — all in one unified platform.
      </p>

      <div style={gridStyle}>
        {features.map((feature, index) => (
          <div
            key={index}
            onClick={() => {
              if (feature.title === 'Upload Job Descriptions') {
                setShowModal(true);
              } else {
                window.location.href = feature.link;
              }
            }}
            style={cardStyle}
          >
            <div style={iconStyle}>{feature.icon}</div>
            <h3 style={cardTitleStyle}>{feature.title}</h3>
            <p style={cardDescStyle}>{feature.description}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={headingStyle}>📄 Upload Job Description</h2>
            <div style={uploadBoxStyle}>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} style={fileInputStyle} />
              <button onClick={handleUpload} style={buttonStyle}>Upload JD</button>
              <button onClick={() => setShowModal(false)} style={cancelButtonStyle}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🔗 Features
const features = [
  {
    icon: '📄',
    title: 'Upload Job Descriptions',
    description: 'Import and store JD files for matching with top candidate profiles.',
    link: '#',
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

// 🎨 Styling
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
  border: '1px solid #333',
  boxShadow: '0 4px 10px rgba(0, 191, 255, 0.05)',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
};

const iconStyle = {
  fontSize: '2rem',
  marginBottom: '0.6rem',
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

// 📦 Modal Styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#1e1e1e',
  padding: '2rem',
  borderRadius: '12px',
  textAlign: 'center',
  width: '400px',
  boxShadow: '0 0 20px rgba(0, 191, 255, 0.2)',
};

const headingStyle = {
  color: '#00BFFF',
  marginBottom: '1rem',
};

const uploadBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const fileInputStyle = {
  padding: '0.5rem',
  backgroundColor: '#2e2e2e',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '5px',
};

const buttonStyle = {
  padding: '0.6rem 1rem',
  backgroundColor: '#00BFFF',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#555',
};

export default Home;
