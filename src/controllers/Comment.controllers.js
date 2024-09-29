import { Comment } from "../models/Comment.models.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createComment = AsyncHandler(async (req, res) => {
    const {content} = req.body;
    const {postId, commentId} = req.params;

    if(post && !commentId){
        const comment = await Comment.create({
            content,
            post: postId,
        });

        if(!comment){
            throw new ApiError(400, "Comment could not be created");
        }

        return res.status(201).json(new ApiResponse(201, comment));
    }

    if(post && commentId){
        const comment = await Comment.create({
            content,
            comment: commentId,
        });

        if(!comment){
            throw new ApiError(400, "Comment could not be created");
        }

        return res.status(201).json(new ApiResponse(201, comment));
    }

    throw new ApiError(400, "Post not found");
});
const getComments = AsyncHandler(async (req, res) => {});
const getComment = AsyncHandler(async (req, res) => {});
const updateComment = AsyncHandler(async (req, res) => {});
const deleteComment = AsyncHandler(async (req, res) => {});
const upvoteComment = AsyncHandler(async (req, res) => {});
const downvoteComment = AsyncHandler(async (req, res) => {});

export {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
};
