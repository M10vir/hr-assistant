import React, { useState } from 'react';

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file || !jobDescription) {
      setError('Please upload a resume and enter a job description.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://localhost:8000/resumes/resume/score', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>📤 Upload Resume for Scoring</h2>

      <label htmlFor="resumeFile" style={browseLabelStyle}>📂 Browse Resume</label>
      <input
        id="resumeFile"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {file && <span style={filenameStyle}>{file.name}</span>}

      <textarea
        placeholder="Paste the job description here..."
        rows={5}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        style={textareaStyle}
      />

      <button onClick={handleUpload} style={buttonStyle}>Upload & Score</button>

      {error && <p style={errorStyle}>{error}</p>}

      {result && (
        <div style={resultContainerStyle}>
          <h3 style={resultTitleStyle}>✅ Scoring Result for: {result.filename}</h3>
          <ul style={scoreListStyle}>
            <li><strong>Relevance Score:</strong> {result.scores.relevance_score}</li>
            <li><strong>ATS Score:</strong> {result.scores.ats_score}</li>
            <li><strong>Readability Score:</strong> {result.scores.readability_score}</li>
          </ul>
          <details>
            <summary style={summaryStyle}>📄 Resume Excerpt</summary>
            <div style={excerptWrapper}>
              <pre style={excerptText}>{result.excerpt}</pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

// 🎨 Styling

const containerStyle = {
  backgroundColor: '#161616',
  padding: '2rem 1.5rem',
  borderRadius: '10px',
  maxWidth: '700px',
  width: '100%',
  margin: '0 auto',
  color: '#fff',
  fontFamily: 'sans-serif',
  boxShadow: '0 0 10px #00ffe7',
  border: '1px solid #00ffe7'
};

const headingStyle = {
  fontSize: '1.2rem',
  marginBottom: '1.5rem',
  fontWeight: '600',
  textAlign: 'center'
};

const browseLabelStyle = {
  backgroundColor: '#2c2c2c',
  color: '#fff',
  padding: '0.6rem 1.2rem',
  borderRadius: '6px',
  border: '1px solid #00ffe7',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.95rem',
  display: 'inline-block',
  marginBottom: '0.5rem'
};

const filenameStyle = {
  color: '#aaa',
  fontSize: '0.9rem',
  textAlign: 'center',
  marginBottom: '1rem',
  display: 'block'
};

const textareaStyle = {
  backgroundColor: '#1e1e1e',
  color: '#fff',
  border: '1px solid #00ffe7',
  borderRadius: '6px',
  padding: '0.8rem',
  width: '95.5%',
  fontSize: '0.95rem',
  resize: 'vertical'
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
  transition: 'background-color 0.3s ease',
  marginTop: '1rem'
};

const errorStyle = {
  color: 'tomato',
  marginTop: '1rem',
  fontSize: '0.95rem',
  textAlign: 'center'
};

const resultContainerStyle = {
  marginTop: '2rem',
  padding: '1rem',
  borderRadius: '8px',
  backgroundColor: '#1e1e1e',
  border: '1px solid #00ffe7',
  maxWidth: '100%',
  overflowX: 'auto'
};

const resultTitleStyle = {
  fontSize: '1.1rem',
  color: '#00ffe7',
  marginBottom: '0.8rem',
  textAlign: 'center'
};

const scoreListStyle = {
  listStyleType: 'none',
  paddingLeft: 0,
  color: '#ccc',
  fontSize: '0.95rem'
};

const summaryStyle = {
  color: '#fff',
  fontSize: '0.95rem',
  cursor: 'pointer'
};

const excerptWrapper = {
  marginTop: '0.5rem',
  backgroundColor: '#000',
  padding: '1rem',
  borderRadius: '6px',
  border: '1px solid #333',
  overflowX: 'auto',
  maxWidth: '100%'
};

const excerptText = {
  whiteSpace: 'pre-wrap',
  fontSize: '0.95rem',
  color: '#ccc'
};

export default ResumeUploader;
 
