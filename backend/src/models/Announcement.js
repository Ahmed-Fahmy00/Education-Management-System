const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    type: {
      type: String,
      enum: ["general", "course"],
      default: "general",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: function() {
        return this.type === "course";
      },
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Announcement", announcementSchema);
