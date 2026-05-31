import { Navigate, Link } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>⚡ KnowledgeAI</span>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/tasks" style={styles.link}>Tasks</Link>
        <Link to="/search" style={styles.link}>Search</Link>
        {isAdmin && <Link to="/documents" style={styles.link}>Documents</Link>}
        {isAdmin && <Link to="/users" style={styles.link}>Users</Link>}
        {isAdmin && <Link to="/analytics" style={styles.link}>Analytics</Link>}
        <span style={styles.user}>{user?.name} ({user?.role})</span>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 24px", background:"#1e293b", color:"#fff", position:"sticky", top:0, zIndex:100 },
  brand: { fontWeight:700, fontSize:18, color:"#7dd3fc" },
  links: { display:"flex", alignItems:"center", gap:20 },
  link: { color:"#cbd5e1", textDecoration:"none", fontSize:14, fontWeight:500 },
  user: { color:"#94a3b8", fontSize:13 },
  logoutBtn: { background:"#ef4444", color:"#fff", border:"none", borderRadius:6, padding:"6px 14px", cursor:"pointer", fontSize:13 },
};
