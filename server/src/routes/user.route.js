import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  resetUserPassword,
  changePassword
} from "../controllers/user.controller.js";
import { verifyJWT, verifyManager } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/reset-password").post(verifyJWT, verifyManager, resetUserPassword); // Add this line for password reset
router.route("/change-password").post(verifyJWT, changePassword); // Add this line for password change

router.route("/logout").post(verifyJWT, logoutUser);
// Get All Users (Manager Only)
router.route("/").get(verifyJWT, verifyManager, getAllUsers);

export default router;
