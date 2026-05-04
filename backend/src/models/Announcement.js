const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    postedBy: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Announcement", announcementSchema);
