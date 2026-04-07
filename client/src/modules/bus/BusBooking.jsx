import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://universal-bookings-server.onrender.com";

const CITIES = [
  "Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi",
  "Pune", "Vijayawada", "Vizag", "Tirupati", "Warangal",
  "Guntur", "Nellore", "Kochi", "Coimbatore", "Mysore",
];

// Generate visual bus seat layout
// Bus has Lower (L) and Upper (U) deck for sleepers
// Each row has 2 seats on left, 1 aisle, 1 seat on right (for sleeper)
const generateBusSeats = (busType) => {
  const isSleeper = busType.includes("Sleeper");
  const isSeater = busType.includes("Seater");

  // Pre-booked seats (random)
  const bookedLower = ["L2", "L5", "L8", "L11", "L14"];
  const bookedUpper = ["U1", "U4", "U7", "U10"];
  const bookedSeater = ["S3", "S6", "S9", "S12", "S15"];

  if (isSeater) {
    // Seater: 10 rows × 4 seats (2+2)
    return {
      type: "seater",
      rows: Array.from({ length: 10 }, (_, i) => ({
        rowNum: i + 1,
        left: [
          { id: `S${i * 4 + 1}`, booked: bookedSeater.includes(`S${i * 4 + 1}`) },
          { id: `S${i * 4 + 2}`, booked: bookedSeater.includes(`S${i * 4 + 2}`) },
        ],
        right: [
          { id: `S${i * 4 + 3}`, booked: bookedSeater.includes(`S${i * 4 + 3}`) },
          { id: `S${i * 4 + 4}`, booked: bookedSeater.includes(`S${i * 4 + 4}`) },
        ],
      })),
    };
  }

  // Sleeper / Semi-sleeper: Lower + Upper deck
  // Each deck: 7 rows × 3 berths (2 left + 1 right)
  const makeDeck = (prefix, booked) =>
    Array.from({ length: 7 }, (_, i) => ({
      rowNum: i + 1,
      left: [
        { id: `${prefix}${i * 3 + 1}`, booked: booked.includes(`${prefix}${i * 3 + 1}`) },
        { id: `${prefix}${i * 3 + 2}`, booked: booked.includes(`${prefix}${i * 3 + 2}`) },
      ],
      right: [
        { id: `${prefix}${i * 3 + 3}`, booked: booked.includes(`${prefix}${i * 3 + 3}`) },
      ],
    }));

  return {
    type: "sleeper",
    lower: makeDeck("L", bookedLower),
    upper: makeDeck("U", bookedUpper),
  };
};

// ─── Step 1: Search Form ──────────────────────────────────────────────────────
function SearchForm({ onSearch, loading }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) return;
    if (from === to) { alert("From and To cities cannot be same"); return; }
    onSearch({ from, to, date });
  };

  return (
    <div style={s.searchCard}>
      <div style={s.searchIcon}>🚌</div>
      <h2 style={s.searchTitle}>Book Bus Tickets</h2>
      <p style={s.searchSub}>Compare and book from top operators</p>

      <div style={s.formRow}>
        <div style={s.formField}>
          <label style={s.fieldLabel}>FROM</label>
          <select style={s.select} value={from} onChange={(e) => setFrom(e.target.value)} required>
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={s.swapIcon}>⇄</div>

        <div style={s.formField}>
          <label style={s.fieldLabel}>TO</label>
          <select style={s.select} value={to} onChange={(e) => setTo(e.target.value)} required>
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={s.formField}>
          <label style={s.fieldLabel}>DATE</label>
          <input
            style={s.select}
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        style={{ ...s.searchBtn, opacity: (!from || !to || !date || loading) ? 0.6 : 1 }}
        onClick={handleSubmit}
        disabled={!from || !to || !date || loading}
      >
        {loading ? "Searching buses..." : "Search Buses 🔍"}
      </button>
    </div>
  );
}

