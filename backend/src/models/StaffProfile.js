const mongoose = require("mongoose");

const staffProfileSchema = new mongoose.Schema(
  {
    staffCode: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["professor", "ta", "admin", "employee"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    officeLocation: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StaffProfile", staffProfileSchema);
