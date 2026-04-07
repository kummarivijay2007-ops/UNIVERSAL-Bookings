const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const BusBooking = require("../models/Bus");

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

// ─── GET /api/buses/search ────────────────────────────────────────────────────
router.get("/search", protect, (req, res) => {
  const { from, to, date } = req.query;
  if (!from || !to || !date)
    return res.status(400).json({ error: "From, to and date are required" });

  const operators = [
    {
      id: "b1",
      operator: "RedBus Premium",
      logo: "🔴",
      busType: "AC Sleeper",
      departure: "21:00", arrival: "06:00",
      duration: "9h 00m", fare: 899,
      rating: 4.5, seatsAvailable: 18,
      boardingPoints: ["Madhapur Bus Stop", "Hitech City Metro", "Miyapur Bus Stand"],
      amenities: ["🔌 Charging", "💺 Recliner", "❄️ AC", "📺 Entertainment"],
    },
    {
      id: "b2",
      operator: "AbhiBus Express",
      logo: "🟢",
      busType: "AC Semi-Sleeper",
      departure: "22:30", arrival: "07:30",
      duration: "9h 00m", fare: 699,
      rating: 4.2, seatsAvailable: 24,
      boardingPoints: ["MGBS", "Uppal X Roads", "LB Nagar"],
      amenities: ["🔌 Charging", "❄️ AC", "💧 Water Bottle"],
    },
    {
      id: "b3",
      operator: "VRL Travels",
      logo: "🔵",
      busType: "Non-AC Sleeper",
      departure: "20:00", arrival: "05:30",
      duration: "9h 30m", fare: 549,
      rating: 4.0, seatsAvailable: 12,
      boardingPoints: ["Jubilee Bus Stand", "Koti", "MGBS"],
      amenities: ["💺 Recliner", "💧 Water Bottle"],
    },
    {
      id: "b4",
      operator: "TSRTC Garuda",
      logo: "🟡",
      busType: "AC Seater",
      departure: "06:00", arrival: "14:00",
      duration: "8h 00m", fare: 450,
      rating: 3.9, seatsAvailable: 30,
      boardingPoints: ["MGBS", "Afzalgunj", "Dilsukhnagar"],
      amenities: ["❄️ AC", "🔌 Charging"],
    },
    {
      id: "b5",
      operator: "Orange Travels",
      logo: "🟠",
      busType: "Volvo AC Sleeper",
      departure: "23:00", arrival: "08:00",
      duration: "9h 00m", fare: 999,
      rating: 4.7, seatsAvailable: 8,
      boardingPoints: ["Ameerpet Metro", "Punjagutta", "Panjagutta X Roads"],
      amenities: ["🔌 Charging", "💺 Recliner", "❄️ AC", "🍽️ Meals", "📺 Entertainment"],
    },
  ];

  res.json({ success: true, data: operators });
});

// ─── POST /api/buses/book ─────────────────────────────────────────────────────
router.post("/book", protect, async (req, res) => {
  try {
    const { operator, busType, from, to, date, departure, arrival, duration, seats, boardingPoint, passengers, totalAmount } = req.body;

    if (!operator || !from || !to || !date || !seats?.length || !boardingPoint || !totalAmount)
      return res.status(400).json({ error: "All fields are required" });

    const booking = await BusBooking.create({
      userId: req.userId,
      operator, busType, from, to, date,
      departure, arrival, duration,
      seats, boardingPoint, passengers, totalAmount,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/buses/history ───────────────────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    const bookings = await BusBooking.find({ userId: req.userId }).sort({ bookedAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;