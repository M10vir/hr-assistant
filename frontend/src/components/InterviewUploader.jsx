import React, { useState } from "react";

function InterviewUploader() {
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
    <div style={{ padding: "2rem", maxWidth: 700 }}>
      <h2>🎙 Upload Interview Recording</h2>
      <input type="file" accept="audio/*,video/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file}>
        Upload & Analyze
      </button>

      {loading && <p>⏳ Analyzing...</p>}

      {result && (
        <div>
          <h3>📝 Transcript:</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f0f0f0", padding: "1rem" }}>
            {result.text}
          </pre>

          <h3>🎭 Emotion & Tone:</h3>
          <ul>
            <li><strong>Primary Tone:</strong> {result.emotion_tone?.primary_tone}</li>
            <li><strong>Confidence Estimate:</strong> {result.emotion_tone?.confidence_estimate}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default InterviewUploader;
