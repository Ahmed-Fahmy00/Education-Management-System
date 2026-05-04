const mongoose = require("mongoose");

const transcriptCourseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const transcriptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    records: [transcriptCourseSchema],
    cgpa: { type: Number, min: 0, max: 4, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transcript", transcriptSchema);
