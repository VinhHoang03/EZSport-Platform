import { Application } from "express";
import authRoutes from "./auth.routes";
<<<<<<< HEAD
import bookingRoutes from "./booking.routes";
import venueRoutes from "./venue.routes";
import courtRoutes from "./court.routes";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";

export default function route(app: Application): void {
    app.use("/api/auth", authRoutes);

    app.use("/api/bookings", bookingRoutes);
    app.use("/api/venues", venueRoutes);
    app.use("/api/courts", courtRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes);
}
