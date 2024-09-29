import {Post} from "../models/Post.models.js";
import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const createPost = AsyncHandler(async (req, res) => {
    const {title, content, category} = req.body;

    if(!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }


    const newPost = await Post.create({
        title,
        content,
        category,
    });

    if(!newPost) {
        throw new ApiError(500, "Post creation failed");
    }

    res.status(201).json(new ApiResponse(201, newPost, "Post created Succesfully"));
});

const getPosts = AsyncHandler(async (req, res) => {
    const {page=1, limit=10, query} = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const post = await Post.aggregate([
        {
            $match: {
                title: {
                    $regex: query || "",
                    $options: "i",
                },
            },
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "comments",
            },
        },
        {
            $addFields: {
                totalComments: {
                    $size: "$comments",
                },
            },
        },
        {
            $project: {
                comments: 0,
            },
        }
    ]);

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    Post.aggregatePaginate(post, options);

    res.status(200).json(new ApiResponse(200, post, "Posts fetched successfully"));
});

const getPost = AsyncHandler(async (req, res) => {
    const {postId} = req.params;

    const post = await Post.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(postId),
            },
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "comments",
            },
        },
        {
            $addFields: {
                totalComments: {
                    $size: "$comments",
                },
            },
        },
        {
            $project: {
                comments: 0,
            },
        }
    ])

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

const updatePost = AsyncHandler(async (req, res) => {
    const {postId} = req.params;
    const {title, content, category} = req.body;

    const post = await Post.findById(postId);
    
    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;

    await post.save({validateBVeforeSave: false});

    res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

const deletePost = AsyncHandler(async (req, res) => {
    const {postId} = req.params;
    const post = await Post.findByIdAndDelete(postId);

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    res.status(200).json(new ApiResponse(200, post, "Post deleted successfully"));
});

const increaseLikes = AsyncHandler(async (req, res) => {
    const {postId} = req.params;
    const post = await Post.findById(postId);

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    post.upvotes += 1;
    await post.save({validateBeforeSave: false});
    
    res.status(200).json(new ApiResponse(200, post, "Post upvoted successfully"));
});

const decreaseLikes = AsyncHandler(async (req, res) => {
    const {postId} = req.params;
    const post = await Post.findById(postId);

    if(!post) {
        throw new ApiError(404, "Post not found");
    }

    post.downvotes += 1;
    await post.save({validateBeforeSave: false});
    
    res.status(200).json(new ApiResponse(200, post, "Post downvoted successfully"));
});

export {createPost, getPosts, getPost, updatePost, deletePost, increaseLikes, decreaseLikes};