const mongoose = require("mongoose");

const meetingRequestSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    professorName: { type: String, required: true, trim: true },
    requestedAt: { type: Date, required: true },
    topic: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "declined"],
      default: "pending",
    },
    responseNote: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MeetingRequest", meetingRequestSchema);
