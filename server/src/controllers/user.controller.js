import {
  registerUserService,
  loginUserService,
  getAllUsersService,
  resetUserPasswordService,
  changePasswordService
} from "../services/user.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  if (
    [req.body.name, req.body.email, req.body.password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await registerUserService(req.body);
  console.log("user registered successfully");
  
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const { user, token } = await loginUserService(email, password);
  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("accessToken", token, options) // Optional: Set cookie
    .json(new ApiResponse(200, { user, token }, "User logged In Successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsersService();
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const {email} = req.body;

  if(!email){
    throw new ApiError(400, "Email is required");
  }

  const newPassword = await resetUserPasswordService(email);

  return res
    .status(200)
    .json(new ApiResponse(200, newPassword, "Password reset successfully"));
})

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if(!currentPassword || !newPassword){
    throw new ApiError(400, "Current password and new password are required");
  }

  const result = await changePasswordService(userId, currentPassword, newPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Password changed successfully"));

});