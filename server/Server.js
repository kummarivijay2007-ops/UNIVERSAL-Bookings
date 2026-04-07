require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./DB");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));            // Allow requests from React frontend
app.use(express.json());          // Parse incoming JSON request bodies

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/rides", require("./routes/rides"));   // We'll add this next
app.use("/api/food", require("./routes/food"));   // We'll add this next
app.use("/api/movies", require("./routes/movies"));
app.use("/api/flights", require("./routes/flights"));
app.use("/api/buses", require("./routes/buses")); 
app.use("/api/shop", require("./routes/shop"));
// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Universal Bookings API is running 🚀" });
});

// ── Start server after DB connects ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});