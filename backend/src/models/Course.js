const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    credits: { type: Number, min: 1, max: 6, default: 3 },
    type: { type: String, enum: ["core", "elective"], default: "core" },
    department: { type: String, required: true, trim: true },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    capacity: { type: Number, min: 1, default: 80 },
    instructorName: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Course", courseSchema);
