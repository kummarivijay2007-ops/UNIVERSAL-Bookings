import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://universal-bookings-server.onrender.com/api";

const MODULES = [
  { icon: "🚖", title: "Rides", desc: "Uber, Ola, Rapido", color: "#E0F4FF", path: "/rides" },
  { icon: "🍔", title: "Food", desc: "Swiggy, Zomato", color: "#E8F8F0", path: "/food" },
  { icon: "🎬", title: "Movies", desc: "BookMyShow", color: "#FFF4E0", path: "/movies" },
  { icon: "✈️", title: "Flights", desc: "IndiGo, Air India", color: "#F0EEFF", path: "/flights" },
  { icon: "🚌", title: "Bus", desc: "RedBus, AbhiBus", color: "#FFE8F0", path: "/buses" },
  { icon: "📦", title: "Shop", desc: "Amazon, Flipkart", color: "#E8F8FF", path: "/shop" },
];

function AuthModal({ defaultTab, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState(defaultTab || "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = tab === "login" ? `${API}/auth/login` : `${API}/auth/register`;
    const body = tab === "login"
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess(tab === "login" ? `Welcome back, ${data.user.name}! 👋` : `Account created! Welcome, ${data.user.name}! 🎉`);
      setTimeout(() => { onLoginSuccess(data.user); onClose(); }, 1500);
    } catch { setError("Cannot connect to server. Is it running?"); }
    setLoading(false);
  };

  const switchTab = (t) => { setTab(t); setError(""); setSuccess(""); setForm({ name: "", email: "", password: "" }); };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        <div style={s.modalLogo}><span>🌐</span><span style={s.modalLogoText}>Universal Bookings</span></div>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === "login" ? s.tabActive : {}) }} onClick={() => switchTab("login")}>Login</button>
          <button style={{ ...s.tab, ...(tab === "register" ? s.tabActive : {}) }} onClick={() => switchTab("register")}>Register</button>
        </div>
        {success ? (
          <div style={s.successBox}>
            <div style={{ fontSize: 44 }}>🎉</div>
            <p style={{ color: "#1a8fe3", fontWeight: 700, fontSize: 16, margin: "8px 0 4px" }}>{success}</p>
            <p style={{ color: "#888", fontSize: 13 }}>Taking you in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            {tab === "register" && (
              <div style={s.fieldGroup}>
                <label style={s.label}>Full Name</label>
                <input style={s.input} name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
            )}
            <div style={s.fieldGroup}>
              <label style={s.label}>Email</label>
              <input style={s.input} name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Password</label>
              <input style={s.input} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            {error && <div style={s.errorBox}>⚠️ {error}</div>}
            <button style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? "Please wait..." : tab === "login" ? "Login →" : "Create Account →"}
            </button>
            <p style={s.switchText}>
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <span style={s.switchLink} onClick={() => switchTab(tab === "login" ? "register" : "login")}>
                {tab === "login" ? "Register" : "Login"}
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Navbar({ user, onAuth, onLogout, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={s.navbar}>
      <div style={s.navInner}>
        <div style={s.navLeft}>
          <span style={{ fontSize: 22 }}>🌐</span>
          <span style={s.navBrand}>Universal Bookings</span>
        </div>
        <div style={s.navRight}>
          {user ? (
            <>
              <span style={s.welcomeText}>👋 {user.name.split(" ")[0]}</span>
              <button style={s.navBtn} onClick={() => navigate("/my-bookings")}>My Bookings</button>
              <button style={s.navBtnOutline} onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <button style={s.navBtnOutline} onClick={() => onAuth("login")}>Login</button>
              <button style={s.navBtn} onClick={() => onAuth("register")}>Register</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function ModuleCard({ mod, user, onAuth, navigate }) {
  const [hovered, setHovered] = useState(false);
  const handleBookNow = () => {
    if (!user) { onAuth("login"); return; }
    if (mod.path) navigate(mod.path);
    else alert(`${mod.title} module coming soon!`);
  };
  return (
    <div
      style={{
        ...s.card, background: mod.color,
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 32px rgba(26,143,227,0.18)" : "0 2px 12px rgba(0,0,0,0.07)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.cardIcon}>{mod.icon}</div>
      <div style={s.cardTitle}>{mod.title}</div>
      <div style={s.cardDesc}>{mod.desc}</div>
      <button style={s.cardBtn} onClick={handleBookNow}>
        {user ? "Book Now" : "Login to Book"}
      </button>
    </div>
  );
}

export default function Home() {
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const openAuth = (type) => setModal(type);
  const closeModal = () => setModal(null);
  const handleLoginSuccess = (userData) => setUser(userData);
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); };

  return (
    <div style={s.page}>
      <Navbar user={user} onAuth={openAuth} onLogout={handleLogout} navigate={navigate} />

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>🚀 All-in-One Booking Platform</div>
          <h1 style={s.heroTitle}>Book Everything,<br /><span style={s.heroHighlight}>In One Place.</span></h1>
          <p style={s.heroSub}>Rides, Food, Movies, Flights, Buses & Shopping —<br />stop switching apps and start booking smarter.</p>
          <div style={s.heroBtns}>
            {user ? (
              <button style={s.heroCta}>Welcome back, {user.name.split(" ")[0]}! Explore Below 👇</button>
            ) : (
              <>
                <button style={s.heroCta} onClick={() => openAuth("register")}>Get Started Free</button>
                <button style={s.heroSecondary} onClick={() => openAuth("login")}>I have an account</button>
              </>
            )}
          </div>
          <div style={s.statsRow}>
            {[{ num: "6+", label: "Services" }, { num: "15+", label: "Providers" }, { num: "1", label: "App" }].map((stat) => (
              <div key={stat.label} style={s.statBox}>
                <div style={s.statNum}>{stat.num}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>What do you want to book today?</h2>
          <p style={s.sectionSub}>Everything you need, all from one dashboard</p>
          <div style={s.modulesGrid}>
            {MODULES.map((mod) => (
              <ModuleCard key={mod.title} mod={mod} user={user} onAuth={openAuth} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section style={{ ...s.section, background: "linear-gradient(160deg, #e8f6ff, #f5faff)" }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>Why Universal Bookings?</h2>
          <div style={s.whyGrid}>
            {[
              { icon: "⚡", title: "Instant Comparison", desc: "Compare prices from all providers side by side in seconds." },
              { icon: "🔒", title: "Secure Payments", desc: "One wallet for all your bookings. Safe and encrypted." },
              { icon: "📋", title: "One History", desc: "All your rides, food orders and tickets in a single place." },
            ].map((item) => (
              <div key={item.title} style={s.whyCard}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0d2137", marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: "#6a8aa8", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={s.ctaBanner}>
          <div style={s.sectionInner}>
            <h2 style={s.ctaTitle}>Ready to simplify your life?</h2>
            <p style={s.ctaSub}>Join thousands of users who book smarter every day.</p>
            <button style={s.ctaBtn} onClick={() => openAuth("register")}>Create Free Account</button>
          </div>
        </section>
      )}

      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={{ color: "#38bdf8", fontWeight: 700 }}>🌐 Universal Bookings</span>
          <span style={{ color: "#4a6a8a", fontSize: 13 }}>© 2026 · Built with ❤️</span>
        </div>
      </footer>

      {modal && <AuthModal defaultTab={modal} onClose={closeModal} onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#F0F8FF", fontFamily: "'Segoe UI', sans-serif", color: "#1a2a3a", width: "100%" },

  // Navbar
  navbar: { background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #d6eeff", position: "sticky", top: 0, zIndex: 100, width: "100%" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navBrand: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 18px)", color: "#1a8fe3" },
  navRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  welcomeText: { fontSize: "clamp(12px, 1.5vw, 14px)", fontWeight: 600, color: "#1a8fe3" },
  navBtn: { padding: "8px 16px", borderRadius: 8, border: "none", background: "#1a8fe3", color: "white", fontWeight: 600, fontSize: "clamp(12px, 1.5vw, 14px)", cursor: "pointer", whiteSpace: "nowrap" },
  navBtnOutline: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #1a8fe3", background: "transparent", color: "#1a8fe3", fontWeight: 600, fontSize: "clamp(12px, 1.5vw, 14px)", cursor: "pointer", whiteSpace: "nowrap" },

  // Hero
  hero: { background: "linear-gradient(160deg, #e8f6ff 0%, #f0f8ff 50%, #e4f5fb 100%)", padding: "clamp(40px, 6vw, 80px) 0 clamp(32px, 5vw, 60px)", width: "100%" },
  heroInner: { maxWidth: 700, margin: "0 auto", padding: "0 24px", textAlign: "center" },
  heroBadge: { display: "inline-block", background: "#d0eeff", color: "#0077c2", padding: "6px 16px", borderRadius: 20, fontSize: "clamp(11px, 1.5vw, 13px)", fontWeight: 600, marginBottom: 20 },
  heroTitle: { fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 16px", color: "#0d2137", letterSpacing: "-1px" },
  heroHighlight: { background: "linear-gradient(90deg, #1a8fe3, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: "clamp(14px, 2vw, 17px)", color: "#4a6a8a", lineHeight: 1.7, margin: "0 0 32px" },
  heroBtns: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 },
  heroCta: { padding: "clamp(10px, 2vw, 14px) clamp(20px, 3vw, 32px)", borderRadius: 10, background: "#1a8fe3", color: "white", border: "none", fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", cursor: "pointer", boxShadow: "0 4px 16px rgba(26,143,227,0.35)" },
  heroSecondary: { padding: "clamp(10px, 2vw, 14px) clamp(20px, 3vw, 32px)", borderRadius: 10, background: "white", color: "#1a8fe3", border: "1.5px solid #b0d8f5", fontWeight: 600, fontSize: "clamp(13px, 1.8vw, 15px)", cursor: "pointer" },
  statsRow: { display: "flex", justifyContent: "center", gap: "clamp(12px, 3vw, 24px)", flexWrap: "wrap" },
  statBox: { background: "white", borderRadius: 14, padding: "clamp(14px, 2vw, 20px) clamp(20px, 3vw, 36px)", textAlign: "center", boxShadow: "0 4px 20px rgba(26,143,227,0.1)", border: "1px solid #d6eeff" },
  statNum: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 900, color: "#1a8fe3" },
  statLabel: { fontSize: "clamp(11px, 1.3vw, 13px)", color: "#6a8aa8", marginTop: 4 },

  // Sections
  section: { padding: "clamp(40px, 6vw, 72px) 0", background: "white", width: "100%" },
  sectionInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
  sectionTitle: { textAlign: "center", fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 800, color: "#0d2137", margin: "0 0 8px" },
  sectionSub: { textAlign: "center", color: "#6a8aa8", fontSize: "clamp(13px, 1.8vw, 15px)", margin: "0 0 36px" },

  // Modules grid — auto-fills based on screen width
  modulesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(180px, 100%), 1fr))", gap: "clamp(12px, 2vw, 20px)" },
  card: { borderRadius: 16, padding: "clamp(18px, 2.5vw, 28px) clamp(14px, 2vw, 20px)", textAlign: "center", cursor: "pointer", transition: "transform 0.25s ease, box-shadow 0.25s ease", border: "1px solid rgba(255,255,255,0.6)" },
  cardIcon: { fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 10 },
  cardTitle: { fontWeight: 800, fontSize: "clamp(14px, 1.8vw, 17px)", color: "#0d2137", marginBottom: 4 },
  cardDesc: { fontSize: "clamp(11px, 1.3vw, 13px)", color: "#6a8aa8", marginBottom: 14 },
  cardBtn: { padding: "7px 18px", borderRadius: 8, background: "#1a8fe3", color: "white", border: "none", fontSize: "clamp(11px, 1.3vw, 13px)", fontWeight: 600, cursor: "pointer" },

  // Why grid
  whyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))", gap: "clamp(14px, 2vw, 24px)" },
  whyCard: { background: "white", borderRadius: 16, padding: "clamp(20px, 3vw, 32px) clamp(16px, 2vw, 24px)", textAlign: "center", boxShadow: "0 2px 16px rgba(26,143,227,0.08)", border: "1px solid #d6eeff" },

  // CTA
  ctaBanner: { padding: "clamp(40px, 6vw, 72px) 0", background: "linear-gradient(135deg, #1a8fe3 0%, #38bdf8 100%)", textAlign: "center", width: "100%" },
  ctaTitle: { fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 900, color: "white", margin: "0 0 10px" },
  ctaSub: { color: "rgba(255,255,255,0.85)", fontSize: "clamp(13px, 1.8vw, 16px)", margin: "0 0 24px" },
  ctaBtn: { padding: "clamp(10px, 2vw, 14px) clamp(24px, 3vw, 36px)", borderRadius: 10, background: "white", color: "#1a8fe3", border: "none", fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", cursor: "pointer" },

  // Footer
  footer: { background: "#0d2137", width: "100%" },
  footerInner: { maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(13,33,55,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 },
  modal: { background: "white", borderRadius: 20, padding: "clamp(24px, 4vw, 36px) clamp(20px, 3vw, 32px)", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(13,33,55,0.25)", position: "relative" },
  closeBtn: { position: "absolute", top: 16, right: 16, background: "#f0f8ff", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 14, cursor: "pointer", color: "#4a6a8a" },
  modalLogo: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20, fontSize: 20 },
  modalLogoText: { fontWeight: 800, fontSize: 16, color: "#1a8fe3" },
  tabs: { display: "flex", background: "#f0f8ff", borderRadius: 10, padding: 4, marginBottom: 24 },
  tab: { flex: 1, padding: "10px", border: "none", background: "transparent", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#6a8aa8" },
  tabActive: { background: "white", color: "#1a8fe3", boxShadow: "0 2px 8px rgba(26,143,227,0.15)" },
  form: { display: "flex", flexDirection: "column", gap: 4 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: 600, color: "#4a6a8a" },
  input: { padding: "11px 14px", borderRadius: 9, border: "1.5px solid #d6eeff", fontSize: 14, outline: "none", color: "#0d2137", width: "100%" },
  errorBox: { background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#cc0000", marginBottom: 8 },
  submitBtn: { padding: "13px", borderRadius: 10, background: "#1a8fe3", color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 },
  switchText: { textAlign: "center", fontSize: 13, color: "#6a8aa8", marginTop: 12 },
  switchLink: { color: "#1a8fe3", fontWeight: 600, cursor: "pointer", textDecoration: "underline" },
  successBox: { textAlign: "center", padding: "20px 0 10px" },
};
