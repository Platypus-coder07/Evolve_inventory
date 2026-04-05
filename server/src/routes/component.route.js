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
import { verifyJWT, verifyManager } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, verifyManager, createComponent);
router.route("/update").put(verifyJWT, verifyManager, updateComponent);
router.route("/:id").delete(verifyJWT, verifyManager, deleteComponent);
router.route("/category").get(verifyJWT, getComponentWithCategory);
router.route("/autocomplete").get(verifyJWT, autocompleteComponents);
router.route("/all").get(verifyJWT, getAllComponentsWithPagination);
router.route("/search").get(verifyJWT, searchComponentsWithPagination);
router.route("/stats/lab").get(verifyJWT, getLabStats);
router.route("/:id").get(verifyJWT, getComponentById);

export default router;
