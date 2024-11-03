import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

//For later purpose
// const generateOtp = async (userId, type = "verification") => {
//   try {
//     const user = await User.findById(userId);
//     const { otp, expiry } = user.generateOtp();

//     if (type === "forgotPassword") {
//       user.forgotPasswordOTP = otp;
//       user.forgotPasswordOTPExpiry = expiry;
//       await user.save({ validateBeforeSave: false });
//       return otp;
//     }
//     user.verificationOTP = otp;
//     user.verificationOTPExpiry = expiry;
//     await user.save({ validateBeforeSave: false });
//     return otp;
//   } catch (error) {
//     throw new ApiError(500, "Something went wrong while generating OTP");
//   }
// };

const registerUser = AsyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username && !password) {
    throw new ApiError(401, "All Fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(401, "User Already Exist");
  }

  const user = await User.create({
    email,
    username,
    password,
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while create a user");
  }

  const newUser = await User.findById(user._id).select(
    "-password -refreshToken -forgotPasswordOTP -forgotPasswordOTPExpiry"
  );

  return res
    .status(200)
    .json(new ApiResponse(201, newUser, "User created successfully"));
});

const loginUser = AsyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -forgotPasswordOTP -forgotPasswordOTPExpiry"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully"
      )
    );
});

const logoutUser = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      refreshToken: "",
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = AsyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// const updateProfile = asyncHandler(async (req, res) => {
//   const { fullName, year, college, mobileNumber, gender, course } = req.body;

//   if (!fullName && !year && !college && !mobileNumber && !gender && !course) {
//     throw new ApiError(400, "No fields to update");
//   }

//   const updateFields = {};

//   if (fullName) updateFields.fullName = fullName;
//   if (year) updateFields.year = year;
//   if (college) updateFields.college = college;
//   if (mobileNumber) updateFields.mobileNumber = mobileNumber;
//   if (gender) updateFields.gender = gender;
//   if (course) updateFields.course = course;

//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     { $set: updateFields },
//     { new: true }
//   ).select(
//     "-password -refreshToken -verificationOTP -verificationOTPExpiry -forgotPasswordOTP -forgotPasswordOTPExpiry"
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Account details updated successfully"));
// });

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new ApiError(401, "incoming refresh token missing");
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decoded?._id);

  if (!user) {
    throw new ApiError(401, "unable to authenticate user");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "unable to authenticate user");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "Access token refreshed successfully"));
});

const changePassword = AsyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorr = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorr) {
    throw new ApiError(400, "Invalid Old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const forgotPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const otp = await generateOtp(user?._id, "forgotPassword");
  cleanForgotPasswordOtp(user?._id);
  const forgotPasswordMail = sendForgotPasswordOtpMail(user.email, otp);

  if (forgotPasswordMail) {
    throw new ApiError(500, "Something went wrong while sending OTP");
  }

  return res.status(200).json(new ApiResponse(200, "OTP Sent Successfully"));
});

const changeForgetPassword = AsyncHandler(async (req, res) => {
  const {email, newPassword} = req.body;

  const user = await User.findOne({email});

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  changePassword,
  forgotPassword,
  changeForgetPassword
};
