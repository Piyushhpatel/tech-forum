import { Router } from "express";
import {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
} from "../controllers/Comment.controllers.js";

const router = Router();
router.route("/:postId").post(createComment).get(getComments);
router
  .route("/:postId/:commentId")
  .get(getComment)
  .put(updateComment)
  .delete(deleteComment)
  .post(createComment);

router.route("/:postId/:commentId/upvote").post(upvoteComment);
router.route("/:postId/:commentId/downvote").post(downvoteComment);

export default router;
