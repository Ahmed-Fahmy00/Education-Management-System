const mongoose = require("mongoose");

const forumReplySchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true,
    },
    parentReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumReply",
      default: null,
    },
    authorName: { type: String, required: true, trim: true },
    authorRole: {
      type: String,
      enum: ["student", "professor", "ta"],
      default: "student",
    },
    body: { type: String, required: true, trim: true },
    isOfficialAnswer: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ForumReply", forumReplySchema);
