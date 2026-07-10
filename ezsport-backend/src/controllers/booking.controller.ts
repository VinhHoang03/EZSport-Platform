import { Request, Response } from "express";
import bookingService from "../services/booking.service";
import { createBookingSchema, updateBookingSchema } from "../validators/booking.validator";
import payosService from "../services/payos.service";
import Booking from "../models/booking.model";

class BookingController {
  /**
   * Create a new booking (POST /bookings)
   */
  async createBooking(req: Request, res: Response) {
    try {
      console.log('[booking.createBooking] incoming body:', JSON.stringify(req.body));
      console.log('[booking.createBooking] auth user/id:', (req as any).user?.id || (req as any).id);
      const validation = createBookingSchema.safeParse(req.body);
      if (!validation.success) {
        const firstError = validation.error.issues[0];
        return res.status(400).json({
          message: firstError.message || "Dữ liệu đặt sân không hợp lệ",
          error: firstError.message,
          errors: validation.error.issues,
        });
      }

      const userId = (req as any).user?.id || (req as any).id; // from auth middleware (req.user or req.id)
      if (!userId) {
        console.warn('[booking.createBooking] missing userId (unauthenticated)');
        return res.status(401).json({ message: 'Người dùng chưa xác thực' });
      }
      const booking = await bookingService.createBooking(userId, validation.data);

      if (booking.paymentMethod === "payos") {
        try {
          const payosRes = await payosService.createPaymentLink(
            booking._id.toString(),
            booking.totalPrice,
            `Dat san ${booking.sport} tai EZSport`
          );
          return res.status(201).json({
            message: "Đặt sân thành công, vui lòng thanh toán qua PayOS",
            data: booking,
            payUrl: payosRes.checkoutUrl,
          });
        } catch (payosErr: any) {
          console.error("[booking.createBooking] PayOS exception:", payosErr);
          return res.status(500).json({
            message: "Lỗi kết nối cổng thanh toán PayOS",
            data: booking,
            error: payosErr.message,
          });
        }
      }

      // VNPay: currently a stub — returns booking without redirect until VNPay credentials are configured
      if (booking.paymentMethod === "vnpay") {
        console.log("[booking.createBooking] VNPay selected — stub mode (no VNPay credentials configured)");
        return res.status(201).json({
          message: "Đặt sân thành công. Vui lòng hoàn tất thanh toán qua VNPay.",
          data: booking,
        });
      }

      // Cash: confirm immediately, payment at venue
      if (booking.paymentMethod === "cash") {
        return res.status(201).json({
          message: "Đặt sân thành công. Vui lòng thanh toán tiền mặt tại sân.",
          data: booking,
        });
      }

      return res.status(201).json({
        message: "Đặt sân thành công",
        data: booking,
      });

    } catch (err: any) {
      console.error('[booking.createBooking] error:', err && err.stack ? err.stack : err);
      return res.status(500).json({
        message: err?.message || "Lỗi tạo đặt sân",
        error: err?.stack || null,
      });
    }
  }

