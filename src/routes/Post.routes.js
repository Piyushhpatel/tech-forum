import { Router } from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  increaseLikes,
  decreaseLikes,
  getPostsByCategory
} from "../controllers/Post.controllers.js";
const router = Router();

router.route("/").get(getPosts).post(createPost);
router.route("/:category").get(getPostsByCategory);
router.route("/:postId").get(getPost).patch(updatePost).delete(deletePost);
router.route("/:postId/upvote").patch(increaseLikes);
router.route("/:postId/downvote").patch(decreaseLikes);

export default router;
