import { useEffect, useState } from "react";
import { Navbar } from "../components";
import { getUsers, createUser, deleteUser } from "../api";

const ROLE_COLORS = { admin: "#a855f7", user: "#3b82f6" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role_id: 2 });
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 3500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUser({ ...form, role_id: Number(form.role_id) });
      setForm({ name: "", email: "", password: "", role_id: 2 });
      flash("User created successfully!");
      fetchUsers();
    } catch (err) {
      flash(err.response?.data?.detail || "Failed to create user", false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      flash(`User "${userName}" deleted.`);
      fetchUsers();
    } catch (err) {
      flash(err.response?.data?.detail || "Failed to delete user", false);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>

        {/* Create User Form */}
        <div style={s.formCard}>
          <h3 style={s.heading}>➕ Create User Account</h3>
          <form onSubmit={handleCreate} style={s.form}>
            <div style={s.row}>
              <input
                style={s.input}
                placeholder="Full name *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                style={s.input}
                type="email"
                placeholder="Email address *"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div style={s.row}>
              <input
                style={s.input}
                type="password"
                placeholder="Password *"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <select
                style={s.select}
                value={form.role_id}
                onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
              >
                <option value={2}>User</option>
                <option value={1}>Admin</option>
              </select>
            </div>
            <div style={s.formFooter}>
              <button style={s.btn} type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create Account"}
              </button>
              {msg.text && (
                <p style={{ color: msg.ok ? "#22c55e" : "#f87171", fontSize: 13, margin: 0 }}>
                  {msg.text}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div style={s.tableCard}>
          <h2 style={s.heading}>👥 All Users ({users.length})</h2>
          {loading ? (
            <p style={s.muted}>Loading…</p>
          ) : users.length === 0 ? (
            <p style={s.muted}>No users yet.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["ID", "Name", "Email", "Role", "Action"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={s.tr}>
                    <td style={s.td}>#{u.id}</td>
                    <td style={s.td}>{u.name}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: ROLE_COLORS[u.role] }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.deleteBtn}
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={deletingId === u.id}
                      >
                        {deletingId === u.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  container: { maxWidth: 1000, margin: "0 auto", padding: "32px 24px" },
  formCard: { background: "#1e293b", borderRadius: 12, padding: 24, marginBottom: 28, border: "1px solid #334155" },
  tableCard: { background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #334155" },
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 18, color: "#7dd3fc" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  row: { display: "flex", gap: 12, flexWrap: "wrap" },
  input: { flex: 1, minWidth: 180, padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14 },
  select: { flex: 1, minWidth: 140, padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14 },
  formFooter: { display: "flex", alignItems: "center", gap: 16 },
  btn: { padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 14px", background: "#0f172a", color: "#7dd3fc", fontSize: 13, fontWeight: 600 },
  tr: { borderBottom: "1px solid #0f172a" },
  td: { padding: "12px 14px", fontSize: 13, color: "#cbd5e1" },
  badge: { padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" },
  deleteBtn: { background: "#ef444422", color: "#f87171", border: "1px solid #ef444444", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 },
  muted: { color: "#64748b" },
};
