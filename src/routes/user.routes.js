import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    changePassword,
    forgotPassword,
    changeForgetPassword
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register-user").post(registerUser);
router.route("/login-user").post(loginUser);
router.route("/logout-user").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/refresh-access-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/forgot-password").post(forgotPassword);
router.route("/change-forget-password").patch(changeForgetPassword);

export default router;
