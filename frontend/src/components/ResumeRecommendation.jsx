import React, { useEffect, useMemo, useState } from "react";

/* ---------- Helpers ---------- */
const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

const num = (v) => (v === null || v === undefined ? "—" : v);

/* ---------- Component ---------- */
const ResumeRecommendation = () => {
  const [jdList, setJdList] = useState([]);
  const [jdId, setJdId] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState("matches"); // 'matches' | 'history'
  const [title, setTitle] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchJSON("http://localhost:8000/jd/list");
        if (!alive) return;
        setJdList(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length && !jdId) {
          setJdId(data[0].id);
        }
      } catch (e) {
        if (alive) setErr(e.message || "Failed loading JDs");
      }
    })();
    return () => { alive = false; };
  }, []);

  const selectedJDTitle = useMemo(
    () => jdList.find((j) => j.id === Number(jdId))?.job_title || "",
    [jdId, jdList]
  );

  const loadMatches = async () => {
    if (!jdId) return;
    setErr(null);
    setLoading(true);
    try {
      const data = await fetchJSON(
        `http://localhost:8000/recommend/recommendations?jd_id=${jdId}&limit=${limit}`
      );
      setRows(data?.recommendations || []);
      setTitle(data?.job_title || selectedJDTitle);
      setTab("matches");
    } catch (e) {
      setErr(e.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const saveSnapshot = async () => {
    if (!jdId || !rows.length) return;
    setErr(null);
    try {
      await fetchJSON("http://localhost:8000/recommend/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd_id: Number(jdId),
          candidate_ids: rows.map((r) => r.candidate_id).slice(0, limit),
        }),
      });
      alert("Snapshot saved ✅");
    } catch (e) {
      setErr(e.message || "Failed to save snapshot");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={container}>
      <h2 style={titleH2}>🤖 AI Recommendations</h2>

      <div style={toolbar}>
        <select
          value={jdId}
          onChange={(e) => setJdId(Number(e.target.value))}
          style={select}
        >
          {jdList.map((j) => (
            <option key={j.id} value={j.id}>
              {j.job_title}
            </option>
          ))}
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          style={selectNarrow}
        >
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <button onClick={loadMatches} style={btn}>Generate</button>
        <button onClick={saveSnapshot} style={btnAlt}>Save Snapshot</button>
      </div>

      <div style={jdHeading}>
        JD: <span style={{ color: "#00ffe7" }}>{title || selectedJDTitle || "—"}</span>
      </div>

      <div style={tabRow}>
        <button
          style={{ ...tabBtn, ...(tab === "matches" ? tabBtnActive : {}) }}
          onClick={() => setTab("matches")}
        >
          Top Matches
        </button>
        <button
          style={{ ...tabBtn, ...(tab === "history" ? tabBtnActive : {}) }}
          onClick={() => setTab("history")}
        >
          History
        </button>
      </div>

      {err && <p style={errorText}>Error: {err}</p>}
      {loading && <p style={infoText}>Loading recommendations…</p>}

      {!loading && tab === "matches" && (
        <div style={tableWrap}>
          <table style={table}>
            {/* Lock widths so every row lines up perfectly */}
            <colgroup>
              <col style={{ width: "60px" }} />
              <col style={{ width: "220px" }} />
              <col style={{ width: "320px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "280px" }} />
              <col style={{ width: "160px" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={thLeft}>Candidate</th>
                <th style={thLeft}>Filename</th>
                <th style={th}>Relevance</th>
                <th style={th}>ATS</th>
                <th style={th}>Readability</th>
                <th style={thLeft}>Email</th>
                <th style={th}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.candidate_id || i} style={tr}>
                  <td style={tdNum}>{i + 1}</td>
                  <td style={tdClipLeft} title={r.candidate_name}>
                    {r.candidate_name || "—"}
                  </td>
                  <td style={tdClipLeft} title={r.filename}>
                    {r.filename}
                  </td>
                  <td style={tdScore}>{num(r.relevance_score)}</td>
                  <td style={tdScore}>{num(r.ats_score)}</td>
                  <td style={tdScore}>{num(r.readability_score)}</td>
                  <td style={tdClipLeft} title={r.email}>
                    {r.email || "—"}
                  </td>
                  <td style={tdNum}>{r.phone_number || "—"}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} style={tdEmpty}>
                    No matches yet. Choose a JD and click <b>Generate</b>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "history" && (
        <div style={historyBox}>
          <p style={infoText}>Snapshot history UI coming next 🔜</p>
        </div>
      )}
    </div>
  );
};

/* ---------- Styles (compact & consistent) ---------- */
const container = {
  background: "#161616",
  color: "#fff",
  border: "1px solid #00ffe7",
  boxShadow: "0 0 10px #00ffe7",
  borderRadius: 12,
  padding: "1.25rem",
  maxWidth: 1300,
  margin: "0 auto",
  fontFamily: "Inter, system-ui, sans-serif",
};

const titleH2 = { textAlign: "left", margin: "0 0 1rem 0" };

const toolbar = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 10,
};

const select = {
  background: "#1e1e1e",
  color: "#fff",
  border: "1px solid #00ffe7",
  borderRadius: 8,
  padding: "0.5rem 0.75rem",
  minWidth: 280,
};

const selectNarrow = { ...select, minWidth: 80, textAlign: "center" };

const btn = {
  background: "#00ffe7",
  color: "#111",
  border: "1px solid #00ffe7",
  borderRadius: 8,
  padding: "0.5rem 0.9rem",
  fontWeight: 700,
  cursor: "pointer",
};

const btnAlt = {
  ...btn,
  background: "#1e1e1e",
  color: "#fff",
};

const jdHeading = {
  textAlign: "center",
  padding: "0.5rem 0.25rem",
  marginBottom: 8,
  opacity: 0.9,
};

const tabRow = { display: "flex", gap: 10, marginBottom: 12 };
const tabBtn = {
  background: "#1e1e1e",
  color: "#fff",
  border: "1px solid #00ffe7",
  borderRadius: 8,
  padding: "0.4rem 0.8rem",
  cursor: "pointer",
};
const tabBtnActive = { background: "#00ffe7", color: "#111" };

const tableWrap = {
  width: "100%",
  overflowX: "auto",
  border: "1px solid #00ffe7",
  borderRadius: 8,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed", // <-- prevents drift, locks column grid
  background: "#0e0e0e",
};

const thBase = {
  borderBottom: "1px solid #00ffe7",
  padding: "10px 8px",
  fontWeight: 700,
  color: "#00ffe7",
  whiteSpace: "nowrap",
  textAlign: "center",
};
const th = { ...thBase };
const thLeft = { ...thBase, textAlign: "left" };

const tr = {
  borderTop: "1px solid #00ffe7",
};

const td = {
  padding: "10px 8px",
  color: "#ddd",
  verticalAlign: "middle",
  borderTop: "1px solid #00ffe7",
};

const tdNum = { ...td, textAlign: "center", whiteSpace: "nowrap" };

const tdScore = {
  ...tdNum,
  fontWeight: 800,
};

const tdClipLeft = {
  ...td,
  textAlign: "left",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis", // prevents long text from pushing columns
};

const tdEmpty = {
  ...td,
  textAlign: "center",
  color: "#aaa",
};

const infoText = {
  color: "#ccc",
  margin: "0.75rem 0",
};

const errorText = {
  color: "salmon",
  margin: "0.75rem 0",
};

const historyBox = {
  border: "1px dashed #00ffe7",
  borderRadius: 8,
  padding: "1rem",
  textAlign: "center",
};

export default ResumeRecommendation; 
