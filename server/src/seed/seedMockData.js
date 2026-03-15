import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { Components } from "../models/component.model.js";
import { mockComponents } from "./mockComponentData.js";

dotenv.config();

const seedMockData = async () => {
  await connectDB();

  await Components.deleteMany({});
  const seededComponents = await Components.insertMany(mockComponents);

  console.log(`Seeded ${seededComponents.length} components`);
  process.exit(0);
};

seedMockData().catch((error) => {
  console.error("Failed to seed mock data", error);
  process.exit(1);
});
