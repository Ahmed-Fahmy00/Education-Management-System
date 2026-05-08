const mongoose = require("mongoose");

const maintenanceReportSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    issueDescription: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    reportedBy: { type: String, required: true, trim: true },
    reportedById: { type: String, trim: true },
    reportedByRole: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MaintenanceReport", maintenanceReportSchema);
