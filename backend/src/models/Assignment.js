const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Referencing the Staff model (auth/base model)
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // The admin who made the assignment
    }
  },
  { timestamps: true }
);

// DATA INTEGRITY: Compound unique index to prevent duplicate staff-course links
assignmentSchema.index({ staffId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
