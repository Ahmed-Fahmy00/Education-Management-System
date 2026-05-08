const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    leaveType: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    }
    // Audit logs moved to separate collection for scalability
  },
  { timestamps: true }
);

leaveRequestSchema.index({ staffId: 1, status: 1 });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
