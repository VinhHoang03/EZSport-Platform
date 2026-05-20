import { Application } from "express";
import authRoutes from "./auth.routes";



export default function route(app: Application): void {
    app.use("/api/auth", authRoutes);
}
