import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addWishlistEmailService,
  updateWishlistEmailService,
  deleteWishlistEmailService,
} from "../services/wishlist.services.js";

const addWishlistEmailController = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  const wishlistEntry = await addWishlistEmailService(username, email);

  return res
    .status(201)
    .json(new ApiResponse(201, wishlistEntry, "Wishlist email added successfully"));
});

const updateWishlistEmailController = asyncHandler(async (req, res) => {
  const { email: currentEmail } = req.params;
  const { username, email: newEmail } = req.body;

  const wishlistEntry = await updateWishlistEmailService(
    currentEmail,
    username,
    newEmail
  );

  return res
    .status(200)
    .json(new ApiResponse(200, wishlistEntry, "Wishlist email updated successfully"));
});

const deleteWishlistEmailController = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const deletedEntry = await deleteWishlistEmailService(email);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedEntry, "Wishlist email deleted successfully"));
});

export {
  addWishlistEmailController,
  updateWishlistEmailController,
  deleteWishlistEmailController,
};
