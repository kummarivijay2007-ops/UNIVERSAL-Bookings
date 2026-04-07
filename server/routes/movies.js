const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const MovieBooking = require("../models/Movie");

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Not logged in. Please login first." });
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// ─── GET /api/movies/list ─────────────────────────────────────────────────────
router.get("/list", protect, (req, res) => {
  const movies = [
    { id: "m1", title: "Kalki 2898 AD", genre: "Sci-Fi, Action", rating: 8.3, duration: "3h 1m", language: "Telugu, Hindi", poster: "🤖", description: "A futuristic mythological action film set in 2898 AD." },
    { id: "m2", title: "Pushpa 2", genre: "Action, Drama", rating: 8.6, duration: "3h 20m", language: "Telugu, Hindi", poster: "🔥", description: "The rise continues as Pushpa expands his red sandalwood empire." },
    { id: "m3", title: "Devara", genre: "Action, Thriller", rating: 7.5, duration: "2h 56m", language: "Telugu, Hindi", poster: "⚓", description: "A fearless man's legacy haunts the sea and his son." },
    { id: "m4", title: "Stree 2", genre: "Horror, Comedy", rating: 8.8, duration: "2h 15m", language: "Hindi", poster: "👻", description: "The men of Chanderi face a new supernatural threat." },
    { id: "m5", title: "Singham Again", genre: "Action", rating: 7.2, duration: "2h 40m", language: "Hindi", poster: "🦁", description: "Singham returns for the biggest cop showdown yet." },
    { id: "m6", title: "The Dark Knight", genre: "Action, Drama", rating: 9.0, duration: "2h 32m", language: "English, Hindi", poster: "🦇", description: "Batman faces the Joker in Gotham's darkest hour." },
  ];
  res.json({ success: true, data: movies });
});

// ─── GET /api/movies/showtimes ────────────────────────────────────────────────
router.get("/showtimes", protect, (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "City is required" });

  const cinemas = {
    Hyderabad: [
      { id: "c1", name: "PVR IMAX Inorbit", location: "Madhapur" },
      { id: "c2", name: "Cinepolis Manjeera", location: "Kukatpally" },
      { id: "c3", name: "AMB Cinemas", location: "Gachibowli" },
    ],
    Mumbai: [
      { id: "c4", name: "PVR Icon Andheri", location: "Andheri West" },
      { id: "c5", name: "INOX R-City", location: "Ghatkopar" },
      { id: "c6", name: "Cinepolis Fun Republic", location: "Andheri" },
    ],
    Bangalore: [
      { id: "c7", name: "PVR Orion Mall", location: "Rajajinagar" },
      { id: "c8", name: "INOX Garuda", location: "MG Road" },
      { id: "c9", name: "Cinepolis Nexus", location: "Koramangala" },
    ],
    Delhi: [
      { id: "c10", name: "PVR Select Citywalk", location: "Saket" },
      { id: "c11", name: "INOX Nehru Place", location: "Nehru Place" },
      { id: "c12", name: "Cinepolis DLF", location: "Vasant Kunj" },
    ],
    Chennai: [
      { id: "c13", name: "Sathyam Cinemas", location: "Royapettah" },
      { id: "c14", name: "PVR VR Chennai", location: "Anna Nagar" },
      { id: "c15", name: "INOX Palladium", location: "Phoenix Mall" },
    ],
  };

  const showtimes = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"];

  const cityData = cinemas[city] || cinemas["Hyderabad"];
  res.json({ success: true, cinemas: cityData, showtimes });
});

// ─── POST /api/movies/book ────────────────────────────────────────────────────
router.post("/book", protect, async (req, res) => {
  try {
    const { movie, cinema, city, date, showtime, seats, seatCategory, totalAmount } = req.body;
    if (!movie || !cinema || !city || !date || !showtime || !seats?.length || !totalAmount)
      return res.status(400).json({ error: "All fields are required" });

    const booking = await MovieBooking.create({
      userId: req.userId,
      movie, cinema, city, date, showtime,
      seats, seatCategory, totalAmount,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/movies/history ──────────────────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    const bookings = await MovieBooking.find({ userId: req.userId }).sort({ bookedAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;