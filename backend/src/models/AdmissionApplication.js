const mongoose = require("mongoose");

const admissionApplicationSchema = new mongoose.Schema(
  {
    applicantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    desiredDepartment: { type: String, required: true, trim: true },
    highSchoolScore: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["submitted", "under-review", "accepted", "rejected"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "AdmissionApplication",
  admissionApplicationSchema,
);
