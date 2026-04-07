const mongoose = require("mongoose");

const flightBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tripType: { type: String, enum: ["oneway", "roundtrip"], required: true },
  // Outbound flight
  outbound: {
    airline: String,
    flightNo: String,
    from: String,
    to: String,
    departure: String,
    arrival: String,
    duration: String,
    stops: Number,
    date: String,
  },
  // Return flight (only for roundtrip)
  returnFlight: {
    airline: String,
    flightNo: String,
    from: String,
    to: String,
    departure: String,
    arrival: String,
    duration: String,
    stops: Number,
    date: String,
  },
  passengers: { type: Number, required: true },
  seatClass: { type: String, enum: ["Economy", "Business"], required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  bookedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FlightBooking", flightBookingSchema);