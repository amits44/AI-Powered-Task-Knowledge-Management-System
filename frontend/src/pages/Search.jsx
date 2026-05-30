import { useState } from "react";
import { Navbar } from "../components";
import { semanticSearch } from "../api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults(null);
    try {
      const { data } = await semanticSearch(query, topK);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <h2 style={s.heading}>🔍 Semantic Search</h2>
        <p style={s.sub}>Ask a question — AI finds the most relevant document chunks.</p>

        <form onSubmit={handleSearch} style={s.form}>
          <input style={s.input} placeholder="e.g. How do I reset my password?" value={query}
            onChange={e => setQuery(e.target.value)} required />
          <div style={s.row}>
            <label style={s.label}>Top results:
              <select style={s.select} value={topK} onChange={e => setTopK(Number(e.target.value))}>
                {[3,5,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {error && <p style={s.err}>{error}</p>}

        {results && (
          <div>
            <p style={s.resultMeta}>
              {results.results.length} result{results.results.length !== 1 ? "s" : ""} for
              <em> "{results.query}"</em>
            </p>
            {results.results.length === 0 ? (
              <p style={s.muted}>No results found. Try uploading and indexing more documents.</p>
            ) : results.results.map((r, i) => (
              <div key={i} style={s.resultCard}>
                <div style={s.resultTop}>
                  <span style={s.docTitle}>📄 {r.document_title}</span>
                  <span style={s.score}>Score: {(r.score * 100).toFixed(1)}%</span>
                </div>
                <p style={s.chunk}>{r.chunk}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:"#0f172a", color:"#e2e8f0" },
  container: { maxWidth:800, margin:"0 auto", padding:"32px 24px" },
  heading: { fontSize:24, fontWeight:700, marginBottom:6, color:"#7dd3fc" },
  sub: { color:"#94a3b8", marginBottom:24, fontSize:14 },
  form: { display:"flex", flexDirection:"column", gap:12, marginBottom:24 },
  input: { padding:"12px 16px", borderRadius:10, border:"1px solid #334155", background:"#1e293b", color:"#e2e8f0", fontSize:15 },
  row: { display:"flex", alignItems:"center", gap:16 },
  label: { color:"#94a3b8", fontSize:13, display:"flex", alignItems:"center", gap:8 },
  select: { padding:"6px 10px", borderRadius:6, border:"1px solid #334155", background:"#1e293b", color:"#e2e8f0", fontSize:13 },
  btn: { padding:"11px 28px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:15 },
  err: { color:"#f87171", marginBottom:16 },
  resultMeta: { color:"#94a3b8", marginBottom:16, fontSize:14 },
  resultCard: { background:"#1e293b", borderRadius:12, padding:20, marginBottom:14, border:"1px solid #334155" },
  resultTop: { display:"flex", justifyContent:"space-between", marginBottom:10, alignItems:"center" },
  docTitle: { color:"#7dd3fc", fontWeight:600, fontSize:14 },
  score: { background:"#22c55e22", color:"#22c55e", border:"1px solid #22c55e44", borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:700 },
  chunk: { color:"#cbd5e1", fontSize:13, lineHeight:1.7 },
  muted: { color:"#64748b" },
};
