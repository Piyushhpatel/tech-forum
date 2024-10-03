import {Post} from "../models/Post.models.js";
import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Category } from "../models/Category.model.js";


const createPost = AsyncHandler(async (req, res) => {
    const {title, content, category} = req.body;

    if(!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const categoryData = await Category.findOne({name: category});

    if(!categoryData) {
        throw new ApiError(404, "Category not found");
    }

    const newPost = await Post.create({
        title,
        content,
        category: [categoryData._id],
    });

    if(!newPost) {
        throw new ApiError(500, "Post creation failed");
    }

    res.status(201).json(new ApiResponse(201, newPost, "Post created Succesfully"));
});

const getPosts = AsyncHandler(async (req, res) => {
    const {page=1, limit=5, query} = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const pipeline = []

    if(query) {
        pipeline.push({
            $match: {
                title: {
                    $regex: query || "",
                    $options: "i",
                },
            },
        });
    }

    pipeline.push({
        $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            as: "comments",
        },
    });

    pipeline.push({
        $addFields: {
            totalComments: {
                $size: "$comments",
            },
        },
    });

    pipeline.push({
        $project: {
            comments: 0,
        },
    });

    pipeline.push({
        $sort: {
            createdAt: -1,
        }
    })

    const options = {
        page: pageNum,
        limit: limitNum,
    };


    const post = await Post.aggregatePaginate(pipeline, options);

    if(post.docs.length === 0) {
        throw new ApiError(404, "Posts not found");
    }

    post.nextPage = post.nextPage ? `${req.protocol}://${req.get("host")}/api/v1/posts?page=${post.nextPage}&limit=${limit}` : null;
    post.prevPage = post.prevPage ? `${req.protocol}://${req.get("host")}/api/v1/posts?page=${post.prevPage}&limit=${limit}` : null;

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

const getPostsByCategory = AsyncHandler(async (req, res) => {
    const {category} = req.params;

    const categoryData = await Category.findOne({name: category});

    if(!categoryData) {
        throw new ApiError(404, "Category not found");
    }

    const posts = await Post.find({category: {$in: [categoryData._id]}});

    if(posts.length === 0) {
        throw new ApiError(404, "Posts not found");
    }

    return res.status(200).json(new ApiResponse(200, posts, "Posts fetched successfully"));
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

export {createPost, getPosts, getPost, updatePost, deletePost, increaseLikes, decreaseLikes, getPostsByCategory};