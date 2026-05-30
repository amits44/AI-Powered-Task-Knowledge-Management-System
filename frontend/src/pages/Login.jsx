import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const u = await login(form.email, form.password);
      navigate(u.role === "admin" ? "/analytics" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>⚡ KnowledgeAI</h1>
        <p style={s.sub}>Task & Knowledge Management</p>
        <form onSubmit={handle}>
          <input style={s.input} type="email" placeholder="Email" value={form.email}
            onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          <input style={s.input} type="password" placeholder="Password" value={form.password}
            onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          {error && <p style={s.err}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f172a" },
  card: { background:"#1e293b", borderRadius:16, padding:"40px 36px", width:360, boxShadow:"0 20px 60px #0008" },
  title: { color:"#7dd3fc", textAlign:"center", marginBottom:4, fontSize:24 },
  sub: { color:"#94a3b8", textAlign:"center", marginBottom:28, fontSize:13 },
  input: { width:"100%", padding:"11px 14px", marginBottom:14, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:14, boxSizing:"border-box" },
  err: { color:"#f87171", fontSize:13, marginBottom:10 },
  btn: { width:"100%", padding:"12px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer" },
};
