import { useEffect, useState } from "react";
import { Navbar } from "../components";
import { getTasks, updateTaskStatus } from "../api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = { pending:"#f59e0b", in_progress:"#3b82f6", completed:"#22c55e" };
const NEXT_STATUS = { pending:"in_progress", in_progress:"completed" };

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    const { data } = await getTasks(params);
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [filter]);

  const advance = async (task) => {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    await updateTaskStatus(task.id, next);
    fetchTasks();
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <h2 style={s.heading}>My Tasks</h2>
        <div style={s.filters}>
          {["", "pending", "in_progress", "completed"].map(v => (
            <button key={v} style={{...s.pill, ...(filter===v ? s.pillActive : {})}}
              onClick={() => setFilter(v)}>
              {v || "All"}
            </button>
          ))}
        </div>
        {loading ? <p style={s.muted}>Loading…</p> : tasks.length === 0 ? (
          <p style={s.muted}>No tasks found.</p>
        ) : (
          <div style={s.grid}>
            {tasks.map(t => (
              <div key={t.id} style={s.card}>
                <div style={{...s.badge, background: STATUS_COLORS[t.status]}}>{t.status}</div>
                <h3 style={s.cardTitle}>{t.title}</h3>
                <p style={s.cardDesc}>{t.description || "No description"}</p>
                <p style={s.cardMeta}>Created: {new Date(t.created_at).toLocaleDateString()}</p>
                {NEXT_STATUS[t.status] && (
                  <button style={s.advBtn} onClick={() => advance(t)}>
                    Mark as {NEXT_STATUS[t.status].replace("_", " ")} →
                  </button>
                )}
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
  container: { maxWidth:1100, margin:"0 auto", padding:"32px 24px" },
  heading: { fontSize:24, fontWeight:700, marginBottom:20, color:"#7dd3fc" },
  filters: { display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" },
  pill: { padding:"6px 16px", borderRadius:20, border:"1px solid #334155", background:"#1e293b", color:"#94a3b8", cursor:"pointer", fontSize:13 },
  pillActive: { background:"#3b82f6", color:"#fff", borderColor:"#3b82f6" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 },
  card: { background:"#1e293b", borderRadius:12, padding:20, border:"1px solid #334155", position:"relative" },
  badge: { display:"inline-block", padding:"3px 10px", borderRadius:12, fontSize:11, fontWeight:700, color:"#fff", marginBottom:10, textTransform:"uppercase" },
  cardTitle: { fontSize:16, fontWeight:600, marginBottom:6, color:"#f1f5f9" },
  cardDesc: { fontSize:13, color:"#94a3b8", marginBottom:10 },
  cardMeta: { fontSize:12, color:"#64748b", marginBottom:12 },
  advBtn: { background:"#3b82f6", color:"#fff", border:"none", borderRadius:6, padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:600 },
  muted: { color:"#64748b" },
};
