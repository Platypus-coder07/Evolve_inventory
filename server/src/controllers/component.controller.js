import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createComponentService,
  updateComponentService,
  deleteComponentService,
  getComponentByIdService,
  getComponentWithCategoryService,
  autocompleteComponentsService,
  searchComponentsWithPaginationService,
  getAllComponentsWithPaginationService,
  getLabStatsService,
} from "../services/component.services.js";

const createComponent = asyncHandler(async (req, res) => {
  const {
    name,
    image,
    description,
    component_working,
    component_not_working,
    component_in_use,
    remark,
    category,
  } = req.body;

  const component = await createComponentService(
    name,
    image,
    description,
    component_working,
    component_not_working,
    component_in_use,
    remark,
    category
  );

  console.log(component);
  return res
    .status(201)
    .json(new ApiResponse(201, component, "Component created successfully"));
});

const updateComponent = asyncHandler(async (req, res) => {
  const {
    id,
    component_working,
    component_not_working,
    component_in_use,
    remark,
  } = req.body;

  const component = await updateComponentService(
    id,
    component_working,
    component_not_working,
    component_in_use,
    remark
  );

  return res
    .status(200)
    .json(new ApiResponse(200, component, "Component updated successfully"));
});

const deleteComponent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const component = await deleteComponentService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, component, "Component deleted successfully"));
});

const getComponentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const component = await getComponentByIdService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, component, "Component fetched successfully"));
});

const getComponentWithCategory = asyncHandler(async (req, res) => {
  const { category } = req.query;
  console.log(category);

  const component = await getComponentWithCategoryService(category);

  return res
    .status(200)
    .json(new ApiResponse(200, component, "Component fetched successfully"));
});

const autocompleteComponents = asyncHandler(async (req, res) => {
  const { query, limit } = req.query;

  const component = await autocompleteComponentsService(query, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, component, "Component fetched successfully"));
});

const searchComponentsWithPagination = asyncHandler(async (req, res) => {
  const { query, page, limit } = req.query;

  const component = await searchComponentsWithPaginationService(
    query,
    page,
    limit
  );

  return res
    .status(200)
    .json(new ApiResponse(200, component, "Component fetched successfully"));
});

const getAllComponentsWithPagination = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await getAllComponentsWithPaginationService(page, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Components fetched successfully"));
});

const getLabStats = asyncHandler(async (req, res) => {
  const statsData = await getLabStatsService();
  return res
    .status(200)
    .json(
      new ApiResponse(200, statsData, "Lab statistics fetched successfully"),
    );
});

export {
  createComponent,
  updateComponent,
  deleteComponent,
  getComponentById,
  getComponentWithCategory,
  autocompleteComponents,
  searchComponentsWithPagination,
  getAllComponentsWithPagination,
  getLabStats
};