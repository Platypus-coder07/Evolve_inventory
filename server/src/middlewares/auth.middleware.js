import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Users } from "../models/user.model.js";
import { userRole } from "../constants/constants.js";
import connectDB from '../config/db.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    await connectDB();
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const secret = process.env.JWT_SECRET || "secret_key";
    const tokenDecoded = jwt.verify(token, secret);
    const user = await Users.findById(tokenDecoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});


export const verifyManager = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== userRole.MANAGER) {
    throw new ApiError(403, "Access Denied: Managers only");
  }
  next();
});
