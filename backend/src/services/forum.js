const ForumPost = require("../models/ForumPost");
const ForumReply = require("../models/ForumReply");

function createPost(payload) {
  return ForumPost.create(payload);
}

function listPosts(query = {}) {
  return ForumPost.find(query)
    .populate("course", "code title")
    .sort({ createdAt: -1 });
}

function updatePost(id, payload) {
  return ForumPost.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

function deletePost(id) {
  return ForumPost.findByIdAndDelete(id);
}

function upvotePost(id) {
  return ForumPost.findByIdAndUpdate(
    id,
    { $inc: { upvotes: 1 } },
    { new: true },
  );
}

function createReply(payload) {
  return ForumReply.create(payload);
}

function listReplies(postId) {
  return ForumReply.find({ post: postId }).sort({ createdAt: 1 });
}

function markOfficialReply(postId, replyId) {
  return ForumReply.findOneAndUpdate(
    { _id: replyId, post: postId },
    { isOfficialAnswer: true },
    { new: true },
  );
}

module.exports = {
  createPost,
  listPosts,
  updatePost,
  deletePost,
  upvotePost,
  createReply,
  listReplies,
  markOfficialReply,
};
