const mongoose = require("mongoose");

const roomBookingSchema = new mongoose.Schema(
  {
    room: { type: Number, ref: "Room", required: true },
    title: { type: String, required: true, trim: true },
    bookedByName: { type: String, required: true, trim: true },
    bookedByRole: {
      type: String,
      enum: ["staff", "admin", "professor", "ta", "student", "instructor"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
  },
  { timestamps: true },
);

roomBookingSchema.index({ room: 1, startsAt: 1, endsAt: 1 });

module.exports = mongoose.model("RoomBooking", roomBookingSchema);
