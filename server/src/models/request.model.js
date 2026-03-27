import mongoose from "mongoose";
import { requestStatus, requestType } from "../constants/constants.js";

const requestSchema = new mongoose.Schema(
  {
    component: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "components",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    remark: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        requestStatus.PENDING,
        requestStatus.APPROVED,
        requestStatus.REJECTED,
      ],
      default: requestStatus.PENDING,
    },
    type: {
      type: String,
      enum: Object.values(requestType),
      required: true,
    },
  },
  { timestamps: true }
);

export const Requests = mongoose.model("requests", requestSchema);
