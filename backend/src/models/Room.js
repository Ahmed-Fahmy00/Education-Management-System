const mongoose = require("mongoose");
const Counter = require("./Counter");

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: Number, unique: true },
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["classroom", "lab", "hall"], required: true },
    building: { type: String, required: true, trim: true },
    capacity: { type: Number, min: 1, required: true },
    hasProjector: { type: Boolean, default: false },
  },
  { timestamps: true },
);

roomSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      "roomId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.roomId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Room", roomSchema);
