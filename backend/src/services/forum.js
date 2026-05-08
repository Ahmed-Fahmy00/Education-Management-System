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

async function upvotePost(id, userId) {
  const post = await ForumPost.findById(id);
  if (!post) return null;
  
  if (!post.upvotedBy) {
    post.upvotedBy = [];
  }

  if (post.upvotedBy.includes(userId)) {
    // Toggle off if already upvoted
    post.upvotes = Math.max(0, post.upvotes - 1);
    post.upvotedBy = post.upvotedBy.filter(uId => uId !== userId);
  } else {
    // Toggle on
    post.upvotes += 1;
    post.upvotedBy.push(userId);
  }
  
  return post.save();
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
