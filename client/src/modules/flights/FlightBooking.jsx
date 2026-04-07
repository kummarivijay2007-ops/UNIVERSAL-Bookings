import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://universal-bookings-server.onrender.com";

const CITIES = [
  "Delhi (DEL)", "Mumbai (BOM)", "Bangalore (BLR)", "Hyderabad (HYD)",
  "Chennai (MAA)", "Kolkata (CCU)", "Pune (PNQ)", "Ahmedabad (AMD)",
  "Jaipur (JAI)", "Goa (GOI)", "Kochi (COK)", "Lucknow (LKO)",
];

const getDates = () => {
  const dates = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

// ─── Step 1: Search Form ──────────────────────────────────────────────────────
function SearchForm({ onSearch, loading }) {
  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [seatClass, setSeatClass] = useState("Economy");

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) return;
    if (from === to) { alert("From and To cities cannot be the same"); return; }
    onSearch({ tripType, from, to, date, returnDate, passengers, seatClass });
  };

  return (
    <div style={s.searchCard}>
      {/* Trip type toggle */}
      <div style={s.tripToggle}>
        {["oneway", "roundtrip"].map((t) => (
          <button
            key={t}
            style={{ ...s.tripBtn, ...(tripType === t ? s.tripBtnActive : {}) }}
            onClick={() => setTripType(t)}
          >
            {t === "oneway" ? "✈️ One Way" : "🔄 Round Trip"}
          </button>
        ))}
      </div>

      {/* From / To */}
      <div style={s.routeRow}>
        <div style={s.cityBox}>
          <div style={s.cityLabel}>FROM</div>
          <select style={s.citySelect} value={from} onChange={(e) => setFrom(e.target.value)} required>
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button style={s.swapBtn} onClick={swap} title="Swap cities">⇄</button>

        <div style={s.cityBox}>
          <div style={s.cityLabel}>TO</div>
          <select style={s.citySelect} value={to} onChange={(e) => setTo(e.target.value)} required>
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Dates + Passengers + Class */}
      <div style={s.detailsRow}>
        <div style={s.detailBox}>
          <div style={s.detailLabel}>DEPARTURE</div>
          <input style={s.detailInput} type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} required />
        </div>

        {tripType === "roundtrip" && (
          <div style={s.detailBox}>
            <div style={s.detailLabel}>RETURN</div>
            <input style={s.detailInput} type="date" value={returnDate} min={date || new Date().toISOString().split("T")[0]} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
        )}

        <div style={s.detailBox}>
          <div style={s.detailLabel}>PASSENGERS</div>
          <div style={s.passengerRow}>
            <button style={s.paxBtn} onClick={() => setPassengers(Math.max(1, passengers - 1))}>−</button>
            <span style={s.paxCount}>{passengers}</span>
            <button style={s.paxBtn} onClick={() => setPassengers(Math.min(9, passengers + 1))}>+</button>
          </div>
        </div>

        <div style={s.detailBox}>
          <div style={s.detailLabel}>CLASS</div>
          <div style={s.classToggle}>
            {["Economy", "Business"].map((c) => (
              <button key={c} style={{ ...s.classBtn, ...(seatClass === c ? s.classBtnActive : {}) }} onClick={() => setSeatClass(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <button
        style={{ ...s.searchBtn, opacity: (!from || !to || !date || loading) ? 0.6 : 1 }}
        onClick={handleSubmit}
        disabled={!from || !to || !date || loading}
      >
        {loading ? "Searching flights..." : "Search Flights ✈️"}
      </button>
    </div>
  );
}

// ─── Flight Card ──────────────────────────────────────────────────────────────
function FlightCard({ flight, isSelected, onSelect, passengers, seatClass }) {
  return (
    <div
      style={{
        ...s.flightCard,
        border: isSelected ? "2px solid #1a8fe3" : "2px solid #e8f0f8",
        background: isSelected ? "#f0f8ff" : "white",
      }}
      onClick={() => onSelect(flight)}
    >
      {/* Airline */}
      <div style={s.flightAirline}>
        <span style={{ fontSize: 24 }}>{flight.logo}</span>
        <div>
          <div style={s.airlineName}>{flight.airline}</div>
          <div style={s.flightNo}>{flight.flightNo}</div>
        </div>
      </div>

      {/* Route + time */}
      <div style={s.flightRoute}>
        <div style={s.timeBlock}>
          <div style={s.timeText}>{flight.departure}</div>
          <div style={s.cityCode}>{flight.from.split("(")[1]?.replace(")", "") || flight.from}</div>
        </div>
        <div style={s.flightPath}>
          <div style={s.duration}>{flight.duration}</div>
          <div style={s.pathLine}>
            <div style={s.pathDot} />
            <div style={s.pathTrack} />
            {flight.stops > 0 && <div style={s.stopDot} />}
            <div style={s.pathTrack} />
            <div style={s.pathDot} />
          </div>
          <div style={s.stopsText}>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}</div>
        </div>
        <div style={s.timeBlock}>
          <div style={s.timeText}>{flight.arrival}</div>
          <div style={s.cityCode}>{flight.to.split("(")[1]?.replace(")", "") || flight.to}</div>
        </div>
      </div>

      {/* Price + seats */}
      <div style={s.flightPrice}>
        <div style={s.priceAmount}>₹{flight.price.toLocaleString()}</div>
        <div style={s.priceLabel}>{seatClass} · {passengers} pax</div>
        <div style={s.seatsLeft}>🔴 {flight.seatsLeft} left</div>
      </div>

      {isSelected && <div style={s.selectedBadge}>✓ Selected</div>}
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ flights, filters, onChange }) {
  const airlines = [...new Set(flights.map((f) => f.airline))];
  const maxPrice = Math.max(...flights.map((f) => f.price));

  return (
    <div style={s.filterPanel}>
      <div style={s.filterTitle}>🔍 Filters</div>

      {/* Stops */}
      <div style={s.filterBlock}>
        <div style={s.filterLabel}>Stops</div>
        {[{ label: "Non-stop", value: 0 }, { label: "1 Stop", value: 1 }].map((opt) => (
          <label key={opt.value} style={s.filterCheckRow}>
            <input
              type="checkbox"
              checked={filters.stops.includes(opt.value)}
              onChange={(e) => {
                const newStops = e.target.checked
                  ? [...filters.stops, opt.value]
                  : filters.stops.filter((s) => s !== opt.value);
                onChange({ ...filters, stops: newStops });
              }}
            />
            <span style={s.filterCheckLabel}>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Airlines */}
      <div style={s.filterBlock}>
        <div style={s.filterLabel}>Airlines</div>
        {airlines.map((airline) => (
          <label key={airline} style={s.filterCheckRow}>
            <input
              type="checkbox"
              checked={filters.airlines.includes(airline)}
              onChange={(e) => {
                const newAirlines = e.target.checked
                  ? [...filters.airlines, airline]
                  : filters.airlines.filter((a) => a !== airline);
                onChange({ ...filters, airlines: newAirlines });
              }}
            />
            <span style={s.filterCheckLabel}>{airline}</span>
          </label>
        ))}
      </div>

      {/* Max price */}
      <div style={s.filterBlock}>
        <div style={s.filterLabel}>Max Price</div>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={500}
          value={filters.maxPrice || maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          style={{ width: "100%" }}
        />
        <div style={{ fontSize: 13, color: "#1a8fe3", fontWeight: 700, marginTop: 4 }}>
          ₹{(filters.maxPrice || maxPrice).toLocaleString()}
        </div>
      </div>

      {/* Sort */}
      <div style={s.filterBlock}>
        <div style={s.filterLabel}>Sort By</div>
        {["price", "duration", "departure"].map((opt) => (
          <label key={opt} style={s.filterCheckRow}>
            <input
              type="radio"
              name="sort"
              checked={filters.sortBy === opt}
              onChange={() => onChange({ ...filters, sortBy: opt })}
            />
            <span style={s.filterCheckLabel}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Results Panel ────────────────────────────────────────────────────────────
function FlightResults({ title, flights, filters, selectedFlight, onSelect, passengers, seatClass }) {
  // Apply filters
  let filtered = [...flights];
  if (filters.stops.length > 0) filtered = filtered.filter((f) => filters.stops.includes(f.stops));
  if (filters.airlines.length > 0) filtered = filtered.filter((f) => filters.airlines.includes(f.airline));
  if (filters.maxPrice) filtered = filtered.filter((f) => f.price <= filters.maxPrice);

  // Sort
  if (filters.sortBy === "price") filtered.sort((a, b) => a.price - b.price);
  else if (filters.sortBy === "duration") filtered.sort((a, b) => a.duration.localeCompare(b.duration));
  else if (filters.sortBy === "departure") filtered.sort((a, b) => a.departure.localeCompare(b.departure));

  return (
    <div style={s.resultsPanel}>
      <div style={s.resultsTitle}>{title} <span style={s.resultsCount}>{filtered.length} flights</span></div>
      {filtered.length === 0 ? (
        <div style={s.noResults}>No flights match your filters. Try adjusting them.</div>
      ) : (
        filtered.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            isSelected={selectedFlight?.id === flight.id}
            onSelect={onSelect}
            passengers={passengers}
            seatClass={seatClass}
          />
        ))
      )}
    </div>
  );
}

// ─── Booking Confirmed ────────────────────────────────────────────────────────
function BookingConfirmed({ booking, onBookAgain }) {
  const pnr = booking._id?.slice(-6).toUpperCase();
  return (
    <div style={s.confirmedBox}>
      <div style={{ fontSize: 56 }}>✈️</div>
      <h2 style={s.confirmedTitle}>Flight Booked!</h2>
      <p style={{ color: "#6a8aa8", marginBottom: 28, fontSize: 14 }}>Your booking is confirmed</p>

      {/* Outbound ticket */}
      <div style={s.ticketCard}>
        <div style={s.ticketHeader}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>
            {booking.outbound.from.split("(")[0].trim()} → {booking.outbound.to.split("(")[0].trim()}
          </span>
          <span style={{ background: "#d0eeff", color: "#0077c2", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
            {booking.tripType === "roundtrip" ? "OUTBOUND" : "ONE WAY"}
          </span>
        </div>
        <div style={s.ticketBody}>
          {[
            { label: "Airline", value: `${booking.outbound.airline} · ${booking.outbound.flightNo}` },
            { label: "Date", value: booking.outbound.date },
            { label: "Departure", value: booking.outbound.departure },
            { label: "Arrival", value: booking.outbound.arrival },
            { label: "Duration", value: booking.outbound.duration },
            { label: "Stops", value: booking.outbound.stops === 0 ? "Non-stop" : `${booking.outbound.stops} stop` },
          ].map((row) => (
            <div key={row.label} style={s.ticketRow}>
              <span style={s.ticketLabel}>{row.label}</span>
              <span style={s.ticketValue}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Return ticket */}
      {booking.returnFlight?.airline && (
        <div style={{ ...s.ticketCard, marginTop: 12 }}>
          <div style={{ ...s.ticketHeader, background: "#f0eeff" }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>
              {booking.returnFlight.from.split("(")[0].trim()} → {booking.returnFlight.to.split("(")[0].trim()}
            </span>
            <span style={{ background: "#e8e0ff", color: "#6C63FF", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>RETURN</span>
          </div>
          <div style={s.ticketBody}>
            {[
              { label: "Airline", value: `${booking.returnFlight.airline} · ${booking.returnFlight.flightNo}` },
              { label: "Date", value: booking.returnFlight.date },
              { label: "Departure", value: booking.returnFlight.departure },
              { label: "Arrival", value: booking.returnFlight.arrival },
            ].map((row) => (
              <div key={row.label} style={s.ticketRow}>
                <span style={s.ticketLabel}>{row.label}</span>
                <span style={s.ticketValue}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={s.summaryCard}>
        {[
          { label: "Passengers", value: booking.passengers },
          { label: "Class", value: booking.seatClass },
          { label: "Total Paid", value: `₹${booking.totalAmount.toLocaleString()}`, highlight: true },
          { label: "PNR", value: pnr, mono: true },
        ].map((row) => (
          <div key={row.label} style={s.ticketRow}>
            <span style={s.ticketLabel}>{row.label}</span>
            <span style={{ ...s.ticketValue, ...(row.highlight ? { color: "#1a8fe3", fontWeight: 800, fontSize: 16 } : {}), ...(row.mono ? { fontFamily: "monospace", letterSpacing: 2, color: "#1a8fe3" } : {}) }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <button style={s.bookAgainBtn} onClick={onBookAgain}>Book Another Flight</button>
    </div>
  );
}

// ─── Main FlightBooking Page ──────────────────────────────────────────────────
export default function FlightBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState("search");
  const [searchParams, setSearchParams] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ stops: [], airlines: [], maxPrice: null, sortBy: "price" });

  const token = localStorage.getItem("token");

  const handleSearch = async (params) => {
    setLoading(true);
    setError("");
    setSelectedOutbound(null);
    setSelectedReturn(null);
    setFilters({ stops: [], airlines: [], maxPrice: null, sortBy: "price" });
    try {
      const q = new URLSearchParams({
        from: params.from, to: params.to, date: params.date,
        tripType: params.tripType, seatClass: params.seatClass,
        passengers: params.passengers,
        ...(params.returnDate && { returnDate: params.returnDate }),
      });
      const res = await fetch(`${API}/flights/search?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setResults(data.data);
      setSearchParams(params);
      setStep("results");
    } catch { setError("Cannot reach server. Make sure backend is running."); }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!selectedOutbound) return;
    if (searchParams.tripType === "roundtrip" && !selectedReturn) {
      setError("Please select a return flight too."); return;
    }
    setBookingLoading(true);
    setError("");

    const totalAmount = selectedOutbound.price + (selectedReturn?.price || 0);

    try {
      const res = await fetch(`${API}/flights/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tripType: searchParams.tripType,
          outbound: {
            airline: selectedOutbound.airline,
            flightNo: selectedOutbound.flightNo,
            from: selectedOutbound.from,
            to: selectedOutbound.to,
            departure: selectedOutbound.departure,
            arrival: selectedOutbound.arrival,
            duration: selectedOutbound.duration,
            stops: selectedOutbound.stops,
            date: selectedOutbound.date,
          },
          returnFlight: selectedReturn ? {
            airline: selectedReturn.airline,
            flightNo: selectedReturn.flightNo,
            from: selectedReturn.from,
            to: selectedReturn.to,
            departure: selectedReturn.departure,
            arrival: selectedReturn.arrival,
            duration: selectedReturn.duration,
            stops: selectedReturn.stops,
            date: selectedReturn.date,
          } : undefined,
          passengers: searchParams.passengers,
          seatClass: searchParams.seatClass,
          totalAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setBookingLoading(false); return; }
      setBooking(data.data);
      setStep("confirmed");
    } catch { setError("Booking failed. Please try again."); }
    setBookingLoading(false);
  };

  const handleBookAgain = () => {
    setStep("search"); setResults(null); setSelectedOutbound(null);
    setSelectedReturn(null); setBooking(null); setError("");
  };

  const totalAmount = (selectedOutbound?.price || 0) + (selectedReturn?.price || 0);
  const canBook = selectedOutbound && (searchParams?.tripType === "oneway" || selectedReturn);

  return (
    <div style={s.page}>
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <span style={s.navTitle}>✈️ Flight Booking</span>
          <span style={s.navSub}>IndiGo · Air India · Vistara · SpiceJet</span>
        </div>
      </nav>

      <div style={s.container}>
        {/* Search always visible at top on results page */}
        {step === "search" && <SearchForm onSearch={handleSearch} loading={loading} />}

        {step === "results" && results && (
          <>
            {/* Compact search summary bar */}
            <div style={s.summaryBar}>
              <div style={s.summaryInfo}>
                <span style={s.summaryRoute}>
                  {searchParams.from.split("(")[0].trim()} → {searchParams.to.split("(")[0].trim()}
                </span>
                <span style={s.summaryMeta}>
                  {searchParams.date}
                  {searchParams.tripType === "roundtrip" && ` · Return ${searchParams.returnDate}`}
                  {" · "}{searchParams.passengers} pax · {searchParams.seatClass}
                </span>
              </div>
              <button style={s.modifyBtn} onClick={() => setStep("search")}>Modify</button>
            </div>

            <div style={s.resultsLayout}>
              {/* Filter sidebar */}
              <FilterPanel flights={results.outbound} filters={filters} onChange={setFilters} />

              {/* Flight lists */}
              <div style={s.flightsColumn}>
                <FlightResults
                  title={`✈️ ${searchParams.from.split("(")[0].trim()} → ${searchParams.to.split("(")[0].trim()}`}
                  flights={results.outbound}
                  filters={filters}
                  selectedFlight={selectedOutbound}
                  onSelect={setSelectedOutbound}
                  passengers={searchParams.passengers}
                  seatClass={searchParams.seatClass}
                />

                {results.returnFlights && (
                  <FlightResults
                    title={`✈️ ${searchParams.to.split("(")[0].trim()} → ${searchParams.from.split("(")[0].trim()} (Return)`}
                    flights={results.returnFlights}
                    filters={filters}
                    selectedFlight={selectedReturn}
                    onSelect={setSelectedReturn}
                    passengers={searchParams.passengers}
                    seatClass={searchParams.seatClass}
                  />
                )}
              </div>
            </div>

            {/* Booking bar */}
            {selectedOutbound && (
              <div style={s.bookingBar}>
                <div style={s.bookingBarInfo}>
                  <div style={s.bookingBarRoute}>
                    {selectedOutbound.airline} {selectedOutbound.flightNo}
                    {selectedReturn && ` + ${selectedReturn.airline} ${selectedReturn.flightNo}`}
                  </div>
                  <div style={s.bookingBarMeta}>
                    {searchParams.passengers} pax · {searchParams.seatClass}
                    {!canBook && searchParams.tripType === "roundtrip" && " · Select return flight"}
                  </div>
                </div>
                <div style={s.bookingBarRight}>
                  <div style={s.bookingBarTotal}>₹{totalAmount.toLocaleString()}</div>
                  <button
                    style={{ ...s.confirmBtn, opacity: canBook && !bookingLoading ? 1 : 0.5 }}
                    onClick={handleBook}
                    disabled={!canBook || bookingLoading}
                  >
                    {bookingLoading ? "Booking..." : "Confirm & Pay →"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {step === "confirmed" && booking && (
          <BookingConfirmed booking={booking} onBookAgain={handleBookAgain} />
        )}

        {error && <div style={s.errorBox}>⚠️ {error}</div>}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  navbar: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #dde8ff", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #1a8fe3", background: "transparent", color: "#1a8fe3", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  navTitle: { fontWeight: 800, fontSize: "clamp(15px, 2.5vw, 18px)", color: "#0d2137" },
  navSub: { fontSize: 12, color: "#aaa", marginLeft: "auto" },
  container: { maxWidth: 1200, margin: "0 auto", padding: "clamp(20px, 3vw, 32px) clamp(16px, 3vw, 24px)", paddingBottom: 100 },

  // Search form
  searchCard: { background: "white", borderRadius: 20, padding: "clamp(20px, 3vw, 32px)", boxShadow: "0 4px 24px rgba(26,100,227,0.1)" },
  tripToggle: { display: "flex", gap: 8, marginBottom: 24 },
  tripBtn: { padding: "10px 20px", borderRadius: 20, border: "1.5px solid #d0d8f0", background: "transparent", color: "#6a8aa8", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  tripBtnActive: { background: "#1a8fe3", color: "white", border: "1.5px solid #1a8fe3" },
  routeRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  cityBox: { flex: 1, minWidth: "clamp(140px, 30%, 200px)" },
  cityLabel: { fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, marginBottom: 6 },
  citySelect: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #d0d8f0", fontSize: 14, color: "#0d2137", outline: "none", background: "white", cursor: "pointer" },
  swapBtn: { padding: "12px", borderRadius: 10, border: "1.5px solid #d0d8f0", background: "white", fontSize: 18, cursor: "pointer", color: "#1a8fe3", fontWeight: 700 },
  detailsRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 },
  detailBox: { flex: "1 1 clamp(120px, 20%, 180px)" },
  detailLabel: { fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, marginBottom: 6 },
  detailInput: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #d0d8f0", fontSize: 14, color: "#0d2137", outline: "none" },
  passengerRow: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0" },
  paxBtn: { width: 32, height: 32, borderRadius: 8, border: "1.5px solid #d0d8f0", background: "white", fontSize: 18, cursor: "pointer", color: "#1a8fe3", fontWeight: 700 },
  paxCount: { fontWeight: 800, fontSize: 18, color: "#0d2137", minWidth: 20, textAlign: "center" },
  classToggle: { display: "flex", gap: 6 },
  classBtn: { flex: 1, padding: "10px 8px", borderRadius: 8, border: "1.5px solid #d0d8f0", background: "transparent", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#6a8aa8", textAlign: "center" },
  classBtnActive: { background: "#1a8fe3", color: "white", border: "1.5px solid #1a8fe3" },
  searchBtn: { width: "100%", padding: "clamp(12px, 2vw, 15px)", background: "#1a8fe3", color: "white", border: "none", borderRadius: 12, fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(26,143,227,0.3)" },

  // Summary bar
  summaryBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderRadius: 12, padding: "14px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexWrap: "wrap", gap: 10 },
  summaryInfo: { display: "flex", flexDirection: "column", gap: 3 },
  summaryRoute: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 16px)", color: "#0d2137" },
  summaryMeta: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#6a8aa8" },
  modifyBtn: { padding: "8px 16px", border: "1.5px solid #1a8fe3", borderRadius: 8, background: "transparent", color: "#1a8fe3", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  // Results layout
  resultsLayout: { display: "grid", gridTemplateColumns: "clamp(180px, 22%, 240px) 1fr", gap: "clamp(12px, 2vw, 20px)", alignItems: "start" },
  filterPanel: { background: "white", borderRadius: 16, padding: "clamp(16px, 2vw, 20px)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 80 },
  filterTitle: { fontWeight: 800, fontSize: 15, color: "#0d2137", marginBottom: 16 },
  filterBlock: { marginBottom: 20 },
  filterLabel: { fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  filterCheckRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" },
  filterCheckLabel: { fontSize: 13, color: "#444" },
  flightsColumn: { display: "flex", flexDirection: "column", gap: 20 },
  resultsPanel: {},
  resultsTitle: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 16px)", color: "#0d2137", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 },
  resultsCount: { fontSize: 12, background: "#d0eeff", color: "#0077c2", padding: "2px 10px", borderRadius: 12, fontWeight: 600 },
  noResults: { background: "white", borderRadius: 12, padding: 24, color: "#aaa", textAlign: "center", fontSize: 14 },

  // Flight card
  flightCard: { background: "white", borderRadius: 14, padding: "clamp(14px, 2vw, 18px)", marginBottom: 10, cursor: "pointer", transition: "all 0.15s", display: "grid", gridTemplateColumns: "clamp(100px, 18%, 140px) 1fr clamp(100px, 18%, 140px)", alignItems: "center", gap: "clamp(10px, 2vw, 20px)", position: "relative" },
  flightAirline: { display: "flex", alignItems: "center", gap: 10 },
  airlineName: { fontWeight: 700, fontSize: "clamp(12px, 1.8vw, 14px)", color: "#0d2137" },
  flightNo: { fontSize: 11, color: "#aaa", marginTop: 2 },
  flightRoute: { display: "flex", alignItems: "center", gap: "clamp(8px, 1.5vw, 16px)" },
  timeBlock: { textAlign: "center" },
  timeText: { fontWeight: 800, fontSize: "clamp(16px, 2.5vw, 22px)", color: "#0d2137" },
  cityCode: { fontSize: 11, color: "#aaa", marginTop: 2 },
  flightPath: { flex: 1, textAlign: "center" },
  duration: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#6a8aa8", marginBottom: 4 },
  pathLine: { display: "flex", alignItems: "center", justifyContent: "center", gap: 2 },
  pathDot: { width: 7, height: 7, borderRadius: "50%", background: "#1a8fe3", flexShrink: 0 },
  pathTrack: { flex: 1, height: 2, background: "#d0e8ff", maxWidth: 60 },
  stopDot: { width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 },
  stopsText: { fontSize: 11, color: "#aaa", marginTop: 4 },
  flightPrice: { textAlign: "right" },
  priceAmount: { fontWeight: 900, fontSize: "clamp(16px, 2.5vw, 22px)", color: "#1a8fe3" },
  priceLabel: { fontSize: 11, color: "#aaa", marginTop: 2 },
  seatsLeft: { fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: 600 },
  selectedBadge: { position: "absolute", top: 10, right: 10, background: "#1a8fe3", color: "white", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 700 },

  // Booking bar
  bookingBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #d0e8ff", padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 32px)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 200, gap: 12, flexWrap: "wrap" },
  bookingBarInfo: {},
  bookingBarRoute: { fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", color: "#0d2137" },
  bookingBarMeta: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#6a8aa8", marginTop: 2 },
  bookingBarRight: { display: "flex", alignItems: "center", gap: 16 },
  bookingBarTotal: { fontWeight: 900, fontSize: "clamp(18px, 2.5vw, 24px)", color: "#1a8fe3" },
  confirmBtn: { padding: "clamp(10px, 1.8vw, 14px) clamp(18px, 3vw, 28px)", background: "#1a8fe3", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", cursor: "pointer", whiteSpace: "nowrap" },

  // Confirmed
  confirmedBox: { maxWidth: 520, margin: "0 auto", textAlign: "center" },
  confirmedTitle: { fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 900, color: "#0d2137", margin: "8px 0 4px" },
  ticketCard: { background: "white", borderRadius: 14, overflow: "hidden", marginBottom: 8, textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  ticketHeader: { background: "#e8f4ff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  ticketBody: { padding: "12px 20px" },
  summaryCard: { background: "white", borderRadius: 14, padding: "16px 20px", marginBottom: 20, textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  ticketRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f4ff" },
  ticketLabel: { fontSize: 13, color: "#aaa" },
  ticketValue: { fontSize: 14, fontWeight: 600, color: "#0d2137" },
  bookAgainBtn: { width: "100%", padding: "14px", background: "#1a8fe3", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" },
  errorBox: { background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 10, padding: "12px 16px", color: "#cc0000", fontSize: 14, marginTop: 16 },
};
