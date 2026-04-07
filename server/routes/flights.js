const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const FlightBooking = require("../models/Flight");

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

// ─── Helper: generate mock flights ───────────────────────────────────────────
const generateFlights = (from, to, date, seatClass, passengers) => {
  const airlines = [
    { name: "IndiGo", code: "6E", logo: "🔵" },
    { name: "Air India", code: "AI", logo: "🔴" },
    { name: "Vistara", code: "UK", logo: "🟣" },
    { name: "SpiceJet", code: "SG", logo: "🟠" },
    { name: "Akasa Air", code: "QP", logo: "🟡" },
  ];

  const baseEconomy = Math.floor(Math.random() * 3000) + 3000;
  const baseBusiness = baseEconomy * 3;
  const basePrice = seatClass === "Business" ? baseBusiness : baseEconomy;

  const departureTimes = ["05:30", "07:00", "09:15", "11:45", "13:30", "15:00", "17:20", "19:45", "21:30"];
  const durations = ["1h 30m", "1h 50m", "2h 10m", "2h 30m", "2h 45m", "3h 00m"];
  const stopOptions = [0, 0, 0, 1, 1]; // More non-stop than 1-stop

  return airlines.map((airline, i) => {
    const depTime = departureTimes[i % departureTimes.length];
    const dur = durations[i % durations.length];
    const stops = stopOptions[i % stopOptions.length];
    const priceMod = 1 + (i * 0.07);
    const price = Math.floor(basePrice * priceMod * passengers);

    // Calculate arrival time
    const [dh, dm] = depTime.split(":").map(Number);
    const [dhr, dmr] = dur.replace("h ", ":").replace("m", "").split(":").map(Number);
    const arrTotal = dh * 60 + dm + dhr * 60 + dmr;
    const arrH = Math.floor(arrTotal / 60) % 24;
    const arrM = arrTotal % 60;
    const arrTime = `${String(arrH).padStart(2, "0")}:${String(arrM).padStart(2, "0")}`;

    return {
      id: `${airline.code}-${Math.floor(Math.random() * 9000) + 1000}`,
      airline: airline.name,
      logo: airline.logo,
      flightNo: `${airline.code} ${Math.floor(Math.random() * 900) + 100}`,
      from, to, date,
      departure: depTime,
      arrival: arrTime,
      duration: dur,
      stops,
      price,
      seatsLeft: Math.floor(Math.random() * 15) + 1,
    };
  }).sort((a, b) => a.price - b.price); // Sort by price by default
};

// ─── GET /api/flights/search ──────────────────────────────────────────────────
router.get("/search", protect, (req, res) => {
  const { from, to, date, returnDate, tripType, seatClass, passengers } = req.query;

  if (!from || !to || !date)
    return res.status(400).json({ error: "From, to and date are required" });

  const pax = parseInt(passengers) || 1;
  const outboundFlights = generateFlights(from, to, date, seatClass, pax);

  const result = { outbound: outboundFlights };

  // Generate return flights if roundtrip
  if (tripType === "roundtrip" && returnDate) {
    result.returnFlights = generateFlights(to, from, returnDate, seatClass, pax);
  }

  res.json({ success: true, data: result });
});

// ─── POST /api/flights/book ───────────────────────────────────────────────────
router.post("/book", protect, async (req, res) => {
  try {
    const { tripType, outbound, returnFlight, passengers, seatClass, totalAmount } = req.body;

    if (!outbound || !passengers || !seatClass || !totalAmount)
      return res.status(400).json({ error: "All fields are required" });

    const booking = await FlightBooking.create({
      userId: req.userId,
      tripType, outbound,
      returnFlight: returnFlight || undefined,
      passengers, seatClass, totalAmount,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/flights/history ─────────────────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    const bookings = await FlightBooking.find({ userId: req.userId }).sort({ bookedAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;