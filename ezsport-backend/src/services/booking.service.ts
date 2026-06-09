import Booking, { IBooking, BookingStatus } from "../models/booking.model";
import Court from "../models/court.model";
import { User } from "../models/user.model";
import Voucher from "../models/voucher.model";
import UserVoucher from "../models/userVoucher.model";

const toMinutes = (time: string): number => {
  const [hour = 0, minute = 0] = String(time || "00:00").split(":").map(Number);
  return hour * 60 + minute;
};

const getCourtPriceForTime = (court: any, time: string): number => {
  const minute = toMinutes(time);
  const matchingRule = (court.pricingRules || []).find((rule: any) => {
    if (rule.isActive === false) return false;
    return minute >= toMinutes(rule.startTime) && minute < toMinutes(rule.endTime);
  });

  return Number(matchingRule?.price ?? court.pricePerHour ?? 0);
};

class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(userId: string, bookingData: any): Promise<IBooking> {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    // Check if court exists
    const court = await Court.findById(bookingData.courtId);
    if (!court) throw new Error("Sân không tồn tại");

    // Check for booking conflicts
    const existingBooking = await Booking.findOne({
      courtId: bookingData.courtId,
      bookingDate: {
        $gte: new Date(bookingData.bookingDate),
        $lt: new Date(new Date(bookingData.bookingDate).getTime() + 86400000), // same day
      },
      $or: [
        { startTime: bookingData.startTime },
        { endTime: bookingData.endTime },
        {
          startTime: { $lt: bookingData.endTime },
          endTime: { $gt: bookingData.startTime },
        },
      ],
      status: { $in: ["CONFIRMED", "CHECKED_IN"] },
    });

    if (existingBooking) {
      throw new Error("Sân đã được đặt trong khung giờ này");
    }

    const subtotal = Number(bookingData.basePrice || 0);
    const serviceFee = Number(bookingData.serviceFee || 0);
    const orderValue = subtotal + serviceFee;
    let discount = 0;
    let pointsUsedForDiscount = Number(bookingData.pointsUsed || 0); // Điểm dùng để giảm giá
    const voucherCode = bookingData.voucherCode
      ? String(bookingData.voucherCode).toUpperCase().trim()
      : undefined;
    let userVoucher: any = null;

