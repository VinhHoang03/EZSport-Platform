import { Application } from "express";
import authRoutes from "./auth.routes";
import courtRoutes from "./court.routes";

export default function route(app: Application): void {
    app.use("/api/auth", authRoutes);
    app.use("/api/courts", courtRoutes);
}
