import { Application } from "express";
import authRoutes from "./auth.routes";
import bookingRoutes from "./booking.routes";

export default function route(app: Application): void {
    app.use("/api/auth", authRoutes);
    app.use("/api/bookings", bookingRoutes);
}
