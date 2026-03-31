import { componentCategory } from "../constants/constants.js";
import { Components } from "../models/component.model.js";
import { ApiError } from "../utils/ApiError.js";
import connectDB from "../config/db.js";

const createComponentService = async (
  name,
  image,
  description,
  component_working,
  component_not_working,
  component_in_use,
  remark,
  category
) => {
  await connectDB();
  if (
    !name ||
    !image ||
    !category ||
    component_working === undefined ||
    component_not_working === undefined ||
    component_in_use === undefined
  ) {
    throw new ApiError(404, "Required fields are missing or invalid");
  }

  const component = await Components.create({
    name,
    image,
    description: description ?? "",
    component_working,
    component_not_working,
    component_in_use,
    remark: remark ?? "",
    category,
  });

  console.log(component);
  return component;
};

const updateComponentService = async (id, component_working, component_not_working, component_in_use, remark) => {
  await connectDB();
  if (!id || component_working === undefined || component_not_working === undefined || component_in_use === undefined || !remark) {
    throw new ApiError(404, "All fields are required");
  }

  const component = await Components.findById(id);
  if (!component) {
    throw new ApiError(404, "Component not found");
  }

  component.component_working = component_working;
  component.component_not_working = component_not_working;
  component.component_in_use = component_in_use;
  component.remark = remark;

  await component.save({ validateBeforeSave: false });

  const updatedComponent = await Components.findById(id);

  return updatedComponent;
};

const deleteComponentService = async (id) => {
  await connectDB();
  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const component = await Components.findByIdAndDelete(id);
  if (!component) {
    throw new ApiError(404, "Component not found");
  }

  return component;
};

const getComponentWithCategoryService = async (category) => {
  await connectDB();
  if (!Object.values(componentCategory).includes(category)) {
    throw new ApiError(404, "Invalid category");
  }

  const components = await Components.find({ category });

  return components;
};

const autocompleteComponentsService = async (query, limit = 5) => {
  await connectDB();
  if (!query) {
    throw new ApiError(404, "Query is required");
  }
  const parsedLimit = Number(limit) || 5;

  const result = await Components.aggregate([
    {
      $search: {
        index: "default",
        autocomplete: {
          query,
          path: "name",
          fuzzy: {
            maxEdits: 1,
          },
        },
      },
    },
    { $limit: parsedLimit },
  ]);

  return result;
};

const searchComponentsWithPaginationService = async (
  query,
  page = 1,
  limit = 10
) => {
  await connectDB();
  if (!query) {
    throw new ApiError(404, "Query is required");
  }
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const result = await Components.aggregate([
    {
      $search: {
        index: "default",
        compound: {
          should: [
            {
              autocomplete: {
                query,
                path: "name",
                fuzzy: { maxEdits: 1 },
              },
            },
            {
              text: {
                query,
                path: ["name", "description", "category"],
              },
            },
          ],
        },
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: parsedLimit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  return {
    data: result[0].data,
    total: result[0].totalCount[0]?.count || 0,
    page: parsedPage,
    limit: parsedLimit,
  };
};

const getAllComponentsWithPaginationService = async (page = 1, limit = 10) => {
  await connectDB();
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const [data, total] = await Promise.all([
    Components.find().skip(skip).limit(parsedLimit),
    Components.countDocuments(),
  ]);

  return {
    data,
    total,
    page: parsedPage,
    limit: parsedLimit,
  };
};

const getComponentByIdService = async (id) => {
  await connectDB();
  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const component = await Components.findById(id);
  if (!component) {
    throw new ApiError(404, "Component not found");
  }

  return component;
};

const getLabStatsService = async () => {
  const stats = await Components.aggregate([
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalWorkingStock: { $sum: "$component_working" },
              totalBrokenStock: { $sum: "$component_not_working" },
              totalInUseStock: { $sum: "$component_in_use" },
              totalUniqueItems: { $sum: 1 },
            },
          },
        ],
        categories: [
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              totalWorking: { $sum: "$component_working" },
            },
          },
          { $sort: { totalWorking: -1 } },
        ],
      },
    },
  ]);

  return {
    overview: stats[0]?.overview[0] || {
      totalWorkingStock: 0,
      totalBrokenStock: 0,
      totalInUseStock: 0,
      totalUniqueItems: 0,
    },
    categories: stats[0]?.categories || [],
  };
};

export {
  createComponentService,
  updateComponentService,
  deleteComponentService,
  getLabStatsService,
  getComponentByIdService,
  getComponentWithCategoryService,
  autocompleteComponentsService,
  searchComponentsWithPaginationService,
  getAllComponentsWithPaginationService,
};
