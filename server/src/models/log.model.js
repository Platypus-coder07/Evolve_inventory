import mongoose from "mongoose";
import { logStatus } from "../constants/constants.js";

const logSchema = new mongoose.Schema(
    {
        component: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "components",
            required: true,
            index: true
        },
        quantity: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: [logStatus.OPEN, logStatus.CLOSED],
            default: logStatus.OPEN
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "users",
            required: true,
            index: true
        },
        remark: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { timestamps: true }
);

export const Logs = mongoose.model("logs", logSchema);