import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Fix for Windows/local environment DNS resolution issue in Node.js (c-ares)
// When Node.js fails to detect system DNS servers and falls back to 127.0.0.1, MongoDB SRV queries fail with ECONNREFUSED.
try {
  const dnsServers = dns.getServers();
  if (!dnsServers || dnsServers.length === 0 || (dnsServers.length === 1 && dnsServers[0] === "127.0.0.1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
} catch (dnsErr) {
  console.warn("Database Connection: Failed to inspect or configure DNS fallback:", dnsErr);
}

const MONGO_URI = process.env.MONGO_URI!;
export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});