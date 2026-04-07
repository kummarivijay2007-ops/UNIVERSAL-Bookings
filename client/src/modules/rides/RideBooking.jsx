import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

const PROVIDERS = [
  { provider: "Uber", logo: "🚗", options: [{ type: "UberGo", fare: 120, eta: "4 mins", seats: 4 }, { type: "UberPremier", fare: 220, eta: "6 mins", seats: 4 }, { type: "UberXL", fare: 300, eta: "8 mins", seats: 6 }] },
  { provider: "Ola", logo: "🟡", options: [{ type: "Ola Mini", fare: 110, eta: "5 mins", seats: 4 }, { type: "Ola Prime", fare: 200, eta: "7 mins", seats: 4 }, { type: "Ola SUV", fare: 280, eta: "10 mins", seats: 6 }] },
  { provider: "Rapido", logo: "🏍", options: [{ type: "Bike", fare: 60, eta: "3 mins", seats: 1 }, { type: "Auto", fare: 90, eta: "5 mins", seats: 3 }] },
];

function LocationForm({ onSearch, loading }) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const handleSubmit = (e) => { e.preventDefault(); if (pickup.trim() && dropoff.trim()) onSearch(pickup.trim(), dropoff.trim()); };
  return (
    <div style={s.formCard}>
      <h2 style={s.formTitle}>Where are you going?</h2>
      <div style={s.inputRow}><div style={s.dot("green")} /><input style={s.input} placeholder="Pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} required /></div>
      <div style={s.connector} />
      <div style={s.inputRow}><div style={s.dot("red")} /><input style={s.input} placeholder="Drop location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} required /></div>
      <button style={{ ...s.searchBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
        {loading ? "Searching..." : "Search Rides 🔍"}
      </button>
    </div>
  );
}

function ProviderCard({ provider, selectedOption, onSelectOption }) {
  return (
    <div style={s.providerCard}>
      <div style={s.providerHeader}>
        <span style={{ fontSize: "clamp(22px, 3vw, 28px)" }}>{provider.logo}</span>
        <span style={s.providerName}>{provider.provider}</span>
      </div>
      <div style={s.optionsList}>
        {provider.options.map((opt) => {
          const isSelected = selectedOption?.provider === provider.provider && selectedOption?.type === opt.type;
          return (
            <div key={opt.type} style={{ ...s.optionRow, border: isSelected ? "2px solid #1a8fe3" : "2px solid #e8f0f8", background: isSelected ? "#f0f8ff" : "white" }} onClick={() => onSelectOption({ ...opt, provider: provider.provider })}>
              <div>
                <div style={s.optType}>{opt.type}</div>
                <div style={s.optMeta}>⏱ {opt.eta} · 👤 {opt.seats}</div>
              </div>
              <div style={s.optFare}>₹{opt.fare}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingConfirmed({ booking, onBookAgain }) {
  return (
    <div style={s.confirmedBox}>
      <div style={{ fontSize: 52 }}>✅</div>
      <h2 style={s.confirmedTitle}>Ride Booked!</h2>
      <div style={s.confirmedDetails}>
        {[
          { label: "Provider", value: `${booking.provider} · ${booking.rideType}` },
          { label: "From", value: booking.pickup },
          { label: "To", value: booking.dropoff },
          { label: "Fare", value: `₹${booking.estimatedFare}`, highlight: true },
          { label: "Status", value: "✅ Confirmed", green: true },
          { label: "Booking ID", value: booking._id, small: true },
        ].map((row) => (
          <div key={row.label} style={s.detailRow}>
            <span style={s.detailLabel}>{row.label}</span>
            <span style={{ ...s.detailValue, ...(row.highlight ? { color: "#1a8fe3", fontWeight: 800 } : {}), ...(row.green ? { color: "#22c55e", fontWeight: 700 } : {}), ...(row.small ? { fontSize: 11, color: "#aaa" } : {}) }}>{row.value}</span>
          </div>
        ))}
      </div>
      <button style={s.bookAgainBtn} onClick={onBookAgain}>Book Another Ride</button>
    </div>
  );
}

export default function RideBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState("search");
  const [locations, setLocations] = useState({ pickup: "", dropoff: "" });
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleSearch = async (pickup, dropoff) => {
    setLoading(true); setError(""); setSelectedOption(null);
    try {
      const res = await fetch(`${API}/rides/estimates?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to fetch rides"); setLoading(false); return; }
      setLocations({ pickup, dropoff }); setStep("results");
    } catch { setError("Cannot reach server. Make sure backend is running."); }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!selectedOption) return;
    setBookingLoading(true); setError("");
    try {
      const res = await fetch(`${API}/rides/book`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ provider: selectedOption.provider, rideType: selectedOption.type, pickup: locations.pickup, dropoff: locations.dropoff, estimatedFare: selectedOption.fare }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Booking failed"); setBookingLoading(false); return; }
      setBooking(data.data); setStep("confirmed");
    } catch { setError("Booking failed. Please try again."); }
    setBookingLoading(false);
  };

  return (
    <div style={s.page}>
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <span style={s.navTitle}>🚖 Ride Booking</span>
          <span style={s.navSub}>Uber · Ola · Rapido</span>
        </div>
      </nav>
      <div style={s.container}>
        {step === "search" && <LocationForm onSearch={handleSearch} loading={loading} />}
        {step === "results" && (
          <>
            <div style={s.locationBar}>
              <span style={s.locationText}>📍 {locations.pickup}</span>
              <span style={{ color: "#1a8fe3", fontWeight: 800 }}>→</span>
              <span style={s.locationText}>🎯 {locations.dropoff}</span>
              <button style={s.changeBtn} onClick={() => setStep("search")}>Change</button>
            </div>
            <div style={s.providersGrid}>
              {PROVIDERS.map((p) => <ProviderCard key={p.provider} provider={p} selectedOption={selectedOption} onSelectOption={setSelectedOption} />)}
            </div>
            {selectedOption && (
              <div style={s.bookingBar}>
                <div>
                  <div style={s.bookingBarTitle}>{selectedOption.provider} · {selectedOption.type}</div>
                  <div style={s.bookingBarMeta}>⏱ {selectedOption.eta} · ₹{selectedOption.fare}</div>
                </div>
                <button style={{ ...s.confirmBtn, opacity: bookingLoading ? 0.7 : 1 }} onClick={handleBook} disabled={bookingLoading}>
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            )}
          </>
        )}
        {step === "confirmed" && booking && <BookingConfirmed booking={booking} onBookAgain={() => { setStep("search"); setSelectedOption(null); setBooking(null); }} />}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#F0F8FF", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  navbar: { background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #d6eeff", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #1a8fe3", background: "transparent", color: "#1a8fe3", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  navTitle: { fontWeight: 800, fontSize: "clamp(15px, 2.5vw, 18px)", color: "#0d2137" },
  navSub: { fontSize: 13, color: "#6a8aa8", marginLeft: "auto" },
  container: { maxWidth: 1200, margin: "0 auto", padding: "clamp(20px, 3vw, 32px) clamp(16px, 3vw, 24px)", paddingBottom: 100 },
  formCard: { background: "white", borderRadius: 20, padding: "clamp(24px, 4vw, 36px)", maxWidth: 500, margin: "0 auto", boxShadow: "0 4px 24px rgba(26,143,227,0.1)" },
  formTitle: { fontSize: "clamp(17px, 2.5vw, 22px)", fontWeight: 800, color: "#0d2137", margin: "0 0 24px" },
  inputRow: { display: "flex", alignItems: "center", gap: 14 },
  dot: (c) => ({ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, background: c === "green" ? "#22c55e" : "#ef4444", boxShadow: `0 0 0 2px ${c === "green" ? "#22c55e" : "#ef4444"}` }),
  input: { flex: 1, border: "none", outline: "none", fontSize: "clamp(13px, 2vw, 15px)", padding: "10px 0", color: "#0d2137", borderBottom: "1.5px solid #d6eeff", background: "transparent", width: "100%" },
  connector: { height: 20, width: 1, background: "#d6eeff", margin: "8px 0 8px 5px" },
  searchBtn: { marginTop: 28, width: "100%", background: "#1a8fe3", color: "white", border: "none", borderRadius: 12, padding: "clamp(12px, 2vw, 15px)", fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, cursor: "pointer" },
  locationBar: { display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 12, padding: "14px 20px", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", flexWrap: "wrap" },
  locationText: { fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: 600, color: "#0d2137" },
  changeBtn: { marginLeft: "auto", padding: "6px 14px", border: "1.5px solid #1a8fe3", borderRadius: 8, background: "transparent", color: "#1a8fe3", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  providersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "clamp(12px, 2vw, 16px)", marginBottom: 100 },
  providerCard: { background: "white", borderRadius: 16, padding: "clamp(16px, 2.5vw, 20px)", boxShadow: "0 2px 16px rgba(26,143,227,0.08)" },
  providerHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  providerName: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 17px)", color: "#0d2137" },
  optionsList: { display: "flex", flexDirection: "column", gap: 8 },
  optionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "clamp(10px, 1.5vw, 12px) clamp(10px, 1.5vw, 14px)", borderRadius: 10, cursor: "pointer", transition: "all 0.15s" },
  optType: { fontWeight: 700, fontSize: "clamp(12px, 1.8vw, 14px)", color: "#0d2137" },
  optMeta: { fontSize: "clamp(11px, 1.3vw, 12px)", color: "#6a8aa8", marginTop: 3 },
  optFare: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 17px)", color: "#1a8fe3" },
  bookingBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "white", padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 32px)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 -4px 24px rgba(0,0,0,0.1)", zIndex: 200, gap: 12 },
  bookingBarTitle: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 16px)", color: "#0d2137" },
  bookingBarMeta: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#6a8aa8", marginTop: 2 },
  confirmBtn: { padding: "clamp(10px, 1.8vw, 14px) clamp(18px, 3vw, 32px)", borderRadius: 12, background: "#1a8fe3", color: "white", border: "none", fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", cursor: "pointer", whiteSpace: "nowrap" },
  confirmedBox: { background: "white", borderRadius: 20, padding: "clamp(28px, 4vw, 40px) clamp(20px, 3vw, 32px)", textAlign: "center", maxWidth: 480, margin: "0 auto", boxShadow: "0 4px 24px rgba(26,143,227,0.1)" },
  confirmedTitle: { fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, color: "#0d2137", margin: "8px 0 24px" },
  confirmedDetails: { background: "#f7fbff", borderRadius: 12, padding: "20px", marginBottom: 24, textAlign: "left" },
  detailRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #e8f0f8" },
  detailLabel: { fontSize: 13, color: "#6a8aa8", fontWeight: 500 },
  detailValue: { fontSize: 14, color: "#0d2137", fontWeight: 600, textAlign: "right", maxWidth: "60%" },
  bookAgainBtn: { width: "100%", padding: "14px", background: "#1a8fe3", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" },
  errorBox: { background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 10, padding: "12px 16px", color: "#cc0000", fontSize: 14, marginTop: 16 },
};