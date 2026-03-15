import mongoose from "mongoose";
import { componentStatus, componentCategory } from "../constants/constants.js";
/**
 * Component Model
 * _id: ObjectId
 * name: String
 * image: String (URL from CDN(cloudinary))
 * description: String
 * total_quantity: Number
 * component_working: Number
 * component_not_working: Number
 * component_in_use: Number
 * remark: String
 * category: String 
 * updatedAt: Date
 * createdAt: Date
 */

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    image: {
      type: String, // URL from CDN(cloudinary)
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    component_working: {
      type: Number,
      default: 0,
    },
    component_not_working: {
      type: Number,
      default: 0,
    },
    component_in_use: {
      type: Number,
      default: 0,
    },
    remark: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(componentCategory),
    },
    total_quantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

componentSchema.pre("save", function () {
  this.total_quantity = 0;
  this.total_quantity += this.component_working;
  this.total_quantity += this.component_not_working;
  this.total_quantity += this.component_in_use;
});

componentSchema.post("deleteOne", function () {
  console.log(this._id);
  this.model("logs").deleteMany({ component: this._id });
  this.model("requests").deleteMany({ component: this._id });
});

export const Components = mongoose.model("components", componentSchema);