// ─── Step 2: Filter + Bus List ────────────────────────────────────────────────
function BusCard({ bus, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...s.busCard, boxShadow: hovered ? "0 8px 24px rgba(0,100,0,0.12)" : "0 2px 12px rgba(0,0,0,0.06)", transform: hovered ? "translateY(-2px)" : "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div style={s.busTop}>
        <div style={s.busOperator}>
          <span style={{ fontSize: 28 }}>{bus.logo}</span>
          <div>
            <div style={s.operatorName}>{bus.operator}</div>
            <div style={s.busType}>{bus.busType}</div>
          </div>
        </div>
        <div style={s.busRating}>⭐ {bus.rating}</div>
      </div>

      {/* Route */}
      <div style={s.busRoute}>
        <div style={s.timeBlock}>
          <div style={s.busTime}>{bus.departure}</div>
          <div style={s.busCity}>{bus.from || "—"}</div>
        </div>
        <div style={s.busPath}>
          <div style={s.busDuration}>{bus.duration}</div>
          <div style={s.pathLine}>
            <div style={s.pathDot} />
            <div style={s.pathTrack} />
            <div style={s.pathDot} />
          </div>
        </div>
        <div style={s.timeBlock}>
          <div style={s.busTime}>{bus.arrival}</div>
          <div style={s.busCity}>{bus.to || "—"}</div>
        </div>
      </div>

      {/* Amenities */}
      <div style={s.amenities}>
        {bus.amenities.map((a) => (
          <span key={a} style={s.amenityTag}>{a}</span>
        ))}
      </div>

      {/* Bottom row */}
      <div style={s.busBottom}>
        <div>
          <div style={s.fare}>₹{bus.fare}<span style={s.fareLabel}> / seat</span></div>
          <div style={s.seatsLeft}>🟢 {bus.seatsAvailable} seats left</div>
        </div>
        <button style={s.selectBtn} onClick={() => onSelect(bus)}>
          Select Seats →
        </button>
      </div>
    </div>
  );
}