    // Handle voucher discount
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode, active: true });
      if (!voucher) throw new Error("Voucher khong ton tai");
      if (voucher.expiresAt && voucher.expiresAt.getTime() < Date.now()) {
        throw new Error("Voucher da het han");
      }
      if (voucher.usedCount >= voucher.quantity) {
        throw new Error("Voucher da het luot su dung");
      }
      if (orderValue < voucher.minOrderValue) {
        throw new Error(`Don hang toi thieu ${voucher.minOrderValue.toLocaleString("vi-VN")}d`);
      }

      const rawDiscount = voucher.type === "percent"
        ? Math.floor(orderValue * (voucher.value / 100))
        : voucher.value;
      discount = Math.min(rawDiscount, voucher.maxDiscount || rawDiscount, orderValue);

      if (voucher.pointCost > 0) {
        userVoucher = await UserVoucher.findOne({ userId, voucherId: voucher._id, status: "available" });
        if (!userVoucher) {
          throw new Error("Ban can doi voucher nay bang diem truoc khi su dung");
        }
      }
    }

    // Handle loyalty points discount (500 points = 50,000đ)
    let pointsDiscount = 0;
    if (pointsUsedForDiscount > 0) {
      // Check if user has enough points
      if ((user.loyaltyPoints || 0) < pointsUsedForDiscount) {
        throw new Error("Ban khong du diem de su dung");
      }
      // Convert points to discount (100 points = 10,000đ)
      pointsDiscount = Math.floor(pointsUsedForDiscount * 100); // 500 points = 50,000đ
      
      // Deduct points from user
      user.loyaltyPoints = (user.loyaltyPoints || 0) - pointsUsedForDiscount;
      await user.save();
    }

    const finalTotal = Math.max(orderValue - discount - pointsDiscount, 0);

    // Create booking
    const booking = await Booking.create({
      userId,
      ...bookingData,
      discount,
      pointsUsed: pointsUsedForDiscount,
      voucherCode,
      totalPrice: finalTotal,
      status: "PENDING",
    });

    if (voucherCode) {
      const voucher = await Voucher.findOneAndUpdate(
        { code: voucherCode },
        { $inc: { usedCount: 1 } },
        { new: true }
      );

      if (userVoucher) {
        userVoucher.status = "used";
        userVoucher.usedBookingId = booking._id;
        userVoucher.usedAt = new Date();
        await userVoucher.save();
      } else if (voucher && voucher.pointCost === 0) {
        await UserVoucher.create({
          userId,
          voucherId: voucher._id,
          code: voucher.code,
          status: "used",
          usedBookingId: booking._id,
          usedAt: new Date(),
        }).catch(() => null);
      }
    }

    return booking.populate("userId courtId");
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(
    userId: string,
    filters?: {
      status?: BookingStatus;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { userId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.bookingDate = {};
      if (filters.startDate) {
        query.bookingDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.bookingDate.$lte = filters.endDate;
      }
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("userId courtId")
        .sort({ bookingDate: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    return { bookings, total };
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId).populate("userId courtId");
  }

  /**
   * Update booking
   */
  async updateBooking(
    bookingId: string,
    userId: string,
    updateData: any
  ): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Đặt sân không tồn tại");

    // Check ownership
    if (booking.userId.toString() !== userId) {
      throw new Error("Bạn không có quyền cập nhật đặt sân này");
    }

    // Cannot update confirmed bookings
    if (booking.status === "CONFIRMED") {
      throw new Error("Không thể cập nhật đặt sân đã xác nhận");
    }

    const updated = await Booking.findByIdAndUpdate(bookingId, updateData, {
      new: true,
    }).populate("userId courtId");

    return updated;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, userId: string): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Đặt sân không tồn tại");

    if (booking.userId.toString() !== userId) {
      throw new Error("Bạn không có quyền hủy đặt sân này");
    }

    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      throw new Error("Không thể hủy đặt sân đã hoàn thành hoặc đã hủy");
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CANCELLED" },
      { new: true }
    ).populate("userId courtId");

    return updated;
  }

  /**
   * Get available time slots for a venue on a specific date
   */
  async getAvailableSlots(
    courtId: string,
    bookingDate: Date,
    slotDuration: number = 1 // in hours
  ): Promise<{ time: string; available: boolean; price?: number }[]> {
    const court = await Court.findById(courtId);
    if (!court) throw new Error("Sân không tồn tại");

    // Get all confirmed bookings for this court on the date
    const bookings = await Booking.find({
      courtId,
      bookingDate: {
        $gte: new Date(bookingDate),
        $lt: new Date(new Date(bookingDate).getTime() + 86400000),
      },
      status: { $in: ["CONFIRMED", "CHECKED_IN"] },
    });

    const slots: { time: string; available: boolean; price?: number }[] = [];
    // Default hours: 06:00 - 24:00 (to allow 23:00 slot for bookings)
    const startHour = 6;
    const startMin = 0;
    const endHour = 24;
    const endMin = 0;

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

      // Check if this slot conflicts with any booking
      const conflictingBooking = bookings.find((booking) => {
        const bookingStart = parseInt(booking.startTime.split(":").join(""));
        const bookingEnd = parseInt(booking.endTime.split(":").join(""));
        const slotStart = parseInt(timeStr.split(":").join(""));
        const slotEnd = parseInt(
          `${String(currentHour + Math.floor((currentMin + slotDuration * 60) / 60)).padStart(2, "0")}${String((currentMin + slotDuration * 60) % 60).padStart(2, "0")}`.slice(0, 4)
        );

        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      slots.push({
        time: timeStr,
        available: !conflictingBooking,
        price: getCourtPriceForTime(court, timeStr),
      });

      // Move to next slot
      currentMin += slotDuration * 60;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    return slots;
  }

  /**
   * Get bookings for a venue (for admin/owner)
   */
  async getVenueBookings(
    courtId: string,
    filters?: {
      status?: BookingStatus;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { courtId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.bookingDate = {};
      if (filters.startDate) {
        query.bookingDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.bookingDate.$lte = filters.endDate;
      }
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("userId courtId")
        .sort({ bookingDate: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    return { bookings, total };
  }

  /**
   * Confirm booking (admin/owner only)
   */
  async confirmBooking(bookingId: string): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Đặt sân không tồn tại");

    if (booking.status !== "PENDING") {
      throw new Error("Chỉ có thể xác nhận đặt sân đang chờ xử lý");
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CONFIRMED" },
      { new: true }
    ).populate("userId courtId");

    return updated;
  }

  /**
   * Check-in booking (court staff only)
   */
  async checkInBooking(bookingId: string): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Đặt sân không tồn tại");

    if (booking.status !== "CONFIRMED") {
      throw new Error("Chỉ có thể check-in đặt sân đã xác nhận");
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CHECKED_IN" },
      { new: true }
    ).populate("userId courtId");

    return updated;
  }

  /**
   * Complete booking (court staff only)
   */
  async completeBooking(bookingId: string): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Đặt sân không tồn tại");

    if (booking.status !== "CHECKED_IN") {
      throw new Error("Chỉ có thể hoàn thành đặt sân đã check-in");
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "COMPLETED" },
      { new: true }
    ).populate("userId courtId");

    return updated;
  }

  /**
   * Update booking status from payment gateway callback
   */
  async updatePaymentStatus(bookingId: string, status: BookingStatus): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Đặt sân không tồn tại");

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate("userId courtId");

    return updated;
  }
}

export default new BookingService();
