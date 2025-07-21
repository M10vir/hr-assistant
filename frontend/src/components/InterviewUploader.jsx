import React, { useState } from "react";

const InterviewUploader = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/screening/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>🎙 Upload Interview Recording</h2>

      <label htmlFor="interviewFile" style={browseLabelStyle}>📂 Browse File</label>
      <input
        id="interviewFile"
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ display: "none" }}
      />
      {file && <span style={filenameStyle}>{file.name}</span>}

      <button onClick={handleUpload} disabled={!file} style={buttonStyle}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {result && (
        <div style={resultContainerStyle}>
          <h3 style={subheadingStyle}>📝 Transcript</h3>
          <pre style={transcriptStyle}>{result.text}</pre>

          <h3 style={subheadingStyle}>🎭 Emotion & Tone</h3>
          <ul style={toneListStyle}>
            <li><strong>Primary Tone:</strong> {result.emotion_tone?.primary_tone}</li>
            <li><strong>Confidence Estimate:</strong> {result.emotion_tone?.confidence_estimate}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// 🎨 Unified Styling
const containerStyle = {
  backgroundColor: "#161616",
  padding: "2rem 1.5rem",
  borderRadius: "10px",
  maxWidth: "580px",
  width: "100%",
  margin: "0 auto",
  color: "#fff",
  fontFamily: "sans-serif",
  boxShadow: "0 0 10px #00ffe7",
  border: "1px solid #00ffe7",
};

const headingStyle = {
  fontSize: "1.2rem",
  marginBottom: "1.5rem",
  fontWeight: "600",
  color: "#fff",
  textAlign: "center",
};

const browseLabelStyle = {
  backgroundColor: "#2c2c2c",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  borderRadius: "6px",
  border: "1px solid #00ffe7",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "0.95rem",
  display: "inline-block",
  marginBottom: "0.5rem",
};

const filenameStyle = {
  color: "#aaa",
  fontSize: "0.9rem",
  marginBottom: "1rem",
  display: "block",
  textAlign: "center",
};

const buttonStyle = {
  padding: "0.6rem 1.2rem",
  backgroundColor: "#2c2c2c",
  color: "#fff",
  border: "1px solid #00ffe7",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "0.95rem",
  transition: "background-color 0.3s ease",
  display: "block",
  margin: "1rem auto",
};

const resultContainerStyle = {
  marginTop: "2rem",
  color: "#ccc",
  fontSize: "0.95rem",
};

const subheadingStyle = {
  fontSize: "1.1rem",
  color: "#00ffe7",
  marginBottom: "0.5rem",
  textAlign: "center",
};

const transcriptStyle = {
  whiteSpace: "pre-wrap",
  backgroundColor: "#1e1e1e",
  padding: "1rem",
  borderRadius: "8px",
  border: "1px solid #00ffe7",
  marginBottom: "1rem",
};

const toneListStyle = {
  listStyleType: "none",
  paddingLeft: 0,
  lineHeight: "1.6",
  textAlign: "center",
};

export default InterviewUploader;
 
