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

import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getPosts).post(verifyJWT, createPost);
router.route("/:category").get(getPostsByCategory);
router.route("/:postId").get(getPost).patch(verifyJWT, updatePost).delete(verifyJWT, deletePost);
router.route("/:postId/upvote").patch(verifyJWT, increaseLikes);
router.route("/:postId/downvote").patch(verifyJWT, decreaseLikes);

export default router;
