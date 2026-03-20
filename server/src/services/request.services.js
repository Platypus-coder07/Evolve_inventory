import {
  requestStatus,
  requestType,
  logStatus,
} from "../constants/constants.js";
import { Components } from "../models/component.model.js";
import { Logs } from "../models/log.model.js";
import { Requests } from "../models/request.model.js";
import { ApiError } from "../utils/ApiError.js";

const createRequestService = async (
  componentId,
  remark,
  userId,
  quantity,
  type
) => {
  if (
    !componentId ||
    !userId ||
    quantity === undefined ||
    Number(quantity) <= 0 ||
    !Object.values(requestType).includes(type)
  ) {
    throw new ApiError(404, "All fields are required");
  }

  const component = await Components.findById(componentId);

  if (!component) {
    throw new ApiError(404, "Component not found");
  }

  const request = await Requests.create({
    component: componentId,
    user: userId,
    remark: remark ?? "",
    quantity,
    type,
    status: requestStatus.PENDING,
  });

  return request;
};

// Component Request Service
const componentRequestService = async (reqId, status, remark) => {
  // creating session for a transaction
  const session = await Requests.startSession();
  session.startTransaction();
  try {

    // validation
    if (
      !reqId ||
      !Object.values(requestStatus).includes(status)
    ) {
      throw new ApiError(404, "All fields are required");
    }

    // checking is request rejected
    if (status == requestStatus.REJECTED) {
      const deletedRequest = await Requests.findByIdAndDelete(reqId, { session });
      await session.commitTransaction();
      return deletedRequest;
    }

    // if approved, find it
    const request = await Requests.findById(reqId).session(session);
    if (!request) {
      throw new ApiError(404, "Request not found");
    }

    const component = await Components.findById(request.component).session(session);
    if (!component) {
      throw new ApiError(404, "Component not found");
    }

    if (component.component_working < request.quantity) {
      throw new ApiError(400, "Components are not avaiable to fulfill the request.");
    }

    component.component_working = component.component_working - request.quantity;
    component.component_in_use = component.component_in_use + request.quantity;

    await Logs.create(
      [
        {
          component: component._id,
          quantity: request.quantity,
          status: logStatus.OPEN,
          user: request.user,
          remark: `Request approved. Moved ${request.quantity} units to in_use. Remark: ${remark ?? ""}`,
        },
      ],
      { session }
    );

    await component.save({ validateBeforeSave: false, session });
    await Requests.findByIdAndDelete(reqId, { session });

    await session.commitTransaction();
    return request;

  } catch (error) {
    await session.abortTransaction();
    console.log("Customer approval request failed");

    throw error;
  } finally {
    await session.endSession();
  }
};


// Component Submit Service
const componentSubmitService = async (reqId, status, type, remark, component_working, component_not_working) => {
  if (
    !reqId ||
    !Object.values(requestStatus).includes(status) ||
    !Object.values(requestType).includes(type)
  ) {
    throw new ApiError(404, "All fields are required");
  }

  const session = await Requests.startSession();
  session.startTransaction();
  
  try {
    if (status == requestStatus.REJECTED) {
      const deletedRequest = await Requests.findByIdAndDelete(reqId, { session });
      await session.commitTransaction();
      return deletedRequest;
    }

    const request = await Requests.findById(reqId).session(session);
    if (!request) {
      throw new ApiError(404, "Request not found");
    }

    if (request.type !== requestType.SUBMIT || type !== requestType.SUBMIT) {
      throw new ApiError(400, "Invalid request type for this action");
    }

    const workingCount = Number(component_working ?? 0);
    const notWorkingCount = Number(component_not_working ?? 0);
    if (
      Number.isNaN(workingCount) ||
      Number.isNaN(notWorkingCount) ||
      workingCount < 0 ||
      notWorkingCount < 0 ||
      workingCount + notWorkingCount !== request.quantity
    ) {
      throw new ApiError(400, "Invalid submit quantities");
    }

    const component = await Components.findById(request.component).session(session);
    if (!component) {
      throw new ApiError(404, "Component not found");
    }

    if (component.component_in_use < request.quantity) {
      throw new ApiError(400, "Cannot submit more than in-use quantity");
    }

    component.component_in_use = component.component_in_use - request.quantity;
    component.component_working = component.component_working + workingCount;
    component.component_not_working =
      component.component_not_working + notWorkingCount;

    await Logs.create(
      [
        {
          component: request.component,
          user: request.user,
          status: logStatus.CLOSED,
          quantity: request.quantity,
          remark: `Submission accepted. ${request.quantity} units returned. Remark: ${remark ?? ""}`,
        },
      ],
      { session }
    );

    await component.save({ validateBeforeSave: false, session });
    await Requests.findByIdAndDelete(reqId, { session });

    await session.commitTransaction();
    return request;
  } catch (error) {
    await session.abortTransaction();
    console.log("Customer submit request failed");

    throw error;
  } finally {
    await session.endSession();
  }
};

// get all request of particular component
const getComponentRequest = async (componentId) => {
  if (!componentId) {
    throw new ApiError(404, "component Id not found");
  }

  const requests = await Requests.find({ component: componentId })
    .populate("user", "name email")
    .populate("component", "name image");

  return requests;
};

// const get request by user Id and component Id
const getReqByUsr = async (userId) => {
  if (!userId) {
    throw new ApiError(404, "User id not found");
  }

  const requests = await Requests.find({ user: userId })
    .populate("user", "name email")
    .populate("component", "name image");

  return requests;
};

// get request by component Id and user Id
const getReqByComp_Usr = async (componentId, userId) => {
  if (!componentId) {
    throw new ApiError(404, "Component id not found");
  }

  const requests = await Requests.find({ component: componentId, user: userId })
    .populate("user", "name email")
    .populate("component", "name image");

  return requests;
};

export {
  createRequestService,
  componentRequestService,
  getComponentRequest,
  componentSubmitService,
  getReqByComp_Usr,
  getReqByUsr,
};