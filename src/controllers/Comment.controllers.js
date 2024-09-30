import { Comment } from "../models/Comment.models.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/Post.models.js";

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

const getComments = AsyncHandler(async (req, res) => {
    const {postId} = req.params;

    const comment = await Comment.aggregate([
        {
            $match: {
                post: postId,
            }
        },
        {
            $lookup: {
                from: "comments",
                foreignField: "_id",
                localField: "post",
                as: "comments",
            }
        },
        {
            $addFields: {
                commentCount: {
                    $size: "$comments",
                }
            }
        },
        {
            $project: {
                comments: 0,
            }
        }
    ]);

    if(!comment){
        throw new ApiError(404, "Comments not found");
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment fetched successfully")
    )
});

const getComment = AsyncHandler(async (req, res) => {
    const {postId, commentId} = req.params;

    const comment = await Comment.aggregate([
        {
            $match: {
                comment: commentId,
                post: postId,
            }
        },
        {
            $lookup: {
                from: "comments",
                foreignField: "_id",
                localField: "comment",
                as: "comments",
            }
        },
        {
            $addFields: {
                commentCount: {
                    $size: "$comments",
                }
            }
        },
        {
            $project: {
                comments: 0,
            }
        }
    ]);

    if(!comment){
        throw new ApiError(404, "Comments not found");
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment fetched successfully")
    )
});

const updateComment = AsyncHandler(async (req, res) => {
    const {postId, commentId} = req.params;
    const {content} = req.body;

    const post = await Post.findById(postId);

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment Doesn't exist");
    }

    comment.content = content || comment.content;
    await comment.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, "Comment Update Successfully")
    )
});

const deleteComment = AsyncHandler(async (req, res) => {
    const {postId, commentId} = req.params;

    const post = await Post.findById(postId);

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment Doesn't exist");
    }

    return res.status(200).json(
        new ApiResponse(200, "Comment Deleted Successfully")
    )
});

const upvoteComment = AsyncHandler(async (req, res) => {
    const {postId, commentId} = req.params;

    const post = await Post.findById(postId);

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment Doesn't exist");
    }

    comment.upvotes += 1;
    await comment.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, "Upvoted successfully")
    )
});

const downvoteComment = AsyncHandler(async (req, res) => {
    const {postId, commentId} = req.params;

    const post = await Post.findById(postId);

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment Doesn't exist");
    }

    comment.downvotes += 1;
    await comment.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, "Downvoted successfully")
    )
});

export {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
};
