const mongoose = require("mongoose");

const courseRegistrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    semester: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["enrolled", "dropped", "completed"],
      default: "enrolled",
    },
    grade: { type: String, trim: true },
  },
  { timestamps: true },
);

courseRegistrationSchema.index(
  { student: 1, course: 1, semester: 1 },
  { unique: true },
);

module.exports = mongoose.model("CourseRegistration", courseRegistrationSchema);
