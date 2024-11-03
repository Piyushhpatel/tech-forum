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
import {verifyJWT} from "../middlewares/auth.middleware.js";


const router = Router();
router.route("/:postId").post(verifyJWT, createComment).get(getComments);
router
  .route("/:postId/:commentId")
  .get(getComment)
  .patch(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment)
  .post(verifyJWT, createComment);

router.route("/:postId/:commentId/upvote").post(verifyJWT, upvoteComment);
router.route("/:postId/:commentId/downvote").post(verifyJWT, downvoteComment);

export default router;
