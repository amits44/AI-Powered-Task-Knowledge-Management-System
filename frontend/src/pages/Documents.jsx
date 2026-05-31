import { useEffect, useState, useRef } from "react";
import { Navbar } from "../components";
import { getDocuments, uploadDocument } from "../api";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const fetchDocs = async () => {
    const { data } = await getDocuments();
    setDocs(data);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      await uploadDocument(fd);
      setMsg("Uploaded! Indexing in background…");
      setTitle(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      fetchDocs();
    } catch (err) {
      setMsg((err.response?.data?.detail || "Upload failed"));
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <div style={s.formCard}>
          <h3 style={s.heading}>Upload Document</h3>
          <form onSubmit={handleUpload} style={s.form}>
            <input style={s.input} placeholder="Document title *" value={title}
              onChange={e => setTitle(e.target.value)} required />
            <input ref={fileRef} style={s.input} type="file" accept=".txt,.pdf"
              onChange={e => setFile(e.target.files[0])} required />
            <button style={s.btn} type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload & Index"}
            </button>
            {msg && <p style={{color: msg.startsWith("Done") ? "#22c55e" : "#f87171"}}>{msg}</p>}
          </form>
        </div>

        <h2 style={s.heading}>Knowledge Base</h2>
        <div style={s.grid}>
          {docs.map(d => (
            <div key={d.id} style={s.card}>
              <div style={s.topRow}>
                <span style={s.fileType}>.{d.file_type}</span>
                <span style={{...s.indexed, color: d.is_indexed ? "#22c55e" : "#f59e0b"}}>
                  {d.is_indexed ? "✓ Indexed" : "⏳ Indexing"}
                </span>
              </div>
              <h3 style={s.cardTitle}>{d.title}</h3>
              <p style={s.filename}>{d.filename}</p>
              {d.content_preview && (
                <p style={s.preview}>{d.content_preview.slice(0, 120)}…</p>
              )}
              <p style={s.date}>{new Date(d.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
        {docs.length === 0 && <p style={s.muted}>No documents uploaded yet.</p>}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:"#0f172a", color:"#e2e8f0" },
  container: { maxWidth:1100, margin:"0 auto", padding:"32px 24px" },
  formCard: { background:"#1e293b", borderRadius:12, padding:24, marginBottom:32, border:"1px solid #334155" },
  heading: { fontSize:20, fontWeight:700, marginBottom:16, color:"#7dd3fc" },
  form: { display:"flex", flexDirection:"column", gap:10, maxWidth:480 },
  input: { padding:"10px 14px", borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:14 },
  btn: { padding:"10px 20px", background:"#22c55e", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, width:"fit-content" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 },
  card: { background:"#1e293b", borderRadius:12, padding:20, border:"1px solid #334155" },
  topRow: { display:"flex", justifyContent:"space-between", marginBottom:8 },
  fileType: { background:"#334155", color:"#cbd5e1", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 },
  indexed: { fontSize:12, fontWeight:600 },
  cardTitle: { fontSize:15, fontWeight:600, marginBottom:4, color:"#f1f5f9" },
  filename: { fontSize:12, color:"#64748b", marginBottom:8 },
  preview: { fontSize:12, color:"#94a3b8", lineHeight:1.5, marginBottom:8 },
  date: { fontSize:11, color:"#475569" },
  muted: { color:"#64748b", marginTop:16 },
};