  /**
   * Get all bookings for current user (GET /bookings)
   */
  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req as any).id;
      if (!userId) return res.status(401).json({ message: 'Người dùng chưa xác thực' });
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

      const filters: any = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
      };

      if (status) filters.status = status;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await bookingService.getUserBookings(userId, filters);

      return res.status(200).json({
        message: "Lấy danh sách đặt sân thành công",
        data: result.bookings,
        pagination: {
          total: result.total,
          page: filters.page,
          limit: filters.limit,
          pages: Math.ceil(result.total / filters.limit),
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        message: err.message || "Lỗi lấy danh sách đặt sân",
      });
    }
  }

  /**
   * Get booking by ID (GET /bookings/:id)
   */
  async getBookingById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      // Sync PENDING PayOS booking status on-the-fly
      let booking = await bookingService.getBookingById(id);
      if (booking && booking.status === "PENDING" && booking.paymentMethod === "payos" && booking.payosOrderCode) {
        try {
          console.log(`[BookingController.getBookingById] Querying PayOS API for orderCode: ${booking.payosOrderCode}`);
          const payosInfo = await payosService.getPaymentLinkInformation(booking.payosOrderCode);
          if (payosInfo.status === "PAID") {
            console.log(`[BookingController.getBookingById] PayOS status is PAID. Confirming booking ${booking._id}`);
            await bookingService.updatePaymentStatus(booking._id.toString(), "CONFIRMED");
            booking = await bookingService.getBookingById(id); // Reload
          } else if (payosInfo.status === "CANCELLED" || payosInfo.status === "EXPIRED") {
            console.log(`[BookingController.getBookingById] PayOS status is ${payosInfo.status}. Cancelling booking ${booking._id}`);
            await bookingService.updatePaymentStatus(booking._id.toString(), "CANCELLED");
            booking = await bookingService.getBookingById(id); // Reload
          }
        } catch (payosErr) {
          console.error("[BookingController.getBookingById] Failed to sync status with PayOS:", payosErr);
        }
      }

      if (!booking) {
        return res.status(404).json({
          message: "Đặt sân không tồn tại",
        });
      }

      return res.status(200).json({
        message: "Lấy thông tin đặt sân thành công",
        data: booking,
      });
    } catch (err: any) {
      return res.status(500).json({
        message: err.message || "Lỗi lấy thông tin đặt sân",
      });
    }
  }

  /**
   * Update booking (PATCH /bookings/:id)
   */
  async updateBooking(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = (req as any).user?.id || (req as any).id;
      if (!userId) return res.status(401).json({ message: 'Người dùng chưa xác thực' });
      const validation = updateBookingSchema.safeParse(req.body);
      if (!validation.success) {
        const firstError = validation.error.issues[0];
        return res.status(400).json({
          message: firstError.message || "Dữ liệu cập nhật không hợp lệ",
          error: firstError.message,
          errors: validation.error.issues,
        });
      }

      const booking = await bookingService.updateBooking(id, userId, validation.data);

      return res.status(200).json({
        message: "Cập nhật đặt sân thành công",
        data: booking,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi cập nhật đặt sân",
      });
    }
  }

  /**
   * Cancel booking (DELETE /bookings/:id)
   */
  async cancelBooking(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = (req as any).user?.id || (req as any).id;

      const booking = await bookingService.cancelBooking(id, userId);

      return res.status(200).json({
        message: "Hủy đặt sân thành công",
        data: booking,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi hủy đặt sân",
      });
    }
  }

  /**
   * Delete booking history record (DELETE /bookings/:id/remove)
   */
  async deleteBookingHistory(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = (req as any).user?.id || (req as any).id;

      await bookingService.deleteBookingHistory(id, userId);

      return res.status(200).json({
        message: "Xóa lịch sử đặt sân thành công",
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi xóa lịch sử đặt sân",
      });
    }
  }

  /**
   * Delete all booking history records (DELETE /bookings/remove-all)
   */
  async deleteAllBookingHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req as any).id;

      await bookingService.deleteAllBookingHistory(userId);

      return res.status(200).json({
        message: "Xóa tất cả lịch sử đặt sân thành công",
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi xóa tất cả lịch sử đặt sân",
      });
    }
  }

  /**
   * Get available time slots for a court (GET /bookings/slots/:courtId)
   */
  async getAvailableSlots(req: Request, res: Response) {
    try {
      const courtId = Array.isArray(req.params.courtId) ? req.params.courtId[0] : req.params.courtId;
      const { date, duration = 1 } = req.query;

      if (!date) {
        return res.status(400).json({
          message: "Ngày là bắt buộc",
        });
      }

      const slots = await bookingService.getAvailableSlots(
        courtId,
        new Date(date as string),
        parseInt(duration as string)
      );

      return res.status(200).json({
        message: "Lấy khung giờ còn trống thành công",
        data: slots,
      });
    } catch (err: any) {
      return res.status(500).json({
        message: err.message || "Lỗi lấy khung giờ",
      });
    }
  }

  /**
   * Get court bookings (admin/owner - GET /courts/:courtId/bookings)
   */
  async getCourtBookings(req: Request, res: Response) {
    try {
      const courtId = Array.isArray(req.params.courtId) ? req.params.courtId[0] : req.params.courtId;
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

      const filters: any = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
      };

      if (status) filters.status = status;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await bookingService.getVenueBookings(courtId, filters);

      return res.status(200).json({
        message: "Lấy danh sách đặt sân của sân thành công",
        data: result.bookings,
        pagination: {
          total: result.total,
          page: filters.page,
          limit: filters.limit,
          pages: Math.ceil(result.total / filters.limit),
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        message: err.message || "Lỗi lấy danh sách đặt sân",
      });
    }
  }

  /**
   * Confirm booking (admin/owner - PATCH /bookings/:id/confirm)
   */
  async confirmBooking(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const booking = await bookingService.confirmBooking(id);

      return res.status(200).json({
        message: "Xác nhận đặt sân thành công",
        data: booking,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi xác nhận đặt sân",
      });
    }
  }

  /**
   * Cancel/Reject booking by owner (admin/owner - PATCH /bookings/:id/cancel-owner)
   */
  async cancelBookingByOwner(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const booking = await bookingService.cancelBookingByOwner(id);

      return res.status(200).json({
        message: "Hủy đặt sân thành công",
        data: booking,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi hủy đặt sân",
      });
    }
  }

  /**

   * Check-in booking (staff - PATCH /bookings/:id/checkin)
   */
  async checkInBooking(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = (req as any).user?.id || (req as any).id;
      const role = (req as any).user?.role || (req as any).role;
      const { userLat, userLng } = req.body;

      const booking = await bookingService.checkInBooking(id, userId, role, userLat, userLng);

      return res.status(200).json({
        message: "Check-in đặt sân thành công",
        data: booking,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi check-in đặt sân",
      });
    }
  }

  /**
   * Complete booking (staff - PATCH /bookings/:id/complete)
   */
  async completeBooking(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const booking = await bookingService.completeBooking(id);

      return res.status(200).json({
        message: "Hoàn thành đặt sân thành công",
        data: booking,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi hoàn thành đặt sân",
      });
    }
  }

  /**
   * Get all bookings containing products for a venue (for shop dashboard orders tab).
   * Returns BOTH:
   *   1. Standalone shop orders (sport: 'Cửa hàng', venueId = this venue, no courtId)
   *   2. Court bookings that have addon products (courtId belongs to this venue)
   * GET /bookings/venue/:venueId/bookings
   */
  async getVenueBookings(req: Request, res: Response) {
    try {
      const { venueId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const page = parseInt(req.query.page as string) || 1;

      // Find all courts that belong to this venue so we can match court-based bookings
      const Court = require('../models/court.model').default;
      const courts = await Court.find({ venue: venueId }).select('_id').lean();
      const courtIds = courts.map((c: any) => c._id);

      // Query: bookings with at least one product, linked to this venue either directly or via a court
      const bookings = await Booking.find({
        'products.0': { $exists: true },
        $or: [
          { venueId },           // standalone shop orders
          { courtId: { $in: courtIds } }, // combined court + product orders
        ]
      })
        .populate('userId', 'fullName phone email avatar username')
        .populate('courtId', 'name venue')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return res.status(200).json({
        message: "Lấy danh sách đơn hàng thành công",
        bookings,
        pagination: { page, limit, total: bookings.length }
      });
    } catch (err: any) {
      return res.status(500).json({
        message: err.message || "Lỗi lấy danh sách đơn hàng",
      });
    }
  }


  /**
   * PayOS Webhook Callback (POST /bookings/payos-webhook)
   */
  async handlePayOSWebhook(req: Request, res: Response) {
    try {
      console.log("[BookingController.handlePayOSWebhook] Callback payload:", JSON.stringify(req.body));
      
      const webhookData = await payosService.verifyWebhookData(req.body);
      if (!webhookData) {
        console.warn("[BookingController.handlePayOSWebhook] Webhook signature verification failed!");
        return res.status(400).json({ message: "Invalid signature" });
      }

      const { orderCode, code } = webhookData;
      console.log(`[BookingController.handlePayOSWebhook] Webhook verified. orderCode: ${orderCode}, code: ${code}`);

      const booking = await Booking.findOne({ payosOrderCode: orderCode });
      if (!booking) {
        console.error(`[BookingController.handlePayOSWebhook] Booking not found for orderCode: ${orderCode}`);
        return res.status(404).json({ message: "Booking not found" });
      }

      if (code === "00") {
        console.log(`[BookingController.handlePayOSWebhook] Payment SUCCESS for booking ${booking._id}`);
        await bookingService.updatePaymentStatus(booking._id.toString(), "CONFIRMED");
      } else {
        console.warn(`[BookingController.handlePayOSWebhook] Payment FAILED/CANCELLED for booking ${booking._id}, code: ${code}`);
        await bookingService.updatePaymentStatus(booking._id.toString(), "CANCELLED");
      }

      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("[BookingController.handlePayOSWebhook] Error handling webhook callback:", err);
      return res.status(500).json({ message: err?.message || "Internal Server Error" });
    }
  }
}

export default new BookingController();
