import { Category } from "../models/Category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const createCategory = AsyncHandler(async (req, res) => {
    const {name, description} = req.body;

    if(!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    const category = await Category.create({name, description});

    if(!category) {
        throw new ApiError(500, "Category could not be created");
    }

    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

const getCategories = AsyncHandler(async (req, res) => {
    const categories = await Category.find();

    if(!categories) {
        throw new ApiError(404, "No categories found");
    }

    return res.status(200).json(new ApiResponse(200, categories, "Categories retrieved successfully"));
});

const getCategory = AsyncHandler(async (req, res) => {
    const {id} = req.params;

    const category = await Category.findById(id);

    if(!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json(new ApiResponse(200, category, "Category retrieved successfully"));
});

const updateCategory = AsyncHandler(async (req, res) => {
    const {id} = req.params;
    const {name, description} = req.body;

    const category = await Category.findByIdAndUpdate(id, {name, description}, {new: true});

    if(!category) {
        throw new ApiError(500, "Category could not be updated");
    }

    return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

const deleteCategory = AsyncHandler(async (req, res) => {
    const {id} = req.params;

    const category = await Category.findByIdAndDelete(id);

    if(!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json(new ApiResponse(200, "Category deleted successfully"));
});

export {createCategory, getCategories, getCategory, updateCategory, deleteCategory};
