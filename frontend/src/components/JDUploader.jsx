import React, { useState } from 'react';
import axios from 'axios';

const JDUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/jd/upload-jd/', formData);
      alert('JD uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload JD.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>📄 Upload Job Description</h2>

      <div style={uploadBoxStyle}>
        <label htmlFor="jdFile" style={browseLabelStyle}>
          📂 Browse JD
        </label>
        <input
          id="jdFile"
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {file && <span style={filenameStyle}>{file.name}</span>}

        <button onClick={handleUpload} style={buttonStyle}>Upload JD</button>
      </div>
    </div>
  );
};

// ✅ Unified font + layout styling for modal consistency

const containerStyle = {
  backgroundColor: '#161616',
  padding: '2rem 1.5rem',
  borderRadius: '10px',
  maxWidth: '520px',
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
  color: '#fff',
  textAlign: 'center'
};

const uploadBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem'
};

const browseLabelStyle = {
  backgroundColor: '#2c2c2c',
  color: '#fff',
  padding: '0.6rem 1.2rem',
  borderRadius: '6px',
  border: '1px solid #00ffe7',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.95rem'
};

const filenameStyle = {
  color: '#aaa',
  fontSize: '0.9rem',
  textAlign: 'center'
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
  transition: 'background-color 0.3s ease'
};

export default JDUploader;
 
