const mongoose = require("mongoose");

const roomBookingSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    title: { type: String, required: true, trim: true },
    bookedByName: { type: String, required: true, trim: true },
    bookedByRole: {
      type: String,
      enum: ["staff", "admin", "professor", "ta"],
      required: true,
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
  },
  { timestamps: true },
);

roomBookingSchema.index({ room: 1, startsAt: 1, endsAt: 1 });

module.exports = mongoose.model("RoomBooking", roomBookingSchema);
