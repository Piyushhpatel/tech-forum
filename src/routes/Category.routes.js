import { Router } from "express";
import {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/Category.controllers.js";

const router = Router();

router.route("/").post(createCategory).get(getCategories);
router.route("/:id").get(getCategory).put(updateCategory).delete(deleteCategory);

export default router;