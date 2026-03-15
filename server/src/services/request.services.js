import {
  componentStatus,
  requestStatus,
  requestType,
  logStatus
} from "../constants/constants";
import { Components } from "../models/component.model";
import { Logs } from "../models/log.model";
import { Requests } from "../models/request.model";
import { ApiError } from "../utils/ApiError";

const createRequestService = async (
  componentId,
  remark,
  userId,
  quantity,
  type
) => {
  if (
    !componentId ||
    !remark ||
    !userId ||
    !quantity ||
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
    remark,
    quantity,
    type,
    status: requestStatus.PENDING,
  });

  return request;
};

// Component Request Service
const componentRequestService = async (reqId, status) => {

  // creating session for a transaction
  const session = await Requests.startSession();
  session.startTransaction();
  try {

    // validation
    if (!reqId || !status || !type) {
      throw new ApiError(404, "All fields are required");
    }

    // checking is request rejected
    if (status == requestStatus.REJECTED) {
      await Requests.findByIdAndDelete(reqId);
      return;
    }

    // if approved, find it
    const request = Requests.findById(reqId);

    // check for request type
    if (request.type == requestType.REQUEST) {
      const component = await Components.findById(request.component);

      if (component.component_working < request.quantity) {
        throw new ApiError(400, "Components are not avaiable to fulfill the request.")
      } else {
        component.component_working = component.component_working - request.quantity;
        component.component_in_use = component.component_in_use + request.quantity;

        const logs = await Logs.create({
          component: component._id,
          quantity: request.quantity,
          status: logStatus.OPEN,
          user: request.user,
          remark: `Request approved. Moved ${quantity} units to In_USE, Remark : ${remark}`
        })

        await component.save({ validateBeforeSave: false });
        await Request.findByIdAndDelete(reqId);
        await logs.save({ validateBeforeSave: false });
      }

    }

    await session.commitTransaction();

  } catch (error) {
    await session.abortTransaction();
    console.log("Customer approval request failed");

    throw error;
  } finally {
    await session.endSession();
  }
};


// Component Submit Service
const componentSubmitService = async (reqId) => {

}

// get all request of particular component
const getComponentRequest = async (componentId) => { }

export { createRequestService, componentRequestService };