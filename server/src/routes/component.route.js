import { Router } from "express";
import {
  createComponent,
  deleteComponent,
  getComponentById,
  updateComponent,
  getComponentWithCategory,
  autocompleteComponents,
  searchComponentsWithPagination,
  getAllComponentsWithPagination,
  getLabStats,
} from "../controllers/component.controller.js";

const router = Router();

router.post("/create", createComponent);
router.put("/update", updateComponent);
router.delete("/:id", deleteComponent);
router.get("/category", getComponentWithCategory);
router.get("/autocomplete", autocompleteComponents);
router.get("/search", searchComponentsWithPagination);
router.get("/all", getAllComponentsWithPagination);
router.get("/:id", getComponentById);
router.get("/stats/lab", getLabStats);

export default router;
