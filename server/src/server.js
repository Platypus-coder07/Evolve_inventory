import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();
await connectDB();

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
export default app;
