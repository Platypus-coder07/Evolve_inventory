import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import connectDB, { getDBStatus } from "../config/db.js"; // ← Add this import

const healthCheckController = asyncHandler(async (req, res) => {
    try {
        // Connect to database
        await connectDB();
        
        // Get detailed status
        const status = await getDBStatus();

        // Verify connection is actually healthy
        if (!status || status.status !== "🟢 CONNECTED") {
            return res
                .status(503) // Service Unavailable
                .json(
                    new ApiResponse(
                        503,
                        {
                            database: status,
                            timestamp: new Date().toISOString(),
                        },
                        "Database connection unhealthy"
                    )
                );
        }

        // Connection is healthy
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        database: status,
                        timestamp: new Date().toISOString(),
                    },
                    "MongoDB connection is healthy"
                )
            );
    } catch (error) {
        console.error("❌ Health check failed:", error.message);
        
        try {
            const status = await getDBStatus();
            return res
                .status(500)
                .json(
                    new ApiResponse(
                        500,
                        {
                            database: status,
                            error: error.message,
                            timestamp: new Date().toISOString(),
                        },
                        "Failed to connect to MongoDB"
                    )
                );
        } catch (statusErr) {
            return res
                .status(500)
                .json(
                    new ApiResponse(
                        500,
                        {
                            error: error.message,
                            timestamp: new Date().toISOString(),
                        },
                        "Database connection failed"
                    )
                );
        }
    }
});

export { healthCheckController };