function FilterBar({ buses, filters, onChange }) {
  const types = [...new Set(buses.map((b) => b.busType))];
  const operators = [...new Set(buses.map((b) => b.operator))];

  return (
    <div style={s.filterPanel}>
      <div style={s.filterTitle}>🔍 Filters</div>

      <div style={s.filterBlock}>
        <div style={s.filterLabel}>Bus Type</div>
        {types.map((t) => (
          <label key={t} style={s.checkRow}>
            <input type="checkbox" checked={filters.types.includes(t)}
              onChange={(e) => {
                const updated = e.target.checked ? [...filters.types, t] : filters.types.filter((x) => x !== t);
                onChange({ ...filters, types: updated });
              }} />
            <span style={s.checkLabel}>{t}</span>
          </label>
        ))}
      </div>

      <div style={s.filterBlock}>
        <div style={s.filterLabel}>Operator</div>
        {operators.map((op) => (
          <label key={op} style={s.checkRow}>
            <input type="checkbox" checked={filters.operators.includes(op)}
              onChange={(e) => {
                const updated = e.target.checked ? [...filters.operators, op] : filters.operators.filter((x) => x !== op);
                onChange({ ...filters, operators: updated });
              }} />
            <span style={s.checkLabel}>{op}</span>
          </label>
        ))}
      </div>

      <div style={s.filterBlock}>
        <div style={s.filterLabel}>Departure Time</div>
        {[
          { label: "Morning (6AM–12PM)", min: 6, max: 12 },
          { label: "Evening (4PM–8PM)", min: 16, max: 20 },
          { label: "Night (8PM–12AM)", min: 20, max: 24 },
        ].map((t) => (
          <label key={t.label} style={s.checkRow}>
            <input type="checkbox" checked={filters.timing === t.label}
              onChange={(e) => onChange({ ...filters, timing: e.target.checked ? t.label : null })} />
            <span style={s.checkLabel}>{t.label}</span>
          </label>
        ))}
      </div>

      <div style={s.filterBlock}>
        <div style={s.filterLabel}>Sort By</div>
        {["fare", "rating", "departure"].map((opt) => (
          <label key={opt} style={s.checkRow}>
            <input type="radio" name="sort" checked={filters.sortBy === opt}
              onChange={() => onChange({ ...filters, sortBy: opt })} />
            <span style={s.checkLabel}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Seat Selection ───────────────────────────────────────────────────
function SeatMap({ bus, selectedSeats, onToggle }) {
  const layout = generateBusSeats(bus.busType);

  const SeatBox = ({ seat, type }) => {
    const isSelected = selectedSeats.includes(seat.id);
    return (
      <div
        title={seat.id}
        style={{
          ...s.seat,
          ...(type === "sleeper" ? s.sleeperSeat : s.seaterSeat),
          background: seat.booked ? "#e0e0e0"
            : isSelected ? "#22c55e"
            : "white",
          border: seat.booked ? "1.5px solid #ccc"
            : isSelected ? "2px solid #22c55e"
            : "1.5px solid #c8e6c9",
          cursor: seat.booked ? "not-allowed" : "pointer",
          color: isSelected ? "white" : seat.booked ? "#bbb" : "#1a5e2a",
        }}
        onClick={() => !seat.booked && onToggle(seat.id)}
      >
        <span style={{ fontSize: type === "sleeper" ? 9 : 10 }}>{seat.id}</span>
      </div>
    );
  };

  const DeckLayout = ({ rows, label }) => (
    <div style={s.deck}>
      <div style={s.deckLabel}>{label}</div>
      <div style={s.deckFront}>🚌 Driver</div>
      {rows.map((row) => (
        <div key={row.rowNum} style={s.busRow}>
          <div style={s.seatGroup}>
            {row.left.map((seat) => <SeatBox key={seat.id} seat={seat} type="sleeper" />)}
          </div>
          <div style={s.aisle} />
          <div style={s.seatGroup}>
            {row.right.map((seat) => <SeatBox key={seat.id} seat={seat} type="sleeper" />)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={s.seatMapWrapper}>
      {layout.type === "sleeper" ? (
        <div style={s.decksRow}>
          <DeckLayout rows={layout.lower} label="Lower Berth" />
          <DeckLayout rows={layout.upper} label="Upper Berth" />
        </div>
      ) : (
        <div style={s.deck}>
          <div style={s.deckFront}>🚌 Driver</div>
          {layout.rows.map((row) => (
            <div key={row.rowNum} style={s.busRow}>
              <div style={s.seatGroup}>
                {row.left.map((seat) => <SeatBox key={seat.id} seat={seat} type="seater" />)}
              </div>
              <div style={s.aisle} />
              <div style={s.seatGroup}>
                {row.right.map((seat) => <SeatBox key={seat.id} seat={seat} type="seater" />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={s.legend}>
        {[
          { color: "white", border: "1.5px solid #c8e6c9", label: "Available" },
          { color: "#22c55e", border: "none", label: "Selected" },
          { color: "#e0e0e0", border: "1.5px solid #ccc", label: "Booked" },
        ].map((l) => (
          <div key={l.label} style={s.legendItem}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: l.color, border: l.border, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#6a8aa8" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Booking Confirmed ────────────────────────────────────────────────────────
function BookingConfirmed({ booking, onBookAgain }) {
  const ticketNo = booking._id?.slice(-8).toUpperCase();
  return (
    <div style={s.confirmedBox}>
      <div style={{ fontSize: 56 }}>🎫</div>
      <h2 style={s.confirmedTitle}>Bus Booked!</h2>
      <p style={{ color: "#6a8aa8", marginBottom: 24, fontSize: 14 }}>Your ticket is confirmed</p>

      <div style={s.ticketCard}>
        <div style={s.ticketTop}>
          <div style={s.ticketRoute}>{booking.from} → {booking.to}</div>
          <div style={s.ticketOperator}>{booking.operator}</div>
        </div>
        <div style={s.ticketBody}>
          {[
            { label: "Bus Type", value: booking.busType },
            { label: "Date", value: booking.date },
            { label: "Departure", value: booking.departure },
            { label: "Arrival", value: booking.arrival },
            { label: "Duration", value: booking.duration },
            { label: "Seats", value: booking.seats.join(", ") },
            { label: "Boarding Point", value: booking.boardingPoint },
            { label: "Passengers", value: booking.passengers },
            { label: "Total Paid", value: `₹${booking.totalAmount}`, highlight: true },
            { label: "Ticket No.", value: ticketNo, mono: true },
          ].map((row) => (
            <div key={row.label} style={s.ticketRow}>
              <span style={s.ticketLabel}>{row.label}</span>
              <span style={{
                ...s.ticketValue,
                ...(row.highlight ? { color: "#22c55e", fontWeight: 800, fontSize: 16 } : {}),
                ...(row.mono ? { fontFamily: "monospace", color: "#22c55e", letterSpacing: 2 } : {}),
              }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button style={s.bookAgainBtn} onClick={onBookAgain}>Book Another Bus</button>
    </div>
  );
}

// ─── Main BusBooking Page ─────────────────────────────────────────────────────
export default function BusBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState("search");
  const [searchParams, setSearchParams] = useState(null);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoint, setBoardingPoint] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ types: [], operators: [], timing: null, sortBy: "fare" });

  const token = localStorage.getItem("token");

  const handleSearch = async (params) => {
    setLoading(true); setError(""); setSelectedBus(null); setSelectedSeats([]);
    try {
      const q = new URLSearchParams(params);
      const res = await fetch(`${API}/buses/search?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      // Attach from/to to each bus for display
      setBuses(data.data.map((b) => ({ ...b, from: params.from, to: params.to })));
      setSearchParams(params);
      setStep("results");
    } catch { setError("Cannot reach server. Make sure backend is running."); }
    setLoading(false);
  };

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setBoardingPoint(bus.boardingPoints[0]);
    setStep("seats");
  };

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleBook = async () => {
    if (!selectedSeats.length || !boardingPoint) return;
    setBookingLoading(true); setError("");
    try {
      const res = await fetch(`${API}/buses/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          operator: selectedBus.operator,
          busType: selectedBus.busType,
          from: searchParams.from,
          to: searchParams.to,
          date: searchParams.date,
          departure: selectedBus.departure,
          arrival: selectedBus.arrival,
          duration: selectedBus.duration,
          seats: selectedSeats,
          boardingPoint,
          passengers: selectedSeats.length,
          totalAmount: selectedSeats.length * selectedBus.fare,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setBookingLoading(false); return; }
      setBooking(data.data);
      setStep("confirmed");
    } catch { setError("Booking failed. Please try again."); }
    setBookingLoading(false);
  };

  // Apply filters
  let filteredBuses = [...buses];
  if (filters.types.length) filteredBuses = filteredBuses.filter((b) => filters.types.includes(b.busType));
  if (filters.operators.length) filteredBuses = filteredBuses.filter((b) => filters.operators.includes(b.operator));
  if (filters.timing) {
    const timingMap = {
      "Morning (6AM–12PM)": [6, 12],
      "Evening (4PM–8PM)": [16, 20],
      "Night (8PM–12AM)": [20, 24],
    };
    const [min, max] = timingMap[filters.timing] || [0, 24];
    filteredBuses = filteredBuses.filter((b) => {
      const h = parseInt(b.departure.split(":")[0]);
      return h >= min && h < max;
    });
  }
  if (filters.sortBy === "fare") filteredBuses.sort((a, b) => a.fare - b.fare);
  else if (filters.sortBy === "rating") filteredBuses.sort((a, b) => b.rating - a.rating);
  else if (filters.sortBy === "departure") filteredBuses.sort((a, b) => a.departure.localeCompare(b.departure));

  return (
    <div style={s.page}>
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <button style={s.backBtn} onClick={() => step === "seats" ? setStep("results") : navigate("/")}>
            {step === "seats" ? "← Buses" : "← Home"}
          </button>
          <span style={s.navTitle}>🚌 Bus Booking</span>
          <span style={s.navSub}>RedBus · AbhiBus · VRL · TSRTC</span>
        </div>
      </nav>

      <div style={s.container}>

        {/* Search */}
        {step === "search" && <SearchForm onSearch={handleSearch} loading={loading} />}

        {/* Results */}
        {step === "results" && (
          <>
            <div style={s.summaryBar}>
              <div>
                <div style={s.summaryRoute}>{searchParams.from} → {searchParams.to}</div>
                <div style={s.summaryMeta}>{searchParams.date} · {filteredBuses.length} buses found</div>
              </div>
              <button style={s.modifyBtn} onClick={() => setStep("search")}>Modify</button>
            </div>

            <div style={s.resultsLayout}>
              <FilterBar buses={buses} filters={filters} onChange={setFilters} />
              <div>
                {filteredBuses.length === 0 ? (
                  <div style={s.noResults}>No buses match your filters. Try adjusting them.</div>
                ) : (
                  filteredBuses.map((bus) => (
                    <BusCard key={bus.id} bus={bus} onSelect={handleSelectBus} />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Seat Selection */}
        {step === "seats" && selectedBus && (
          <>
            {/* Bus info bar */}
            <div style={s.busSummaryBar}>
              <div style={{ fontSize: 28 }}>{selectedBus.logo}</div>
              <div>
                <div style={s.operatorName}>{selectedBus.operator}</div>
                <div style={s.busType2}>{selectedBus.busType} · {selectedBus.departure} → {selectedBus.arrival}</div>
              </div>
              <div style={s.farePerSeat}>₹{selectedBus.fare}<span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>/seat</span></div>
            </div>

            {/* Boarding point */}
            <div style={s.boardingSection}>
              <div style={s.boardingLabel}>📍 Select Boarding Point</div>
              <div style={s.boardingPoints}>
                {selectedBus.boardingPoints.map((bp) => (
                  <button
                    key={bp}
                    style={{ ...s.boardingBtn, ...(boardingPoint === bp ? s.boardingBtnActive : {}) }}
                    onClick={() => setBoardingPoint(bp)}
                  >
                    {bp}
                  </button>
                ))}
              </div>
            </div>

            {/* Seat map */}
            <div style={s.seatSection}>
              <div style={s.seatSectionTitle}>
                💺 Select Seats
                <span style={s.selectedCount}>
                  {selectedSeats.length > 0 ? `${selectedSeats.length} selected: ${selectedSeats.join(", ")}` : "Tap a seat to select"}
                </span>
              </div>
              <SeatMap bus={selectedBus} selectedSeats={selectedSeats} onToggle={toggleSeat} />
            </div>

            {/* Booking bar */}
            {selectedSeats.length > 0 && (
              <div style={s.bookingBar}>
                <div>
                  <div style={s.bookingBarTitle}>
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} · {selectedSeats.join(", ")}
                  </div>
                  <div style={s.bookingBarMeta}>{selectedBus.operator} · {boardingPoint}</div>
                </div>
                <div style={s.bookingBarRight}>
                  <div style={s.bookingBarTotal}>₹{selectedSeats.length * selectedBus.fare}</div>
                  <button
                    style={{ ...s.confirmBtn, opacity: bookingLoading ? 0.7 : 1 }}
                    onClick={handleBook}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? "Booking..." : "Confirm & Pay →"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Confirmed */}
        {step === "confirmed" && booking && (
          <BookingConfirmed
            booking={booking}
            onBookAgain={() => { setStep("search"); setBooking(null); setSelectedBus(null); setSelectedSeats([]); setError(""); }}
          />
        )}

        {error && <div style={s.errorBox}>⚠️ {error}</div>}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#f0fff4", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  navbar: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #c8e6c9", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #22c55e", background: "transparent", color: "#22c55e", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  navTitle: { fontWeight: 800, fontSize: "clamp(15px, 2.5vw, 18px)", color: "#0d2137" },
  navSub: { fontSize: 12, color: "#aaa", marginLeft: "auto" },
  container: { maxWidth: 1200, margin: "0 auto", padding: "clamp(20px, 3vw, 32px) clamp(16px, 3vw, 24px)", paddingBottom: 120 },

  // Search
  searchCard: { background: "white", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", maxWidth: 800, margin: "0 auto", boxShadow: "0 4px 24px rgba(34,197,94,0.12)", textAlign: "center" },
  searchIcon: { fontSize: 52, marginBottom: 8 },
  searchTitle: { fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, color: "#0d2137", margin: "0 0 6px" },
  searchSub: { color: "#aaa", fontSize: 14, margin: "0 0 28px" },
  formRow: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 20 },
  formField: { flex: "1 1 clamp(130px, 25%, 200px)", textAlign: "left" },
  fieldLabel: { display: "block", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, marginBottom: 6 },
  select: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #c8e6c9", fontSize: 14, color: "#0d2137", outline: "none", background: "white", cursor: "pointer" },
  swapIcon: { fontSize: 22, color: "#22c55e", fontWeight: 800, paddingBottom: 8, flexShrink: 0 },
  searchBtn: { width: "100%", padding: "clamp(12px, 2vw, 15px)", background: "#22c55e", color: "white", border: "none", borderRadius: 12, fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(34,197,94,0.3)" },

  // Summary bar
  summaryBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderRadius: 12, padding: "14px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexWrap: "wrap", gap: 10 },
  summaryRoute: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 16px)", color: "#0d2137" },
  summaryMeta: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#6a8aa8", marginTop: 2 },
  modifyBtn: { padding: "8px 16px", border: "1.5px solid #22c55e", borderRadius: 8, background: "transparent", color: "#22c55e", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  // Results layout
  resultsLayout: { display: "grid", gridTemplateColumns: "clamp(170px, 22%, 230px) 1fr", gap: "clamp(12px, 2vw, 20px)", alignItems: "start" },

  // Filter panel
  filterPanel: { background: "white", borderRadius: 16, padding: "clamp(14px, 2vw, 20px)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 80 },
  filterTitle: { fontWeight: 800, fontSize: 15, color: "#0d2137", marginBottom: 16 },
  filterBlock: { marginBottom: 20 },
  filterLabel: { fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  checkRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" },
  checkLabel: { fontSize: 13, color: "#444" },
  noResults: { background: "white", borderRadius: 12, padding: 32, color: "#aaa", textAlign: "center", fontSize: 14 },

  // Bus card
  busCard: { background: "white", borderRadius: 16, padding: "clamp(16px, 2.5vw, 22px)", marginBottom: 14, border: "1px solid #e8f5e9", transition: "all 0.2s" },
  busTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  busOperator: { display: "flex", alignItems: "center", gap: 12 },
  operatorName: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 16px)", color: "#0d2137" },
  busType: { fontSize: 12, color: "#aaa", marginTop: 2 },
  busType2: { fontSize: 13, color: "#6a8aa8", marginTop: 2 },
  busRating: { fontWeight: 700, fontSize: 14, color: "#f59e0b" },
  busRoute: { display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 20px)", marginBottom: 14 },
  timeBlock: { textAlign: "center" },
  busTime: { fontWeight: 800, fontSize: "clamp(16px, 2.5vw, 22px)", color: "#0d2137" },
  busCity: { fontSize: 12, color: "#aaa", marginTop: 2 },
  busPath: { flex: 1, textAlign: "center" },
  busDuration: { fontSize: 12, color: "#6a8aa8", marginBottom: 4 },
  pathLine: { display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
  pathDot: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 },
  pathTrack: { flex: 1, height: 2, background: "#c8e6c9", maxWidth: 80 },
  amenities: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
  amenityTag: { fontSize: 11, background: "#f0fff4", color: "#166534", padding: "3px 8px", borderRadius: 6, fontWeight: 600, border: "1px solid #c8e6c9" },
  busBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  fare: { fontWeight: 900, fontSize: "clamp(18px, 2.5vw, 24px)", color: "#22c55e" },
  fareLabel: { fontSize: 12, color: "#aaa", fontWeight: 400 },
  seatsLeft: { fontSize: 12, color: "#22c55e", marginTop: 4 },
  selectBtn: { padding: "clamp(10px, 1.5vw, 12px) clamp(16px, 2.5vw, 24px)", background: "#22c55e", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 14px)", cursor: "pointer" },

  // Bus summary bar (seat page)
  busSummaryBar: { display: "flex", alignItems: "center", gap: 16, background: "white", borderRadius: 14, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", flexWrap: "wrap" },
  farePerSeat: { marginLeft: "auto", fontWeight: 900, fontSize: 22, color: "#22c55e" },

  // Boarding
  boardingSection: { background: "white", borderRadius: 14, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  boardingLabel: { fontWeight: 700, fontSize: 14, color: "#0d2137", marginBottom: 12 },
  boardingPoints: { display: "flex", gap: 8, flexWrap: "wrap" },
  boardingBtn: { padding: "8px 16px", borderRadius: 20, border: "1.5px solid #c8e6c9", background: "transparent", color: "#444", fontSize: 13, cursor: "pointer" },
  boardingBtnActive: { background: "#22c55e", color: "white", border: "1.5px solid #22c55e" },

  // Seat section
  seatSection: { background: "white", borderRadius: 14, padding: "clamp(16px, 2.5vw, 24px)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  seatSectionTitle: { fontWeight: 800, fontSize: 15, color: "#0d2137", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  selectedCount: { fontSize: 13, fontWeight: 500, color: "#22c55e" },
  seatMapWrapper: { overflowX: "auto" },
  decksRow: { display: "flex", gap: "clamp(20px, 4vw, 40px)", flexWrap: "wrap", justifyContent: "center" },
  deck: { display: "flex", flexDirection: "column", gap: 6, alignItems: "center" },
  deckLabel: { fontWeight: 700, fontSize: 13, color: "#22c55e", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  deckFront: { fontSize: 13, color: "#aaa", marginBottom: 10, fontWeight: 600 },
  busRow: { display: "flex", alignItems: "center", gap: 4 },
  seatGroup: { display: "flex", gap: 4 },
  aisle: { width: "clamp(16px, 3vw, 24px)" },
  seat: { display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, fontWeight: 700, transition: "all 0.15s", userSelect: "none" },
  sleeperSeat: { width: "clamp(34px, 5vw, 44px)", height: "clamp(22px, 3vw, 28px)" },
  seaterSeat: { width: "clamp(30px, 4.5vw, 38px)", height: "clamp(30px, 4.5vw, 38px)" },
  legend: { display: "flex", gap: 20, justifyContent: "center", marginTop: 20, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 6 },

  // Booking bar
  bookingBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #c8e6c9", padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 32px)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 200, gap: 12, flexWrap: "wrap" },
  bookingBarTitle: { fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", color: "#0d2137" },
  bookingBarMeta: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#6a8aa8", marginTop: 2 },
  bookingBarRight: { display: "flex", alignItems: "center", gap: 16 },
  bookingBarTotal: { fontWeight: 900, fontSize: "clamp(18px, 2.5vw, 22px)", color: "#22c55e" },
  confirmBtn: { padding: "clamp(10px, 1.8vw, 13px) clamp(18px, 3vw, 26px)", background: "#22c55e", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", cursor: "pointer", whiteSpace: "nowrap" },

  // Confirmed
  confirmedBox: { maxWidth: 480, margin: "0 auto", textAlign: "center" },
  confirmedTitle: { fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 900, color: "#0d2137", margin: "8px 0 4px" },
  ticketCard: { background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 20, textAlign: "left" },
  ticketTop: { background: "#22c55e", padding: "20px 24px" },
  ticketRoute: { fontWeight: 900, fontSize: "clamp(16px, 2.5vw, 20px)", color: "white" },
  ticketOperator: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4 },
  ticketBody: { padding: "16px 24px" },
  ticketRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f0f0f0" },
  ticketLabel: { fontSize: 13, color: "#aaa" },
  ticketValue: { fontSize: 14, fontWeight: 600, color: "#0d2137", textAlign: "right" },
  bookAgainBtn: { width: "100%", padding: "14px", background: "#22c55e", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" },
  errorBox: { background: "#f0fff4", border: "1px solid #c8e6c9", borderRadius: 10, padding: "12px 16px", color: "#166534", fontSize: 14, marginTop: 16 },
};
