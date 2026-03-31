import { Router } from "express";
import {
  addWishlistEmailController,
  updateWishlistEmailController,
  deleteWishlistEmailController,
} from "../controllers/wishlist.controller.js";
import { verifyJWT, verifyManager } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add").post(addWishlistEmailController);
router
  .route("/update/:email")
  .patch(updateWishlistEmailController);
router
  .route("/:email")
  .delete(deleteWishlistEmailController);

export default router;
