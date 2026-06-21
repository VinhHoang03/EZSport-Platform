import express from "express";
import bookingController from "../controllers/booking.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Public webhook route for PayOS payments
router.post("/payos-webhook", bookingController.handlePayOSWebhook.bind(bookingController));

// Public route: Available slots (no auth required so users can check before booking)
router.get("/slots/:courtId", bookingController.getAvailableSlots.bind(bookingController));

// All booking routes below require authentication
router.use(verifyToken);

// User booking routes
router.post("/", bookingController.createBooking.bind(bookingController));
router.get("/", bookingController.getUserBookings.bind(bookingController));
router.get("/:id", bookingController.getBookingById.bind(bookingController));
router.patch("/:id", bookingController.updateBooking.bind(bookingController));
router.delete("/remove-all", bookingController.deleteAllBookingHistory.bind(bookingController));
router.delete("/:id", bookingController.cancelBooking.bind(bookingController));
router.delete("/:id/remove", bookingController.deleteBookingHistory.bind(bookingController));

// Admin/Owner routes (for managing court bookings)
router.get("/court/:courtId/bookings", bookingController.getCourtBookings.bind(bookingController));
router.patch("/:id/confirm", bookingController.confirmBooking.bind(bookingController));
router.patch("/:id/cancel-owner", bookingController.cancelBookingByOwner.bind(bookingController));
router.patch("/:id/checkin", bookingController.checkInBooking.bind(bookingController));
router.patch("/:id/complete", bookingController.completeBooking.bind(bookingController));

export default router;
