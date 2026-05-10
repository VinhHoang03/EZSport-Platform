import dotenv from "dotenv";
import http from "http";

dotenv.config();

import app from "./app";
import { connectDB } from "./configs/db";

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error("Không thể khởi động server:", error);
    process.exit(1);
  }
};

startServer();