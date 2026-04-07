const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Ride = require("../models/ride");

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// This function runs BEFORE the route handler
// It checks if the request has a valid token
// If yes → allow. If no → block with 401 error.
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not logged in. Please login first." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // attach userId to request so routes can use it
    next(); // move on to the actual route
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token. Please login again." });
  }
};

// ─── GET /api/rides/estimates ─────────────────────────────────────────────────
// Returns mock fare estimates from all providers
// Protected — must be logged in
router.get("/estimates", protect, (req, res) => {
  const { pickup, dropoff } = req.query;

  if (!pickup || !dropoff) {
    return res.status(400).json({ error: "Pickup and dropoff are required" });
  }

  // In a real app you'd call Uber API, Ola API etc. here
  // For prototype we simulate realistic data
  const estimates = [
    {
      provider: "Uber",
      logo: "🚗",
      options: [
        { type: "UberGo", fare: 120, eta: "4 mins", seats: 4 },
        { type: "UberPremier", fare: 220, eta: "6 mins", seats: 4 },
        { type: "UberXL", fare: 300, eta: "8 mins", seats: 6 },
      ],
    },
    {
      provider: "Ola",
      logo: "🟡",
      options: [
        { type: "Ola Mini", fare: 110, eta: "5 mins", seats: 4 },
        { type: "Ola Prime", fare: 200, eta: "7 mins", seats: 4 },
        { type: "Ola SUV", fare: 280, eta: "10 mins", seats: 6 },
      ],
    },
    {
      provider: "Rapido",
      logo: "🏍",
      options: [
        { type: "Bike", fare: 60, eta: "3 mins", seats: 1 },
        { type: "Auto", fare: 90, eta: "5 mins", seats: 3 },
      ],
    },
  ];

  res.json({ success: true, data: estimates });
});

// ─── POST /api/rides/book ─────────────────────────────────────────────────────
// Books a ride and saves it to MongoDB
// Protected — must be logged in
router.post("/book", protect, async (req, res) => {
  try {
    const { provider, rideType, pickup, dropoff, estimatedFare } = req.body;

    if (!provider || !rideType || !pickup || !dropoff || !estimatedFare) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const ride = await Ride.create({
      userId: req.userId, // from the protect middleware
      provider,
      rideType,
      pickup,
      dropoff,
      estimatedFare,
    });

    res.status(201).json({ success: true, data: ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/rides/history ───────────────────────────────────────────────────
// Returns all rides booked by the logged-in user
// Protected — must be logged in
router.get("/history", protect, async (req, res) => {
  try {
    const rides = await Ride.find({ userId: req.userId }).sort({ bookedAt: -1 });
    res.json({ success: true, data: rides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;