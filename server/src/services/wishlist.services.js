import { Wishlists } from "../models/wishlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import connectDB from "../config/db.js";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());

const addWishlistEmailService = async (username, email) => {
  await connectDB();

  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedUsername = (username || "").trim();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    throw new ApiError(400, "Valid email is required");
  }

  const existingEntry = await Wishlists.findOne({ email: normalizedEmail });
  if (existingEntry) {
    throw new ApiError(409, "Email already exists in wishlist");
  }

  const wishlistEntry = await Wishlists.create({
    username: normalizedUsername || normalizedEmail.split("@")[0],
    email: normalizedEmail,
  });

  return wishlistEntry;
};

const updateWishlistEmailService = async (currentEmail, username, newEmail) => {
  await connectDB();

  const normalizedCurrentEmail = (currentEmail || "").trim().toLowerCase();
  const normalizedNewEmail = (newEmail || "").trim().toLowerCase();
  const normalizedUsername = (username || "").trim();

  if (!normalizedCurrentEmail || !isValidEmail(normalizedCurrentEmail)) {
    throw new ApiError(400, "Valid current email is required");
  }

  if (!normalizedNewEmail || !isValidEmail(normalizedNewEmail)) {
    throw new ApiError(400, "Valid new email is required");
  }

  const wishlistEntry = await Wishlists.findOne({ email: normalizedCurrentEmail });
  if (!wishlistEntry) {
    throw new ApiError(404, "Wishlist email not found");
  }

  if (normalizedCurrentEmail !== normalizedNewEmail) {
    const existingTarget = await Wishlists.findOne({ email: normalizedNewEmail });
    if (existingTarget) {
      throw new ApiError(409, "New email already exists in wishlist");
    }
  }

  wishlistEntry.email = normalizedNewEmail;
  if (normalizedUsername) {
    wishlistEntry.username = normalizedUsername;
  }

  await wishlistEntry.save({ validateBeforeSave: false });

  return wishlistEntry;
};

const deleteWishlistEmailService = async (email) => {
  await connectDB();

  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    throw new ApiError(400, "Valid email is required");
  }

  const deletedEntry = await Wishlists.findOneAndDelete({ email: normalizedEmail });
  if (!deletedEntry) {
    throw new ApiError(404, "Wishlist email not found");
  }

  return deletedEntry;
};

export {
  addWishlistEmailService,
  updateWishlistEmailService,
  deleteWishlistEmailService,
};
