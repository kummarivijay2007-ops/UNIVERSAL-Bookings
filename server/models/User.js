const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,          // No two users can have the same email
    lowercase: true,       // Always store email in lowercase
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ── Hash password BEFORE saving to DB ────────────────────────────────────────
// This runs automatically every time a user is saved
userSchema.pre("save", async function (next) {
  // Only hash if password was changed (not on other updates)
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10); // 10 = complexity level
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Method to compare entered password with hashed DB password ───────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);