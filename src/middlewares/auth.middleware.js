import {User} from "../models/user.model.js"
import jwt from 'jsonwebtoken'
import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"

const verifyJWT = AsyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer", "");
        
        if(!token) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -forgotPasswordOTP -forgotPasswordOTPExpiry -refreshToken");

        if(!user){
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Unauthorized Request");
    }
})

export {verifyJWT}