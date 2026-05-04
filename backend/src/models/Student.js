const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: { type: String, required: true, trim: true },
    level: { type: Number, min: 1, max: 8, default: 1 },
    parentEmail: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
