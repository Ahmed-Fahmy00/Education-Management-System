const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    authorName: { type: String, required: true, trim: true },
    authorRole: {
      type: String,
      enum: ["student", "professor", "ta"],
      default: "student",
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    upvotes: { type: Number, default: 0, min: 0 },
    upvotedBy: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("ForumPost", forumPostSchema);
