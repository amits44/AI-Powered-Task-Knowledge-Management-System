import { useEffect, useState } from "react";
import { Navbar } from "../components";
import { getAnalytics } from "../api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics()
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.detail || "Failed to load analytics"));
  }, []);

  if (error) return <div style={s.page}><Navbar /><p style={{color:"#f87171",padding:32}}>{error}</p></div>;
  if (!data) return <div style={s.page}><Navbar /><p style={{color:"#64748b",padding:32}}>Loading…</p></div>;

  const { tasks, documents, top_search_queries } = data;
  const completionRate = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <h2 style={s.heading}>📊 Analytics</h2>

        <div style={s.statsGrid}>
          <StatCard label="Total Tasks" value={tasks.total} color="#3b82f6" />
          <StatCard label="Completed" value={tasks.completed} color="#22c55e" />
          <StatCard label="Pending" value={tasks.pending} color="#f59e0b" />
          <StatCard label="In Progress" value={tasks.in_progress} color="#a855f7" />
          <StatCard label="Documents" value={documents.total} color="#7dd3fc" />
          <StatCard label="Completion Rate" value={`${completionRate}%`} color="#22c55e" />
        </div>

        <div style={s.progressCard}>
          <h3 style={s.subHeading}>Task Completion</h3>
          <div style={s.barBg}>
            <div style={{...s.barFill, width:`${completionRate}%`}} />
          </div>
          <div style={s.barLabels}>
            <span style={{color:"#22c55e"}}>Completed: {tasks.completed}</span>
            <span style={{color:"#f59e0b"}}>Pending: {tasks.pending}</span>
            <span style={{color:"#a855f7"}}>In Progress: {tasks.in_progress}</span>
          </div>
        </div>

        <div style={s.queryCard}>
          <h3 style={s.subHeading}>Top Search Queries</h3>
          {top_search_queries.length === 0 ? (
            <p style={s.muted}>No searches yet.</p>
          ) : top_search_queries.map((q, i) => (
            <div key={i} style={s.queryRow}>
              <span style={s.rank}>#{i+1}</span>
              <span style={s.queryText}>{q.query}</span>
              <span style={s.count}>{q.count}×</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{...sc.card, borderTop:`3px solid ${color}`}}>
      <div style={{...sc.value, color}}>{value}</div>
      <div style={sc.label}>{label}</div>
    </div>
  );
}

const sc = {
  card: { background:"#1e293b", borderRadius:12, padding:"20px 24px", textAlign:"center" },
  value: { fontSize:36, fontWeight:800, lineHeight:1 },
  label: { color:"#94a3b8", fontSize:13, marginTop:6, fontWeight:500 },
};

const s = {
  page: { minHeight:"100vh", background:"#0f172a", color:"#e2e8f0" },
  container: { maxWidth:1000, margin:"0 auto", padding:"32px 24px" },
  heading: { fontSize:24, fontWeight:700, marginBottom:24, color:"#7dd3fc" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14, marginBottom:28 },
  progressCard: { background:"#1e293b", borderRadius:12, padding:24, marginBottom:20, border:"1px solid #334155" },
  subHeading: { fontSize:16, fontWeight:600, marginBottom:14, color:"#f1f5f9" },
  barBg: { height:16, background:"#334155", borderRadius:8, overflow:"hidden", marginBottom:10 },
  barFill: { height:"100%", background:"linear-gradient(90deg,#22c55e,#16a34a)", borderRadius:8, transition:"width 0.8s ease" },
  barLabels: { display:"flex", gap:24, fontSize:13 },
  queryCard: { background:"#1e293b", borderRadius:12, padding:24, border:"1px solid #334155" },
  queryRow: { display:"flex", alignItems:"center", gap:14, padding:"10px 0", borderBottom:"1px solid #0f172a" },
  rank: { color:"#64748b", fontWeight:700, width:28, fontSize:13 },
  queryText: { flex:1, color:"#cbd5e1", fontSize:14 },
  count: { background:"#3b82f622", color:"#7dd3fc", border:"1px solid #3b82f644", borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:700 },
  muted: { color:"#64748b" },
};
