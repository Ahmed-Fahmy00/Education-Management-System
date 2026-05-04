const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["classroom", "lab", "hall"], required: true },
    building: { type: String, required: true, trim: true },
    capacity: { type: Number, min: 1, required: true },
    hasProjector: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", roomSchema);
