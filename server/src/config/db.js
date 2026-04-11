import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
        lastActivityTime: null,
        connectionAttempts: 0,
    };
}

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;

/**
 * Validate connection is in healthy state
 */
const isConnectionHealthy = () => {
    try {
        // Must exist
        if (!cached.conn) {
            console.log("❌ No cached connection exists");
            return false;
        }

        // Check mongoose connection object exists
        if (!cached.conn.connection) {
            console.log("❌ Connection object is invalid");
            return false;
        }

        // Check readyState: 1 = connected
        const readyState = cached.conn.connection.readyState;
        if (readyState !== 1) {
            console.log(`❌ Connection state is ${readyState}, not 1 (connected)`);
            return false;
        }

        // Check idle timeout
        const now = Date.now();
        if (cached.lastActivityTime && (now - cached.lastActivityTime) > IDLE_TIMEOUT) {
            console.log(`⏱️  Connection idle for ${Math.round((now - cached.lastActivityTime) / 1000)}s - will reconnect`);
            return false;
        }

        console.log("✅ Connection is healthy");
        return true;
    } catch (err) {
        console.error("❌ Error checking connection health:", err.message);
        return false;
    }
};

/**
 * Force disconnect old connection
 */
const forceDisconnect = async () => {
    if (!cached.conn) return;

    try {
        console.log("🔴 Force disconnecting old connection...");
        
        // Close the connection
        if (cached.conn.connection && cached.conn.connection.close) {
            await cached.conn.connection.close(true); // true = force close
        }
        
        // Disconnect mongoose
        await mongoose.disconnect();
        
        console.log("✅ Successfully disconnected");
    } catch (err) {
        console.error("⚠️  Error during disconnect:", err.message);
    }

    cached.conn = null;
    cached.promise = null;
};

/**
 * Main connection function with retry logic
 */
const connectDB = async (retryCount = 0) => {
    try {
        // Check if healthy connection exists
        if (isConnectionHealthy()) {
            console.log("♻️  Reusing healthy cached connection");
            cached.lastActivityTime = Date.now();
            return cached.conn;
        }

        // If connection exists but is unhealthy, force disconnect
        if (cached.conn) {
            console.log("🔄 Detected unhealthy connection - disconnecting...");
            await forceDisconnect();
        }

        // If promise exists but conn is null, reset (previous connection attempt failed)
        if (cached.promise && !cached.conn) {
            console.log("🔄 Resetting failed connection promise...");
            cached.promise = null;
        }

        // Create new connection promise if needed
        if (!cached.promise) {
            const MONGODB_URI = `${process.env.MONGODB_URL}/${process.env.DB_NAME}`;

            if (!process.env.MONGODB_URL || !process.env.DB_NAME) {
                throw new Error("Missing MONGODB_URL or DB_NAME environment variables");
            }

            console.log(`🔗 Attempting to connect to MongoDB (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            console.log(`📍 URI: ${MONGODB_URI.replace(/:[^:]*@/, ":****@")}`); // Hide password in logs

            cached.promise = mongoose
                .connect(MONGODB_URI, {
                    // Connection pool
                    maxPoolSize: 5,
                    minPoolSize: 1,

                    // Timeout settings
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                    connectTimeoutMS: 10000,

                    // Behavior
                    bufferCommands: false, // Fail fast instead of buffering
                    retryWrites: true,
                    family: 4, // IPv4

                    // Queue settings
                    waitQueueTimeoutMS: 10000,
                })
                .then((conn) => {
                    console.log(`✅ MongoDB connected successfully`);
                    console.log(`📊 Host: ${conn.connection.host}`);
                    console.log(`📦 DB: ${conn.connection.db.name}`);
                    cached.lastActivityTime = Date.now();
                    cached.connectionAttempts = 0;
                    return conn;
                })
                .catch((error) => {
                    console.error(`❌ Connection attempt failed: ${error.message}`);
                    cached.promise = null;

                    // Retry logic
                    if (retryCount < MAX_RETRIES - 1) {
                        console.log(`⏳ Retrying in 2 seconds...`);
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                connectDB(retryCount + 1)
                                    .then(resolve)
                                    .catch(reject);
                            }, 2000);
                        });
                    }

                    throw error;
                });
        }

        // Wait for connection
        const conn = await cached.promise;

        if (!conn || !conn.connection) {
            throw new Error("Connection resolved but is invalid");
        }

        cached.conn = conn;
        cached.lastActivityTime = Date.now();

        console.log("✅ Connection ready for operations");
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB connection failed after ${retryCount + 1} attempts:`, error.message);
        cached.promise = null;
        cached.conn = null;
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
};

export default connectDB;

/**
 * Get detailed connection status (for debugging)
 */
export const getDBStatus = async () => {
    try {
        const conn = await connectDB();

        if (!conn || !conn.connection) {
            return {
                status: "🔴 INVALID",
                error: "Connection object is invalid",
                timestamp: new Date().toISOString(),
            };
        }

        const readyState = conn.connection.readyState;
        const readyStateMap = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
        };

        const idleTimeMs = cached.lastActivityTime ? Date.now() - cached.lastActivityTime : null;

        return {
            status: readyState === 1 ? "🟢 CONNECTED" : "🔴 NOT_CONNECTED",
            readyState: readyState,
            readyStateLabel: readyStateMap[readyState],
            host: conn.connection.host || "unknown",
            db: conn.connection.db?.name || "unknown",
            idleTimeSeconds: idleTimeMs ? Math.round(idleTimeMs / 1000) : null,
            idleTimeMs: idleTimeMs,
            idleTimeout: IDLE_TIMEOUT / 1000 / 60 + " minutes",
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        return {
            status: "🔴 ERROR",
            error: error.message,
            timestamp: new Date().toISOString(),
        };
    }
};

/**
 * Force reconnect (use if stuck)
 */
export const forceReconnect = async () => {
    console.log("🔨 Force reconnect requested");
    await forceDisconnect();
    return await connectDB();
};

/**
 * Graceful shutdown (call on app exit)
 */
export const closeConnection = async () => {
    await forceDisconnect();
    console.log("👋 MongoDB connection closed");
};