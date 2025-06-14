import React, { useState } from 'react';

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

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

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>📤 Upload Resume for Scoring</h2>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      <br />
      <textarea
        placeholder="Paste the job description here..."
        rows={5}
        style={{ width: '100%', marginTop: '1rem' }}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <br />
      <button onClick={handleUpload} style={{ marginTop: '1rem' }}>
        Upload & Score
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h3>✅ Scoring Result for: {result.filename}</h3>
          <ul>
            <li><strong>Relevance Score:</strong> {result.scores.relevance_score}</li>
            <li><strong>ATS Score:</strong> {result.scores.ats_score}</li>
            <li><strong>Readability Score:</strong> {result.scores.readability_score}</li>
          </ul>
          <details>
            <summary>📄 Resume Excerpt</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{result.excerpt}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
