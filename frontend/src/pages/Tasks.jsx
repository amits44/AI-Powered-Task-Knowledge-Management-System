import { useEffect, useState } from "react";
import { Navbar } from "../components";
import { getTasks, createTask, updateTaskStatus } from "../api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = { pending:"#f59e0b", in_progress:"#3b82f6", completed:"#22c55e" };

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({ status: "", assigned_to: "" });
  const [form, setForm] = useState({ title:"", description:"", assigned_to:"" });
  const [msg, setMsg] = useState("");

  const fetchTasks = async () => {
    const params = {};
    if (filter.status) params.status = filter.status;
    if (filter.assigned_to) params.assigned_to = filter.assigned_to;
    const { data } = await getTasks(params);
    setTasks(data);
  };

  useEffect(() => { fetchTasks(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTask({ ...form, assigned_to: form.assigned_to ? Number(form.assigned_to) : null });
      setForm({ title:"", description:"", assigned_to:"" });
      setMsg("✅ Task created!");
      fetchTasks();
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.detail || "Error"));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        {isAdmin && (
          <div style={s.formCard}>
            <h3 style={s.heading}>Create Task</h3>
            <form onSubmit={handleCreate} style={s.form}>
              <input style={s.input} placeholder="Title *" value={form.title}
                onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
              <textarea style={{...s.input, height:80, resize:"vertical"}} placeholder="Description"
                value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              <input style={s.input} type="number" placeholder="Assign to User ID"
                value={form.assigned_to} onChange={e => setForm(f => ({...f, assigned_to: e.target.value}))} />
              <button style={s.btn} type="submit">Create Task</button>
              {msg && <p style={{color: msg.startsWith("✅") ? "#22c55e" : "#f87171", marginTop:8}}>{msg}</p>}
            </form>
          </div>
        )}

        <h2 style={s.heading}>All Tasks</h2>
        <div style={s.filterRow}>
          <select style={s.select} value={filter.status} onChange={e => setFilter(f => ({...f, status: e.target.value}))}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input style={{...s.select, width:160}} type="number" placeholder="User ID filter"
            value={filter.assigned_to} onChange={e => setFilter(f => ({...f, assigned_to: e.target.value}))} />
        </div>

        <table style={s.table}>
          <thead>
            <tr>{["ID","Title","Status","Assigned To","Created"].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} style={s.tr}>
                <td style={s.td}>#{t.id}</td>
                <td style={s.td}>{t.title}</td>
                <td style={s.td}>
                  <span style={{...s.badge, background: STATUS_COLORS[t.status]}}>{t.status}</span>
                </td>
                <td style={s.td}>{t.assigned_to || "—"}</td>
                <td style={s.td}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && <p style={s.muted}>No tasks match filters.</p>}
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
  btn: { padding:"10px 20px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, width:"fit-content" },
  filterRow: { display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" },
  select: { padding:"8px 12px", borderRadius:8, border:"1px solid #334155", background:"#1e293b", color:"#e2e8f0", fontSize:13 },
  table: { width:"100%", borderCollapse:"collapse" },
  th: { textAlign:"left", padding:"10px 14px", background:"#1e293b", color:"#7dd3fc", fontSize:13, fontWeight:600 },
  tr: { borderBottom:"1px solid #1e293b" },
  td: { padding:"12px 14px", fontSize:13, color:"#cbd5e1" },
  badge: { padding:"3px 10px", borderRadius:12, fontSize:11, fontWeight:700, color:"#fff", textTransform:"uppercase" },
  muted: { color:"#64748b", marginTop:16 },
};
