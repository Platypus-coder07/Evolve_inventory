import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createRequestService,
  componentRequestService,
  componentSubmitService,
  getReqByComp_Usr,
  getComponentRequest,
  getReqByUsr,
  getAllRequestsService,
} from "../services/request.services.js";

const createRequestController = asyncHandler(async (req, res) => {
  const { componentId, remark, quantity, type } = req.body;
  const userId = req.user._id;

  const request = await createRequestService(
    componentId,
    remark,
    userId,
    quantity,
    type
  );

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Request created successfully"));
});

const componentRequestController = asyncHandler(async (req, res) => {
  const { reqId } = req.params;
  const { status, remark } = req.body;
  const request = await componentRequestService(reqId, status, remark);

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request updated successfully"));
});

const getComponentRequestController = asyncHandler(async (req, res) => {
  const { componentId } = req.params;
  const requests = await getComponentRequest(componentId);
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Requests fetched successfully"));
});

const getUserRequestController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const requests = await getReqByUsr(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Requests fetched successfully"));
});

const componentSubmitController = asyncHandler(async (req, res) => {
  const { reqId } = req.params;
  const { status, type, remark, component_working, component_not_working } =
    req.body;
  const request = await componentSubmitService(
    reqId,
    status,
    type,
    remark,
    component_working,
    component_not_working
  );
  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request submitted successfully"));
});

const getReqByComp_UsrController = asyncHandler(async (req, res) => {
  const { componentId } = req.params;
  const userId = req.user._id;
  const request = await getReqByComp_Usr(componentId, userId);
  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request fetched successfully"));
});

const getAllRequestsController = asyncHandler(async (req, res) => {
  const requests = await getAllRequestsService();
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "All requests fetched"));
});

export { createRequestController, componentRequestController, getComponentRequestController, getUserRequestController, componentSubmitController, getReqByComp_UsrController, getAllRequestsController }; 