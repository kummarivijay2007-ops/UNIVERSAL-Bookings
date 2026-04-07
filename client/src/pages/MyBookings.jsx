import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://universal-bookings-server.onrender.com";

// ─── Config: all modules ──────────────────────────────────────────────────────
const MODULES = [
  { key: "rides",   label: "Rides",    icon: "🚖", color: "#E0F4FF", accent: "#1a8fe3", endpoint: "/rides/history" },
  { key: "food",    label: "Food",     icon: "🍔", color: "#E8F8F0", accent: "#22c55e", endpoint: "/food/history" },
  { key: "movies",  label: "Movies",   icon: "🎬", color: "#1a1a2e", accent: "#e23744", endpoint: "/movies/history" },
  { key: "flights", label: "Flights",  icon: "✈️", color: "#f0f4ff", accent: "#1a8fe3", endpoint: "/flights/history" },
  { key: "bus",     label: "Bus",      icon: "🚌", color: "#f0fff4", accent: "#22c55e", endpoint: "/buses/history" },
  { key: "shop",    label: "Shopping", icon: "👗", color: "#fff5f9", accent: "#ff6b9d", endpoint: "/shop/history" },
];

// ─── Format date nicely ───────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    confirmed: { bg: "#e8fff0", color: "#22c55e" },
    placed:    { bg: "#e8fff0", color: "#22c55e" },
    pending:   { bg: "#fff8e8", color: "#f59e0b" },
    preparing: { bg: "#fff8e8", color: "#f59e0b" },
    shipped:   { bg: "#e8f4ff", color: "#1a8fe3" },
    delivered: { bg: "#e8fff0", color: "#22c55e" },
    cancelled: { bg: "#fff0f0", color: "#ef4444" },
    "on the way": { bg: "#e8f4ff", color: "#1a8fe3" },
  };
  const style = map[status?.toLowerCase()] || { bg: "#f5f5f5", color: "#888" };
  return (
    <span style={{ background: style.bg, color: style.color, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

// ─── Individual booking cards per module ──────────────────────────────────────

function RideCard({ b }) {
  return (
    <div style={cs.card}>
      <div style={cs.cardTop}>
        <div style={cs.cardLeft}>
          <span style={cs.cardIcon}>🚖</span>
          <div>
            <div style={cs.cardTitle}>{b.provider} · {b.rideType}</div>
            <div style={cs.cardSub}>{formatDate(b.bookedAt)} · {formatTime(b.bookedAt)}</div>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <div style={cs.routeRow}>
        <span style={cs.routeDot("green")} />
        <span style={cs.routeText}>{b.pickup}</span>
        <span style={cs.routeArrow}>→</span>
        <span style={cs.routeDot("red")} />
        <span style={cs.routeText}>{b.dropoff}</span>
      </div>
      <div style={cs.cardBottom}>
        <span style={cs.amount}>₹{b.estimatedFare}</span>
      </div>
    </div>
  );
}

function FoodCard({ b }) {
  return (
    <div style={cs.card}>
      <div style={cs.cardTop}>
        <div style={cs.cardLeft}>
          <span style={cs.cardIcon}>🍔</span>
          <div>
            <div style={cs.cardTitle}>{b.restaurant}</div>
            <div style={cs.cardSub}>{b.provider} · {formatDate(b.orderedAt)} · {formatTime(b.orderedAt)}</div>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <div style={cs.itemsList}>
        {b.items.map((item, i) => (
          <span key={i} style={cs.itemTag}>{item.name} ×{item.quantity}</span>
        ))}
      </div>
      <div style={cs.cardBottom}>
        <span style={cs.cardMeta}>📍 {b.deliveryAddress}</span>
        <span style={cs.amount}>₹{b.totalAmount}</span>
      </div>
    </div>
  );
}

function MovieCard({ b }) {
  return (
    <div style={cs.card}>
      <div style={cs.cardTop}>
        <div style={cs.cardLeft}>
          <span style={cs.cardIcon}>🎬</span>
          <div>
            <div style={cs.cardTitle}>{b.movie}</div>
            <div style={cs.cardSub}>{b.cinema} · {b.city}</div>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <div style={cs.detailsRow}>
        <span style={cs.detailChip}>📅 {b.date}</span>
        <span style={cs.detailChip}>🕐 {b.showtime}</span>
        <span style={cs.detailChip}>💺 {b.seats?.join(", ")}</span>
      </div>
      <div style={cs.cardBottom}>
        <span style={cs.cardMeta}>Booked {formatDate(b.bookedAt)}</span>
        <span style={cs.amount}>₹{b.totalAmount}</span>
      </div>
    </div>
  );
}

function FlightCard({ b }) {
  return (
    <div style={cs.card}>
      <div style={cs.cardTop}>
        <div style={cs.cardLeft}>
          <span style={cs.cardIcon}>✈️</span>
          <div>
            <div style={cs.cardTitle}>
              {b.outbound?.from?.split("(")[0].trim()} → {b.outbound?.to?.split("(")[0].trim()}
              {b.tripType === "roundtrip" && " (Round Trip)"}
            </div>
            <div style={cs.cardSub}>{b.outbound?.airline} · {b.outbound?.flightNo} · {b.seatClass}</div>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <div style={cs.detailsRow}>
        <span style={cs.detailChip}>📅 {b.outbound?.date}</span>
        <span style={cs.detailChip}>🕐 {b.outbound?.departure} → {b.outbound?.arrival}</span>
        <span style={cs.detailChip}>👤 {b.passengers} pax</span>
      </div>
      {b.returnFlight?.airline && (
        <div style={cs.returnRow}>
          <span style={{ fontSize: 11, color: "#6C63FF", fontWeight: 700 }}>↩ Return: </span>
          <span style={{ fontSize: 12, color: "#888" }}>{b.returnFlight.airline} · {b.returnFlight.date}</span>
        </div>
      )}
      <div style={cs.cardBottom}>
        <span style={cs.cardMeta}>Booked {formatDate(b.bookedAt)}</span>
        <span style={cs.amount}>₹{b.totalAmount?.toLocaleString()}</span>
      </div>
    </div>
  );
}

function BusCard({ b }) {
  return (
    <div style={cs.card}>
      <div style={cs.cardTop}>
        <div style={cs.cardLeft}>
          <span style={cs.cardIcon}>🚌</span>
          <div>
            <div style={cs.cardTitle}>{b.from} → {b.to}</div>
            <div style={cs.cardSub}>{b.operator} · {b.busType}</div>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <div style={cs.detailsRow}>
        <span style={cs.detailChip}>📅 {b.date}</span>
        <span style={cs.detailChip}>🕐 {b.departure} → {b.arrival}</span>
        <span style={cs.detailChip}>💺 {b.seats?.join(", ")}</span>
      </div>
      <div style={cs.cardBottom}>
        <span style={cs.cardMeta}>📍 {b.boardingPoint}</span>
        <span style={cs.amount}>₹{b.totalAmount}</span>
      </div>
    </div>
  );
}

function ShopCard({ b }) {
  return (
    <div style={cs.card}>
      <div style={cs.cardTop}>
        <div style={cs.cardLeft}>
          <span style={cs.cardIcon}>👗</span>
          <div>
            <div style={cs.cardTitle}>{b.platform === "amazon" ? "📦 Amazon" : "🛒 Flipkart"} Order</div>
            <div style={cs.cardSub}>{b.items?.length} item{b.items?.length > 1 ? "s" : ""} · {formatDate(b.orderedAt)}</div>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <div style={cs.itemsList}>
        {b.items?.map((item, i) => (
          <span key={i} style={cs.itemTag}>{item.image} {item.name} ({item.size}) ×{item.quantity}</span>
        ))}
      </div>
      <div style={cs.cardBottom}>
        <span style={cs.cardMeta}>📍 {b.deliveryAddress}</span>
        <span style={cs.amount}>₹{b.totalAmount}</span>
      </div>
    </div>
  );
}

// Render the right card based on module key
function BookingCard({ moduleKey, booking }) {
  switch (moduleKey) {
    case "rides":   return <RideCard b={booking} />;
    case "food":    return <FoodCard b={booking} />;
    case "movies":  return <MovieCard b={booking} />;
    case "flights": return <FlightCard b={booking} />;
    case "bus":     return <BusCard b={booking} />;
    case "shop":    return <ShopCard b={booking} />;
    default:        return null;
  }
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ allBookings }) {
  const total = Object.values(allBookings).flat().length;
  const totalSpent = Object.values(allBookings).flat().reduce((sum, b) => {
    return sum + (b.estimatedFare || b.totalAmount || 0);
  }, 0);
  const mostUsed = MODULES.reduce((best, m) => {
    const count = allBookings[m.key]?.length || 0;
    return count > (allBookings[best]?.length || 0) ? m.key : best;
  }, "rides");
  const mostUsedModule = MODULES.find((m) => m.key === mostUsed);

  return (
    <div style={s.statsRow}>
      {[
        { icon: "📋", num: total, label: "Total Bookings" },
        { icon: "💰", num: `₹${totalSpent.toLocaleString()}`, label: "Total Spent" },
        { icon: mostUsedModule?.icon, num: mostUsedModule?.label, label: "Most Used" },
        { icon: "✅", num: MODULES.filter((m) => (allBookings[m.key]?.length || 0) > 0).length, label: "Services Used" },
      ].map((stat) => (
        <div key={stat.label} style={s.statBox}>
          <div style={s.statIcon}>{stat.icon}</div>
          <div style={s.statNum}>{stat.num}</div>
          <div style={s.statLabel}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main MyBookings Page ─────────────────────────────────────────────────────
export default function MyBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [allBookings, setAllBookings] = useState({
    rides: [], food: [], movies: [], flights: [], bus: [], shop: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all 6 modules in parallel using Promise.all
      const results = await Promise.all(
        MODULES.map((m) =>
          fetch(`${API}${m.endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => ({ key: m.key, data: d.success ? d.data : [] }))
            .catch(() => ({ key: m.key, data: [] }))
        )
      );

      const combined = {};
      results.forEach(({ key, data }) => { combined[key] = data; });
      setAllBookings(combined);
    } catch {
      setError("Failed to load bookings. Please try again.");
    }
    setLoading(false);
  };

  // Get bookings for active tab
  const getActiveBookings = () => {
    if (activeTab === "all") {
      // Merge all bookings and sort by date (newest first)
      return MODULES.flatMap((m) =>
        (allBookings[m.key] || []).map((b) => ({ ...b, _moduleKey: m.key }))
      ).sort((a, b) => {
        const dateA = new Date(a.bookedAt || a.orderedAt || 0);
        const dateB = new Date(b.bookedAt || b.orderedAt || 0);
        return dateB - dateA;
      });
    }
    return (allBookings[activeTab] || []).map((b) => ({ ...b, _moduleKey: activeTab }));
  };

  const activeBookings = getActiveBookings();
  const totalCount = Object.values(allBookings).flat().length;

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <span style={s.navTitle}>📋 My Bookings</span>
          <span style={s.navUser}>👤 {user.name?.split(" ")[0]}</span>
        </div>
      </nav>

      <div style={s.container}>

        {loading ? (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <p style={{ color: "#aaa", marginTop: 12 }}>Loading all your bookings...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            {totalCount > 0 && <StatsBar allBookings={allBookings} />}

            {/* Tabs */}
            <div style={s.tabsWrapper}>
              <div style={s.tabs}>
                {/* All tab */}
                <button
                  style={{ ...s.tab, ...(activeTab === "all" ? s.tabActive : {}) }}
                  onClick={() => setActiveTab("all")}
                >
                  <span>🗂️</span>
                  <span>All</span>
                  <span style={{ ...s.tabCount, background: activeTab === "all" ? "rgba(255,255,255,0.3)" : "#f0f0f0", color: activeTab === "all" ? "white" : "#888" }}>
                    {totalCount}
                  </span>
                </button>

                {/* Module tabs */}
                {MODULES.map((m) => {
                  const count = allBookings[m.key]?.length || 0;
                  const isActive = activeTab === m.key;
                  return (
                    <button
                      key={m.key}
                      style={{
                        ...s.tab,
                        ...(isActive ? { ...s.tabActive, background: m.accent } : {}),
                      }}
                      onClick={() => setActiveTab(m.key)}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                      <span style={{ ...s.tabCount, background: isActive ? "rgba(255,255,255,0.3)" : "#f0f0f0", color: isActive ? "white" : "#888" }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bookings list */}
            {activeBookings.length === 0 ? (
              <div style={s.emptyBox}>
                <div style={s.emptyIcon}>
                  {activeTab === "all" ? "📭" : MODULES.find((m) => m.key === activeTab)?.icon}
                </div>
                <h3 style={s.emptyTitle}>No bookings yet</h3>
                <p style={s.emptyDesc}>
                  {activeTab === "all"
                    ? "Start booking rides, food, movies and more!"
                    : `You haven't booked any ${MODULES.find((m) => m.key === activeTab)?.label.toLowerCase()} yet.`}
                </p>
                <button
                  style={s.emptyBtn}
                  onClick={() => navigate(
                    activeTab === "all" ? "/" :
                    activeTab === "rides" ? "/rides" :
                    activeTab === "food" ? "/food" :
                    activeTab === "movies" ? "/movies" :
                    activeTab === "flights" ? "/flights" :
                    activeTab === "bus" ? "/bus" : "/shop"
                  )}
                >
                  {activeTab === "all" ? "Explore Services" : `Book ${MODULES.find((m) => m.key === activeTab)?.label}`} →
                </button>
              </div>
            ) : (
              <div>
                <div style={s.listHeader}>
                  <span style={s.listCount}>{activeBookings.length} booking{activeBookings.length > 1 ? "s" : ""}</span>
                  <button style={s.refreshBtn} onClick={fetchAllBookings}>🔄 Refresh</button>
                </div>
                <div style={s.bookingsList}>
                  {activeBookings.map((booking, i) => (
                    <div key={booking._id || i}>
                      {/* Show module label on "All" tab */}
                      {activeTab === "all" && (
                        <div style={{
                          ...s.moduleTag,
                          background: MODULES.find((m) => m.key === booking._moduleKey)?.color,
                          color: MODULES.find((m) => m.key === booking._moduleKey)?.accent,
                        }}>
                          {MODULES.find((m) => m.key === booking._moduleKey)?.icon}{" "}
                          {MODULES.find((m) => m.key === booking._moduleKey)?.label}
                        </div>
                      )}
                      <BookingCard moduleKey={booking._moduleKey} booking={booking} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <div style={s.errorBox}>⚠️ {error}</div>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Card Styles (shared across all card types) ───────────────────────────────
const cs = {
  card: { background: "white", borderRadius: 14, padding: "clamp(14px, 2vw, 18px)", marginBottom: 2, border: "1px solid #f0f4f8" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  cardLeft: { display: "flex", alignItems: "center", gap: 10 },
  cardIcon: { fontSize: "clamp(24px, 3.5vw, 32px)", flexShrink: 0 },
  cardTitle: { fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", color: "#0d2137" },
  cardSub: { fontSize: "clamp(11px, 1.4vw, 12px)", color: "#aaa", marginTop: 2 },
  routeRow: { display: "flex", alignItems: "center", gap: 6, background: "#f8faff", borderRadius: 8, padding: "8px 12px", marginBottom: 10, flexWrap: "wrap" },
  routeDot: (c) => ({ width: 8, height: 8, borderRadius: "50%", background: c === "green" ? "#22c55e" : "#ef4444", flexShrink: 0 }),
  routeText: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#0d2137", fontWeight: 500 },
  routeArrow: { color: "#1a8fe3", fontWeight: 700, fontSize: 14 },
  detailsRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  detailChip: { fontSize: "clamp(10px, 1.3vw, 12px)", background: "#f5f8ff", color: "#4a6a8a", padding: "4px 8px", borderRadius: 6, fontWeight: 500 },
  itemsList: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  itemTag: { fontSize: "clamp(10px, 1.3vw, 12px)", background: "#f5f8ff", color: "#4a6a8a", padding: "3px 8px", borderRadius: 6 },
  returnRow: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8 },
  cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #f0f4f8" },
  cardMeta: { fontSize: "clamp(10px, 1.3vw, 12px)", color: "#aaa", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  amount: { fontWeight: 900, fontSize: "clamp(14px, 2vw, 18px)", color: "#1a8fe3" },
};

// ─── Page Styles ──────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#f5f8ff", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  navbar: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #d6eeff", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #1a8fe3", background: "transparent", color: "#1a8fe3", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  navTitle: { fontWeight: 800, fontSize: "clamp(15px, 2.5vw, 18px)", color: "#0d2137" },
  navUser: { marginLeft: "auto", fontSize: 14, color: "#6a8aa8", fontWeight: 600 },
  container: { maxWidth: 900, margin: "0 auto", padding: "clamp(20px, 3vw, 32px) clamp(16px, 3vw, 24px)" },

  // Stats
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))", gap: "clamp(10px, 2vw, 16px)", marginBottom: 28 },
  statBox: { background: "white", borderRadius: 14, padding: "clamp(14px, 2.5vw, 20px)", textAlign: "center", boxShadow: "0 2px 12px rgba(26,143,227,0.08)", border: "1px solid #d6eeff" },
  statIcon: { fontSize: "clamp(22px, 3vw, 28px)", marginBottom: 6 },
  statNum: { fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 900, color: "#1a8fe3" },
  statLabel: { fontSize: "clamp(10px, 1.3vw, 12px)", color: "#6a8aa8", marginTop: 4 },

  // Tabs
  tabsWrapper: { overflowX: "auto", marginBottom: 24, paddingBottom: 4 },
  tabs: { display: "flex", gap: 6, minWidth: "max-content" },
  tab: { display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "none", background: "white", color: "#6a8aa8", fontWeight: 600, fontSize: "clamp(12px, 1.5vw, 13px)", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", whiteSpace: "nowrap", transition: "all 0.15s" },
  tabActive: { background: "#1a8fe3", color: "white", boxShadow: "0 4px 12px rgba(26,143,227,0.3)" },
  tabCount: { padding: "1px 7px", borderRadius: 10, fontSize: 11, fontWeight: 700 },

  // List header
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  listCount: { fontSize: 14, fontWeight: 700, color: "#6a8aa8" },
  refreshBtn: { padding: "6px 14px", border: "1.5px solid #d6eeff", borderRadius: 8, background: "white", color: "#6a8aa8", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  bookingsList: { display: "flex", flexDirection: "column", gap: 12 },
  moduleTag: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, marginBottom: 6 },

  // Empty state
  emptyBox: { background: "white", borderRadius: 20, padding: "clamp(40px, 6vw, 72px) 24px", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
  emptyIcon: { fontSize: "clamp(48px, 7vw, 64px)", marginBottom: 16 },
  emptyTitle: { fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 800, color: "#0d2137", margin: "0 0 8px" },
  emptyDesc: { color: "#6a8aa8", fontSize: "clamp(13px, 1.8vw, 15px)", margin: "0 0 24px" },
  emptyBtn: { padding: "clamp(10px, 1.8vw, 13px) clamp(20px, 3vw, 28px)", borderRadius: 10, background: "#1a8fe3", color: "white", border: "none", fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", cursor: "pointer" },

  // Loading / error
  loadingBox: { textAlign: "center", padding: "80px 0" },
  spinner: { width: 40, height: 40, borderRadius: "50%", border: "4px solid #d6eeff", borderTop: "4px solid #1a8fe3", margin: "0 auto", animation: "spin 0.8s linear infinite" },
  errorBox: { background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 10, padding: "12px 16px", color: "#cc0000", fontSize: 14, marginTop: 16 },
};
