import { Request, Response } from "express";
import bookingService from "../services/booking.service";
import { createBookingSchema, updateBookingSchema } from "../validators/booking.validator";

class BookingController {
  /**
   * Create a new booking (POST /bookings)
   */
  async createBooking(req: Request, res: Response) {
    try {
      const validation = createBookingSchema.safeParse(req.body);
      if (!validation.success) {
        const firstError = validation.error.issues[0];
        return res.status(400).json({
          message: "Validation failed",
          error: firstError.message,
        });
      }

      const userId = (req as any).userId; // from auth middleware
      const booking = await bookingService.createBooking(userId, validation.data);

      return res.status(201).json({
        message: "Đặt sân thành công",
        data: booking,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Lỗi tạo đặt sân",
      });
    }
  }

  /**
   * Get all bookings for current user (GET /bookings)
   */
  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
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
      const userId = (req as any).userId;

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
      const userId = (req as any).userId;

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

      const result = await bookingService.getCourtBookings(courtId, filters);

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
   * Check-in booking (staff - PATCH /bookings/:id/checkin)
   */
  async checkInBooking(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const booking = await bookingService.checkInBooking(id);

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
}

export default new BookingController();
