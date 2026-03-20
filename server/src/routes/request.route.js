import { Router } from "express";
import {
  createRequestController,
  componentRequestController,
  getComponentRequestController,
  getUserRequestController,
  componentSubmitController,
  getReqByComp_UsrController,
} from "../controllers/request.controller.js";
import { verifyJWT, verifyManager } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createRequestController);
router.route("/component-request/:reqId").patch(verifyJWT, verifyManager, componentRequestController);
router.route("/component-submit/:reqId").patch(verifyJWT, verifyManager, componentSubmitController);
router.route("/component/:componentId").get(verifyJWT, verifyManager, getComponentRequestController);
router.route("/user").get(verifyJWT, getUserRequestController);
router.route("/component/:componentId/user").get(verifyJWT, getReqByComp_UsrController);

export default router;
