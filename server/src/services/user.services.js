import { Users } from "../models/user.model.js";
import { userRole } from "../constants/constants.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Wishlists } from "../models/wishlist.model.js";
import connectDB from "../config/db.js";
import crypto from "node:crypto";

const MANAGER = [
  "manager@example.com",
  "yatharthupmanyu@gmail.com",
  "aadijaintikamgarh@gmail.com",
  "one@example.com",
  "two@example.com",
];

export const registerUserService = async (userData) => {
  await connectDB();
  const { name, email, password } = userData;

  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const validUser = await Wishlists.findOne({ email });

  if (!validUser) {
    throw new ApiError(409, "Invalid user, Contact administration");
  }

  const assignedRole = MANAGER.includes(email)
    ? userRole.MANAGER
    : userRole.USER;

  const newUser = await Users.create({
    name,
    email,
    password,
    role: assignedRole,
  });

  const createdUser = await Users.findById(newUser._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return createdUser;
};

export const loginUserService = async (email, password) => {
  await connectDB();
  const user = await Users.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "secret_key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
  console.log("login successfully done");

  const loggedInUser = await Users.findById(user._id).select("-password");
  return { user: loggedInUser, token };
};

export const getAllUsersService = async () => {
  await connectDB();
  return await Users.find({}).select("-password");
};

export const resetUserPasswordService = async (email) => {
  await connectDB();

  const user = await Users.findOne({email: email});
  
  if(!user){
    throw new ApiError(404, "User not found");
  }

  let pass = crypto.createHash("sha256").update("password").digest("hex");
  user.password = pass;
  await user.save();

  return { message: "Password reset successfully to 'password'. Please change it after logging in.", password: pass };

}

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  await connectDB();

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if(!await user.comparePassword(currentPassword)) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password changed successfully" , user };
}