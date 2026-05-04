const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true, trim: true },
    senderRole: {
      type: String,
      enum: ["student", "parent", "professor", "ta"],
      required: true,
    },
    receiverName: { type: String, required: true, trim: true },
    receiverRole: {
      type: String,
      enum: ["student", "parent", "professor", "ta"],
      required: true,
    },
    subject: { type: String, trim: true },
    body: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
