const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // links to the User who booked
    ref: "User",
    required: true,
  },
  provider: {
    type: String,
    required: true, // "Uber", "Ola", "Rapido"
  },
  rideType: {
    type: String,
    required: true, // "UberGo", "Ola Mini", "Bike", etc.
  },
  pickup: {
    type: String,
    required: true,
  },
  dropoff: {
    type: String,
    required: true,
  },
  estimatedFare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed",
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ride", rideSchema);