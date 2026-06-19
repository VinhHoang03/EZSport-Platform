import { Application } from "express";
import authRoutes from "./auth.routes";
import bookingRoutes from "./booking.routes";
import venueRoutes from "./venue.routes";
import courtRoutes from "./court.routes";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";
import chatHistoryRoutes from "./chatHistory.routes";
import conversationRoutes from "./conversation.routes";
import analyticsRoutes from "./analytics.routes";
import reviewRoutes from "./review.routes";
import voucherRoutes from "./voucher.routes";
import playmateRoutes from "./playmate.routes";
import userRatingRoutes from "./userRating.routes";

export default function route(app: Application): void {
    app.use("/api/auth", authRoutes);

    app.use("/api/bookings", bookingRoutes);
    app.use("/api/venues", venueRoutes);
    app.use("/api/courts", courtRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/chat-history", chatHistoryRoutes);
    app.use("/api/conversations", conversationRoutes);
    app.use("/api/analytics", analyticsRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/vouchers", voucherRoutes);
    app.use("/api/playmates", playmateRoutes);
    app.use("/api/user-ratings", userRatingRoutes);
}
