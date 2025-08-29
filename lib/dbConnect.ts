import mongoose, {Connection} from "mongoose";

type ConnectionCache = {
    conn?: Connection;
    promise?: Promise<Connection>;
};

const cached: ConnectionCache = {};

/**
 * Connects to MongoDB (singleton).
 * Always returns the same mongoose connection.
 */
async function dbConnect(): Promise<Connection> {
    // If we already have a live connection, return it
    if (cached.conn && cached.conn.readyState === 1) {
        console.log("✅ Using existing MongoDB connection");
        return cached.conn;
    }

    // If no promise exists, create one
    if (!cached.promise) {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("Please define MONGO_URI in your .env");

        console.log("⏳ Creating new MongoDB connection...");

        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
        }).then((mongooseInstance) => {
            console.log("✅ MongoDB connected successfully");
            cached.conn = mongooseInstance.connection;
            return cached.conn;
        });
    }

    // Wait for connection promise to resolve
    cached.conn = await cached.promise;
    return cached.conn;
}

export {dbConnect};
