import { Request, Response } from "express";
import bookingService from "../services/booking.service";
import { createBookingSchema, updateBookingSchema } from "../validators/booking.validator";
import momoService from "../services/momo.service";

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
          message: "Validation failed",
          error: firstError.message,
        });
      }

      const userId = (req as any).user?.id || (req as any).id; // from auth middleware (req.user or req.id)
      if (!userId) {
        console.warn('[booking.createBooking] missing userId (unauthenticated)');
        return res.status(401).json({ message: 'Người dùng chưa xác thực' });
      }
      const booking = await bookingService.createBooking(userId, validation.data);

      if (booking.paymentMethod === "momo") {
        try {
          const momoRes = await momoService.createPayment(
            booking._id.toString(),
            booking.totalPrice,
            `Thanh toan dat san ${booking.sport} tai EZSport`
          );
          if (momoRes.resultCode === 0) {
            return res.status(201).json({
              message: "Đặt sân thành công, vui lòng thanh toán qua MoMo",
              data: booking,
              payUrl: momoRes.payUrl,
            });
          } else {
            console.error("[booking.createBooking] MoMo error:", momoRes);
            return res.status(400).json({
              message: "Không thể tạo liên kết thanh toán MoMo: " + momoRes.message,
              data: booking,
            });
          }
        } catch (momoErr: any) {
          console.error("[booking.createBooking] MoMo exception:", momoErr);
          return res.status(500).json({
            message: "Lỗi kết nối cổng thanh toán MoMo",
            data: booking,
            error: momoErr.message,
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
      const booking = await bookingService.getBookingById(id);

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
          message: "Validation failed",
          error: firstError.message,
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
   * MoMo IPN Callback (POST /bookings/momo-ipn)
   */
  async handleMomoIPN(req: Request, res: Response) {
    try {
      console.log("[BookingController.handleMomoIPN] Callback payload:", JSON.stringify(req.body));
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
      } = req.body;

      const accessKey = process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j";

      // Re-sign to verify authenticity
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

      const isValid = momoService.verifySignature(signature, rawSignature);
      if (!isValid) {
        console.warn("[BookingController.handleMomoIPN] Signature verification failed!");
        return res.status(400).json({ message: "Signature verification failed" });
      }

      const bookingId = momoService.extractBookingId(orderId);
      if (resultCode === 0) {
        console.log(`[BookingController.handleMomoIPN] Payment SUCCESS for booking ${bookingId}`);
        await bookingService.updatePaymentStatus(bookingId, "CONFIRMED");
      } else {
        console.warn(`[BookingController.handleMomoIPN] Payment FAILED/CANCELLED for booking ${bookingId}, code: ${resultCode}`);
        await bookingService.updatePaymentStatus(bookingId, "CANCELLED");
      }

      return res.status(204).send();
    } catch (err: any) {
      console.error("[BookingController.handleMomoIPN] Error handling IPN callback:", err);
      return res.status(500).json({ message: err?.message || "Internal Server Error" });
    }
  }
}

export default new BookingController();
