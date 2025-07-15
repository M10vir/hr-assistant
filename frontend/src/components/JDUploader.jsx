// frontend/src/components/JDUploader.jsx
import React, { useState } from 'react';
import axios from 'axios';

const JDUploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus('');
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('⚠️ Please select a JD file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/jd/upload-jd/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus(`✅ JD uploaded: ${response.data.job_title}`);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('❌ Upload failed. Check console or server.');
    }
  };

  return (
    <div>
      <h2>📄 Upload Job Description</h2>
      <input type="file" accept=".docx" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: '1rem' }}>Upload JD</button>
      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
};

export default JDUploader;
