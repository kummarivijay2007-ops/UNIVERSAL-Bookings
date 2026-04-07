import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

const CITIES = ["Hyderabad", "Mumbai", "Bangalore", "Delhi", "Chennai"];

// Generate dates for next 7 days
const getDates = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
      full: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    });
  }
  return dates;
};

// Generate a full cinema hall seat layout
// Rows A-H, 12 seats per row. Some are randomly pre-booked.
const generateSeats = () => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const booked = ["A3", "A4", "B7", "B8", "C1", "C2", "D5", "D6", "D7", "E3", "E10", "F4", "F5", "G2", "G9", "H6", "H7", "H8"];
  return rows.map((row) => ({
    row,
    category:
      row === "A" || row === "B" ? "Recliner"
      : row === "C" || row === "D" || row === "E" ? "Premium"
      : "Standard",
    price:
      row === "A" || row === "B" ? 500
      : row === "C" || row === "D" || row === "E" ? 300
      : 150,
    seats: Array.from({ length: 12 }, (_, i) => {
      const seatId = `${row}${i + 1}`;
      return { id: seatId, number: i + 1, status: booked.includes(seatId) ? "booked" : "available" };
    }),
  }));
};

// ─── Step 1: Movie List ───────────────────────────────────────────────────────
function MovieList({ movies, onSelect }) {
  return (
    <div>
      <h2 style={s.pageHeading}>🎬 Now Showing</h2>
      <div style={s.moviesGrid}>
        {movies.map((movie) => (
          <div key={movie.id} style={s.movieCard} onClick={() => onSelect(movie)}>
            <div style={s.moviePoster}>{movie.poster}</div>
            <div style={s.movieInfo}>
              <div style={s.movieTitle}>{movie.title}</div>
              <div style={s.movieGenre}>{movie.genre}</div>
              <div style={s.movieMeta}>
                <span style={s.ratingBadge}>⭐ {movie.rating}</span>
                <span style={s.movieDuration}>⏱ {movie.duration}</span>
              </div>
              <div style={s.movieLang}>🗣 {movie.language}</div>
              <button style={s.bookTicketBtn}>Book Tickets</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: City + Cinema + Date + Showtime ──────────────────────────────────
function ShowtimeSelector({ movie, cinemas, showtimes, onConfirm, onBack }) {
  const dates = getDates();
  const [city, setCity] = useState(CITIES[0]);
  const [cinema, setCinema] = useState(null);
  const [date, setDate] = useState(dates[0]);
  const [showtime, setShowtime] = useState(null);
  const [loadingCinemas, setLoadingCinemas] = useState(false);

  const token = localStorage.getItem("token");

  const fetchCinemas = async (selectedCity) => {
    setLoadingCinemas(true);
    setCinema(null); setShowtime(null);
    try {
      const res = await fetch(`${API}/movies/showtimes?city=${selectedCity}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) cinemas.splice(0, cinemas.length, ...data.cinemas);
    } catch {}
    setLoadingCinemas(false);
  };

  const handleCityChange = (c) => { setCity(c); fetchCinemas(c); };
  const canProceed = cinema && showtime;

  return (
    <div style={s.showtimeCard}>
      {/* Movie summary */}
      <div style={s.selectedMovieBar}>
        <span style={{ fontSize: 28 }}>{movie.poster}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1b77da" }}>{movie.title}</div>
          <div style={{ fontSize: 13, color: "#aaa" }}>{movie.genre} · {movie.duration}</div>
        </div>
        <button style={s.changeMovieBtn} onClick={onBack}>Change</button>
      </div>

      {/* City */}
      <div style={s.selectorBlock}>
        <div style={s.selectorLabel}>📍 Select City</div>
        <div style={s.pillRow}>
          {CITIES.map((c) => (
            <button key={c} style={{ ...s.pill, ...(city === c ? s.pillActive : {}) }} onClick={() => handleCityChange(c)}>{c}</button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div style={s.selectorBlock}>
        <div style={s.selectorLabel}>📅 Select Date</div>
        <div style={s.dateRow}>
          {dates.map((d) => (
            <div key={d.value} style={{ ...s.dateBox, ...(date.value === d.value ? s.dateBoxActive : {}) }} onClick={() => setDate(d)}>
              <div style={{ fontSize: 11, color: date.value === d.value ? "#1a8fe3" : "#aaa" }}>{d.label}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{d.full}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cinema */}
      <div style={s.selectorBlock}>
        <div style={s.selectorLabel}>🏟 Select Cinema</div>
        {loadingCinemas ? <p style={{ color: "#aaa", fontSize: 13 }}>Loading cinemas...</p> : (
          <div style={s.cinemaList}>
            {cinemas.map((c) => (
              <div key={c.id} style={{ ...s.cinemaRow, ...(cinema?.id === c.id ? s.cinemaRowActive : {}) }} onClick={() => setCinema(c)}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#2078d6" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>📍 {c.location}</div>
                </div>
                {cinema?.id === c.id && <span style={{ color: "#1a8fe3", fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Showtime */}
      <div style={s.selectorBlock}>
        <div style={s.selectorLabel}>🕐 Select Showtime</div>
        <div style={s.pillRow}>
          {showtimes.map((t) => (
            <button key={t} style={{ ...s.pill, ...(showtime === t ? s.pillActive : {}) }} onClick={() => setShowtime(t)}>{t}</button>
          ))}
        </div>
      </div>

      <button
        style={{ ...s.proceedBtn, opacity: canProceed ? 1 : 0.45 }}
        disabled={!canProceed}
        onClick={() => onConfirm({ city, cinema, date: date.value, showtime })}
      >
        Proceed to Seat Selection →
      </button>
    </div>
  );
}

// ─── Step 3: Visual Seat Map ──────────────────────────────────────────────────
function SeatMap({ movie, selection, onConfirm, onBack }) {
  const [seatLayout] = useState(generateSeats);
  const [selected, setSelected] = useState([]);

  const toggleSeat = (seat, rowInfo) => {
    if (seat.status === "booked") return;
    const exists = selected.find((s) => s.id === seat.id);
    if (exists) {
      setSelected(selected.filter((s) => s.id !== seat.id));
    } else {
      setSelected([...selected, { ...seat, price: rowInfo.price, category: rowInfo.category }]);
    }
  };

  const totalAmount = selected.reduce((sum, s) => sum + s.price, 0);

  const categoryColors = { Recliner: "#9719cd", Premium: "#fa692c", Standard: "#5c9df7" };

  return (
    <div>
      {/* Back + movie info */}
      <div style={s.seatHeader}>
        <button style={s.backLink} onClick={onBack}>← Back</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1a7ae1" }}>{movie.title}</div>
          <div style={{ fontSize: 13, color: "#aaa" }}>{selection.cinema.name} · {selection.date} · {selection.showtime}</div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Screen indicator */}
      <div style={s.screenBox}>
        <div style={s.screen} />
        <div style={s.screenLabel}>SCREEN</div>
      </div>

      {/* Seat map */}
      <div style={s.seatMapWrapper}>
        <div style={s.seatMap}>
          {seatLayout.map((rowInfo) => (
            <div key={rowInfo.row} style={s.seatRow}>
              {/* Row label */}
              <div style={s.rowLabel}>{rowInfo.row}</div>

              {/* Seats with aisle gap in middle */}
              <div style={s.seatsGroup}>
                {rowInfo.seats.slice(0, 6).map((seat) => {
                  const isSelected = !!selected.find((s) => s.id === seat.id);
                  return (
                    <div
                      key={seat.id}
                      title={`${seat.id} - ${rowInfo.category} - ₹${rowInfo.price}`}
                      style={{
                        ...s.seat,
                        background: seat.status === "booked" ? "#828080"
                          : isSelected ? categoryColors[rowInfo.category]
                          : "white",
                        border: seat.status === "booked" ? "1.5px solid #ccc"
                          : isSelected ? `2px solid ${categoryColors[rowInfo.category]}`
                          : "1.5px solid #d0e8ff",
                        cursor: seat.status === "booked" ? "not-allowed" : "pointer",
                        color: isSelected ? "white" : seat.status === "booked" ? "#bbb" : "rgb(15, 15, 15)",
                      }}
                      onClick={() => toggleSeat(seat, rowInfo)}
                    >
                      {seat.number}
                    </div>
                  );
                })}

                {/* Aisle gap */}
                <div style={{ width: 20 }} />

                {rowInfo.seats.slice(6).map((seat) => {
                  const isSelected = !!selected.find((s) => s.id === seat.id);
                  return (
                    <div
                      key={seat.id}
                      title={`${seat.id} - ${rowInfo.category} - ₹${rowInfo.price}`}
                      style={{
                        ...s.seat,
                        background: seat.status === "booked" ? "#828080"
                          : isSelected ? categoryColors[rowInfo.category]
                          : "white",
                        border: seat.status === "booked" ? "1.5px solid #ccc"
                          : isSelected ? `2px solid ${categoryColors[rowInfo.category]}`
                          : "1.5px solid #d0e8ff",
                        cursor: seat.status === "booked" ? "not-allowed" : "pointer",
                        color: isSelected ? "white" : seat.status === "booked" ? "#bbb" : "rgb(15, 15, 15)",
                      }}
                      onClick={() => toggleSeat(seat, rowInfo)}
                    >
                      {seat.number}
                    </div>
                  );
                })}
              </div>

              {/* Category + price label */}
              <div style={{ ...s.categoryTag, color: categoryColors[rowInfo.category] }}>
                {rowInfo.category} ₹{rowInfo.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {[
          { color: "white", border: "1.5px solid #80bcf5", label: "Available" },
          { color: "#828080", border: "1.5px solid #474646ef", label: "Booked" },
          { color: "#9719cd", border: "none", label: "Recliner ₹500" },
          { color: "#fa692c", border: "none", label: "Premium ₹300" },
          { color: "#5c9df7", border: "none", label: "Standard ₹150" },
        ].map((l) => (
          <div key={l.label} style={s.legendItem}>
            <div style={{ ...s.legendBox, background: l.color, border: l.border }} />
            <span style={s.legendLabel}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Booking bar */}
      {selected.length > 0 && (
        <div style={s.bookingBar}>
          <div>
            <div style={s.selectedSeatsText}>
              {selected.map((s) => s.id).join(", ")}
            </div>
            <div style={s.selectedSeatsMeta}>
              {selected.length} seat{selected.length > 1 ? "s" : ""} · ₹{totalAmount}
            </div>
          </div>
          <button
            style={s.confirmBtn}
            onClick={() => onConfirm({ seats: selected.map((s) => s.id), seatCategory: selected[0]?.category, totalAmount })}
          >
            Pay ₹{totalAmount} →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Booking Confirmed ────────────────────────────────────────────────
function BookingConfirmed({ booking, onBookAgain }) {
  return (
    <div style={s.confirmedBox}>
      <div style={{ fontSize: 70 }}>🎟️</div>
      <h2 style={s.confirmedTitle}>Tickets Booked!</h2>
      <p style={{ color: "#aaa", marginBottom: 24, fontSize: 14 }}>Show this at the cinema entrance</p>

      <div style={s.ticketCard}>
        <div style={s.ticketTop}>
          <div style={s.ticketMovie}>{booking.movie}</div>
          <div style={s.ticketCinema}>{booking.cinema}</div>
        </div>
        <div style={s.ticketDivider}>
          <div style={s.ticketHole} />
          <div style={{ flex: 1, borderTop: "2px dashed #e0eaf5" }} />
          <div style={s.ticketHole} />
        </div>
        <div style={s.ticketBottom}>
          {[
            { label: "City", value: booking.city },
            { label: "Date", value: booking.date },
            { label: "Time", value: booking.showtime },
            { label: "Seats", value: booking.seats.join(", ") },
            { label: "Category", value: booking.seatCategory },
            { label: "Total Paid", value: `₹${booking.totalAmount}`, highlight: true },
            { label: "Booking ID", value: booking._id?.slice(-8).toUpperCase(), small: true },
          ].map((row) => (
            <div key={row.label} style={s.ticketRow}>
              <span style={s.ticketLabel}>{row.label}</span>
              <span style={{ ...s.ticketValue, ...(row.highlight ? { color: "#1a8fe3", fontWeight: 800, fontSize: 16 } : {}), ...(row.small ? { fontSize: 11, fontFamily: "monospace", color: "#aaa" } : {}) }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button style={s.bookAgainBtn} onClick={onBookAgain}>Book Another Movie</button>
    </div>
  );
}

// ─── Main MovieBooking Page ───────────────────────────────────────────────────
export default function MovieBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selection, setSelection] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => { fetchMovies(); fetchInitialShowtimes(); }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API}/movies/list`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setMovies(data.data);
    } catch { setError("Cannot reach server."); }
    setLoading(false);
  };

  const fetchInitialShowtimes = async () => {
    try {
      const res = await fetch(`${API}/movies/showtimes?city=Hyderabad`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setCinemas(data.cinemas); setShowtimes(data.showtimes); }
    } catch {}
  };

  const handleMovieSelect = (movie) => { setSelectedMovie(movie); setStep("showtimes"); };

  const handleShowtimeConfirm = (sel) => { setSelection(sel); setStep("seats"); };

  const handleSeatConfirm = async ({ seats, seatCategory, totalAmount }) => {
    setError("");
    try {
      const res = await fetch(`${API}/movies/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          movie: selectedMovie.title,
          cinema: selection.cinema.name,
          city: selection.city,
          date: selection.date,
          showtime: selection.showtime,
          seats, seatCategory, totalAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setBooking(data.data);
      setStep("confirmed");
    } catch { setError("Booking failed. Please try again."); }
  };

  const handleBookAgain = () => {
    setStep("movies");
    setSelectedMovie(null);
    setSelection(null);
    setBooking(null);
    setError("");
  };

  return (
    <div style={s.page}>
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
          <span style={s.navTitle}>🎬 Movie Tickets</span>
          <span style={s.navSub}>BookMyShow</span>
        </div>
      </nav>

      <div style={s.container}>
        {loading && <div style={s.loadingBox}><div style={s.spinner} /><p style={{ color: "#aaa" }}>Loading movies...</p></div>}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {!loading && (
          <>
            {step === "movies" && <MovieList movies={movies} onSelect={handleMovieSelect} />}
            {step === "showtimes" && <ShowtimeSelector movie={selectedMovie} cinemas={cinemas} showtimes={showtimes} onConfirm={handleShowtimeConfirm} onBack={() => setStep("movies")} />}
            {step === "seats" && <SeatMap movie={selectedMovie} selection={selection} onConfirm={handleSeatConfirm} onBack={() => setStep("showtimes")} />}
            {step === "confirmed" && booking && <BookingConfirmed booking={booking} onBookAgain={handleBookAgain} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#0d1117", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  navbar: { background: "rgba(13,17,23,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #21262d", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #e23744", background: "transparent", color: "#e23744", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  navTitle: { fontWeight: 800, fontSize: "clamp(15px, 2.5vw, 18px)", color: "white" },
  navSub: { fontSize: 13, color: "#555", marginLeft: "auto" },
  container: { maxWidth: 1200, margin: "0 auto", padding: "clamp(20px, 3vw, 32px) clamp(16px, 3vw, 24px)", paddingBottom: 100 },

  // Movies grid
  pageHeading: { fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 800, color: "white", marginBottom: "clamp(16px, 2.5vw, 24px)" },
  moviesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: "clamp(14px, 2vw, 20px)" },
  movieCard: { background: "#161b22", borderRadius: 16, overflow: "hidden", display: "flex", gap: 16, padding: "clamp(14px, 2vw, 20px)", cursor: "pointer", border: "1px solid #21262d", transition: "border 0.2s", },
  moviePoster: { fontSize: "clamp(36px, 5vw, 52px)", width: "clamp(60px, 8vw, 80px)", height: "clamp(80px, 10vw, 100px)", background: "#21262d", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  movieInfo: { flex: 1 },
  movieTitle: { fontWeight: 800, fontSize: "clamp(14px, 2vw, 16px)", color: "white", marginBottom: 4 },
  movieGenre: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#8b949e", marginBottom: 8 },
  movieMeta: { display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" },
  ratingBadge: { background: "#f59e0b20", color: "#f59e0b", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 },
  movieDuration: { fontSize: 12, color: "#8b949e" },
  movieLang: { fontSize: 12, color: "#8b949e", marginBottom: 12 },
  bookTicketBtn: { padding: "8px 16px", background: "#e23744", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" },

  // Showtime selector
  showtimeCard: { background: "#161b22", borderRadius: 20, padding: "clamp(20px, 3vw, 32px)", border: "1px solid #21262d" },
  selectedMovieBar: { display: "flex", alignItems: "center", gap: 16, background: "#21262d", borderRadius: 12, padding: "14px 18px", marginBottom: 28, flexWrap: "wrap" },
  changeMovieBtn: { marginLeft: "auto", padding: "6px 14px", border: "1.5px solid #e23744", borderRadius: 8, background: "transparent", color: "#e23744", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  selectorBlock: { marginBottom: 24 },
  selectorLabel: { fontSize: 13, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 },
  pillRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: { padding: "8px 16px", borderRadius: 20, border: "1.5px solid #30363d", background: "transparent", color: "#8b949e", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  pillActive: { background: "#e23744", color: "white", border: "1.5px solid #e23744" },
  dateRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  dateBox: { padding: "10px 14px", borderRadius: 10, border: "1.5px solid #30363d", background: "transparent", textAlign: "center", cursor: "pointer", color: "#8b949e", minWidth: 60 },
  dateBoxActive: { border: "1.5px solid #1a8fe3", color: "#1a8fe3", background: "#1a8fe310" },
  cinemaList: { display: "flex", flexDirection: "column", gap: 8 },
  cinemaRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, border: "1.5px solid #30363d", cursor: "pointer" },
  cinemaRowActive: { border: "1.5px solid #1a8fe3", background: "#1a8fe310" },
  proceedBtn: { width: "100%", padding: "14px", background: "#e23744", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 },

  // Seat map
  seatHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" },
  backLink: { padding: "8px 14px", border: "1px solid #30363d", borderRadius: 8, background: "transparent", color: "#8b949e", fontSize: 13, cursor: "pointer" },
  screenBox: { textAlign: "center", marginBottom: 32 },
  screen: { width: "clamp(180px, 50%, 300px)", height: 8, background: "linear-gradient(90deg, transparent, #e23744, transparent)", margin: "0 auto 6px", borderRadius: 4 },
  screenLabel: { fontSize: 11, color: "#555", letterSpacing: 3 },
  seatMapWrapper: { overflowX: "auto", paddingBottom: 8 },
  seatMap: { display: "flex", flexDirection: "column", gap: 6, minWidth: "fit-content", margin: "0 auto", width: "fit-content" },
  seatRow: { display: "flex", alignItems: "center", gap: 8 },
  rowLabel: { width: 20, textAlign: "center", fontWeight: 700, fontSize: 12, color: "#555", flexShrink: 0 },
  seatsGroup: { display: "flex", gap: 5, alignItems: "center" },
  seat: { width: "clamp(26px, 3.5vw, 32px)", height: "clamp(26px, 3.5vw, 32px)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(9px, 1.2vw, 11px)", fontWeight: 700, transition: "all 0.15s", flexShrink: 0 },
  categoryTag: { fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 6 },
  legend: { display: "flex", gap: "clamp(12px, 2vw, 20px)", justifyContent: "center", margin: "24px 0", flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 6 },
  legendBox: { width: 18, height: 18, borderRadius: 4, flexShrink: 0 },
  legendLabel: { fontSize: 12, color: "#8b949e" },

  // Booking bar
  bookingBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#161b22", borderTop: "1px solid #21262d", padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 32px)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 200, gap: 12 },
  selectedSeatsText: { fontWeight: 700, fontSize: "clamp(12px, 1.8vw, 14px)", color: "white" },
  selectedSeatsMeta: { fontSize: "clamp(11px, 1.5vw, 13px)", color: "#8b949e", marginTop: 2 },
  confirmBtn: { padding: "clamp(10px, 1.8vw, 14px) clamp(18px, 3vw, 28px)", background: "#e23744", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", cursor: "pointer", whiteSpace: "nowrap" },

  // Confirmed / Ticket
  confirmedBox: { maxWidth: 460, margin: "0 auto", textAlign: "center" },
  confirmedTitle: { fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 900, color: "white", margin: "8px 0 4px" },
  ticketCard: { background: "white", borderRadius: 16, overflow: "hidden", marginBottom: 24, textAlign: "left" },
  ticketTop: { background: "#e23744", padding: "20px 24px" },
  ticketMovie: { fontWeight: 900, fontSize: "clamp(16px, 2.5vw, 20px)", color: "white" },
  ticketCinema: { fontSize: 13, color: "rgba(255, 255, 255, 0.78)", marginTop: 4 },
  ticketDivider: { display: "flex", alignItems: "center", padding: "0 12px" },
  ticketHole: { width: 20, height: 20, borderRadius: "50%", background: "#0d1117", flexShrink: 0 },
  ticketBottom: { padding: "16px 24px" },
  ticketRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" },
  ticketLabel: { fontSize: 13, color: "#aaa" },
  ticketValue: { fontSize: 14, fontWeight: 600, color: "#0d2137", textAlign: "right" },
  bookAgainBtn: { width: "100%", padding: "14px", background: "#e23744", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" },

  // Loading / Error
  loadingBox: { textAlign: "center", padding: "80px 0" },
  spinner: { width: 40, height: 40, borderRadius: "50%", border: "4px solid #21262d", borderTop: "4px solid #e23744", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" },
  errorBox: { background: "#2d1117", border: "1px solid #f85149", borderRadius: 10, padding: "12px 16px", color: "#f85149", fontSize: 14 },
};