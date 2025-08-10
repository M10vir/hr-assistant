import React, { useEffect, useState } from 'react';

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState(''); // kept for preview only
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // JD dropdown state
  const [jdList, setJdList] = useState([]);
  const [selectedJdId, setSelectedJdId] = useState('');
  const [jdLoading, setJdLoading] = useState(false);
  const [jdFetchError, setJdFetchError] = useState(null);

  // Load JD options on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('http://localhost:8000/jd/list');
        if (!res.ok) throw new Error(`JD list fetch failed (${res.status})`);
        const data = await res.json();
        if (alive) setJdList(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setJdFetchError(e.message);
      }
    })();
    return () => { alive = false; };
  }, []);

  // When a JD is selected, fetch full text and store in jobDescription (for preview only)
  const handleJdChange = async (e) => {
    const id = e.target.value;
    setSelectedJdId(id);
    setJobDescription('');
    setJdFetchError(null);
    if (!id) return;
    setJdLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/jd/${id}`);
      if (!res.ok) throw new Error(`JD fetch failed (${res.status})`);
      const data = await res.json();
      setJobDescription(data?.description || '');
    } catch (err) {
      setJdFetchError(err.message || 'Failed to fetch JD.');
    } finally {
      setJdLoading(false);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    setError(null);
    setResult(null);

    if (!file) return setError('Please upload a resume.');
    if (!selectedJdId) return setError('Please select a Job Description.');
    // no need to check jobDescription anymore (backend reads JD by id)

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jd_id', selectedJdId); // ✅ send id, not raw JD text

    try {
      const response = await fetch('http://localhost:8000/resumes/resume/score', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>📤 Upload Resume for Scoring</h2>

      {/* File picker */}
      <label htmlFor="resumeFile" style={browseLabelStyle}>📂 Browse Resume</label>
      <input
        id="resumeFile"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {file && <span style={filenameStyle}>{file.name}</span>}

      {/* JD Dropdown (styled to match your textarea border/width/alignment) */}
      <select
        value={selectedJdId}
        onChange={handleJdChange}
        style={selectStyle}   // ← matches textareaStyle border/width
      >
        <option value="">— Select Job Description —</option>
        {jdList.map((jd) => (
          <option key={jd.id} value={jd.id}>{jd.job_title}</option>
        ))}
      </select>

      {/* Optional preview to keep vertical rhythm and clarity */}
      {selectedJdId && (
        <div style={jdPreviewStyle}>
          <pre style={jdPreviewText}>
            {jdLoading
              ? 'Loading JD description…'
              : (jobDescription ? jobDescription.slice(0, 800) + (jobDescription.length > 800 ? '…' : '') : (jdFetchError || 'No description found.'))}
          </pre>
        </div>
      )}

      <button onClick={handleUpload} style={buttonStyle} disabled={jdLoading}>
        Upload & Score
      </button>

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

// 🎨 Styling (unchanged where it affects borders/width/alignment)

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

// Styled to match your original textarea border/width
const selectStyle = {
  backgroundColor: '#1e1e1e',
  color: '#fff',
  border: '1px solid #00ffe7',
  borderRadius: '6px',
  padding: '0.8rem',
  width: '95.5%',
  fontSize: '0.95rem',
  marginBottom: '0.75rem'
};

const jdPreviewStyle = {
  backgroundColor: '#000',
  border: '1px solid #333',
  borderRadius: '6px',
  padding: '0.8rem',
  width: '95.5%',
  maxHeight: '140px',
  overflow: 'auto',
  marginBottom: '0.25rem'
};

const jdPreviewText = {
  whiteSpace: 'pre-wrap',
  fontSize: '0.9rem',
  color: '#ccc',
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
