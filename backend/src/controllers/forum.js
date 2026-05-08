const forumService = require("../services/forum");

async function createPost(req, res, next) {
  try {
    const row = await forumService.createPost(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function listPosts(req, res, next) {
  try {
    const query = req.query.course ? { course: req.query.course } : {};
    const rows = await forumService.listPosts(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const row = await forumService.updatePost(req.params.postId, req.body);
    if (!row) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const row = await forumService.deletePost(req.params.postId);
    if (!row) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function upvotePost(req, res, next) {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "User ID missing for upvote" });
    }
    const row = await forumService.upvotePost(req.params.postId, userId);
    if (!row) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function createReply(req, res, next) {
  try {
    const row = await forumService.createReply({
      ...req.body,
      post: req.params.postId,
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function listReplies(req, res, next) {
  try {
    const rows = await forumService.listReplies(req.params.postId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function markOfficialReply(req, res, next) {
  try {
    const row = await forumService.markOfficialReply(
      req.params.postId,
      req.params.replyId,
    );
    if (!row) {
      return res.status(404).json({ message: "Reply not found for this post" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
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
