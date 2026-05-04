const express = require("express");
const controller = require("../controllers/forum");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/posts", controller.listPosts);
router.post(
  "/posts",
  requireRole(["student", "professor", "ta"]),
  controller.createPost,
);
router.patch(
  "/posts/:postId",
  requireRole(["student", "professor", "ta"]),
  controller.updatePost,
);
router.delete(
  "/posts/:postId",
  requireRole(["student", "professor", "ta"]),
  controller.deletePost,
);
router.post(
  "/posts/:postId/upvote",
  requireRole(["student", "professor", "ta"]),
  controller.upvotePost,
);
router.get("/posts/:postId/replies", controller.listReplies);
router.post(
  "/posts/:postId/replies",
  requireRole(["student", "professor", "ta"]),
  controller.createReply,
);
router.post(
  "/posts/:postId/replies/:replyId/official",
  requireRole(["professor", "ta"]),
  controller.markOfficialReply,
);

module.exports = router;
