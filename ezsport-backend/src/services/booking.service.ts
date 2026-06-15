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
    await this.cleanupStaleMomoBookings();
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    // Check if court exists
    const court = await Court.findById(bookingData.courtId);
    if (!court) throw new Error("Sân không tồn tại");

    // Validate if the slot is in the past
    const bookingDateObj = new Date(bookingData.bookingDate);
    const now = new Date();
    
    const targetDateStr = `${bookingDateObj.getFullYear()}-${String(bookingDateObj.getMonth() + 1).padStart(2, "0")}-${String(bookingDateObj.getDate()).padStart(2, "0")}`;
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    
    const isPastDate = targetDateStr < todayStr;
    const isToday = targetDateStr === todayStr;
    
    if (isPastDate) {
      throw new Error("Không thể đặt sân trong quá khứ");
    }
    
    if (isToday) {
      const [slotHour, slotMinute] = bookingData.startTime.split(":").map(Number);
      const currentHourNow = now.getHours();
      const currentMinuteNow = now.getMinutes();
      
      if (slotHour < currentHourNow || (slotHour === currentHourNow && slotMinute <= currentMinuteNow)) {
        throw new Error("Không thể đặt khung giờ đã trôi qua");
      }
    }

    // Check for booking conflicts
    // Block if ANY active/pending booking overlaps (including PENDING to prevent double-booking
    // before owner has a chance to confirm/reject)
    const existingBooking = await Booking.findOne({
      courtId: bookingData.courtId,
      bookingDate: {
        $gte: new Date(bookingData.bookingDate),
        $lt: new Date(new Date(bookingData.bookingDate).getTime() + 86400000), // same day
      },
      $and: [
        {
          $or: [
            { startTime: bookingData.startTime },
            { endTime: bookingData.endTime },
            {
              startTime: { $lt: bookingData.endTime },
              endTime: { $gt: bookingData.startTime },
            },
          ]
        },
        {
          $or: [
            { status: { $in: ["CONFIRMED", "CHECKED_IN"] } },
            { status: "PENDING", paymentMethod: { $ne: "momo" } }
          ]
        }
      ]
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
    await this.cleanupStaleMomoBookings();
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { userId };

    if (filters?.status) {
      if (filters.status === "PENDING") {
        query.$and = [
          { status: "PENDING" },
          { paymentMethod: { $ne: "momo" } }
        ];
      } else {
        query.status = filters.status;
      }
    } else {
      // By default, exclude unpaid MoMo bookings
      query.$or = [
        { status: { $ne: "PENDING" } },
        { status: "PENDING", paymentMethod: { $ne: "momo" } }
      ];
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

    if (updated) {
      await this.refundBookingResources(updated);
    }

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
    await this.cleanupStaleMomoBookings();
    const court = await Court.findById(courtId);
    if (!court) throw new Error("Sân không tồn tại");

    // Get all active bookings (excluding unpaid MoMo bookings) for this court on the date
    const bookings = await Booking.find({
      courtId,
      bookingDate: {
        $gte: new Date(bookingDate),
        $lt: new Date(new Date(bookingDate).getTime() + 86400000),
      },
      $or: [
        { status: { $in: ["CONFIRMED", "CHECKED_IN"] } },
        { status: "PENDING", paymentMethod: { $ne: "momo" } }
      ]
    });


    const now = new Date();
    const targetDate = new Date(bookingDate);
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const isToday = targetDateStr === todayStr;
    const isPastDate = targetDateStr < todayStr;

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

      let available = !conflictingBooking;
      if (isPastDate) {
        available = false;
      } else if (isToday) {
        const currentHourNow = now.getHours();
        const currentMinuteNow = now.getMinutes();
        if (currentHour < currentHourNow || (currentHour === currentHourNow && currentMin < currentMinuteNow)) {
          available = false;
        }
      }

      slots.push({
        time: timeStr,
        available,
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
    await this.cleanupStaleMomoBookings();
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { courtId };

    if (filters?.status) {
      if (filters.status === "PENDING") {
        query.$and = [
          { status: "PENDING" },
          { paymentMethod: { $ne: "momo" } }
        ];
      } else {
        query.status = filters.status;
      }
    } else {
      // By default, exclude unpaid MoMo bookings
      query.$or = [
        { status: { $ne: "PENDING" } },
        { status: "PENDING", paymentMethod: { $ne: "momo" } }
      ];
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
   * Cancel/Reject booking by owner (admin/owner only)
   */
  async cancelBookingByOwner(bookingId: string): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Đặt sân không tồn tại");

    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      throw new Error("Không thể hủy đặt sân đã hoàn thành hoặc đã hủy");
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CANCELLED" },
      { new: true }
    ).populate("userId courtId");

    if (updated) {
      await this.refundBookingResources(updated);
    }

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

    if (status === "CANCELLED" && booking.status !== "CANCELLED" && updated) {
      await this.refundBookingResources(updated);
    }

    return updated;
  }

  /**
   * Automatically cancel stale unpaid MoMo bookings (older than 10 minutes)
   */
  async cleanupStaleMomoBookings(): Promise<void> {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const staleBookings = await Booking.find({
        paymentMethod: "momo",
        status: "PENDING",
        createdAt: { $lt: tenMinutesAgo }
      });

      for (const booking of staleBookings) {
        booking.status = "CANCELLED";
        await booking.save();
        await this.refundBookingResources(booking);
        console.log(`[BookingService.cleanupStaleMomoBookings] Stale unpaid MoMo booking ${booking._id} has been automatically cancelled.`);
      }
    } catch (err) {
      console.error("[BookingService.cleanupStaleMomoBookings] Error cleaning up stale bookings:", err);
    }
  }

  /**
   * Refund points and restore voucher when a booking is cancelled
   */
  async refundBookingResources(booking: IBooking): Promise<void> {
    try {
      // 1. Restore loyalty points
      if (booking.pointsUsed && booking.pointsUsed > 0) {
        await User.findByIdAndUpdate(booking.userId, {
          $inc: { loyaltyPoints: booking.pointsUsed }
        });
        console.log(`[BookingService] Restored ${booking.pointsUsed} loyalty points to user ${booking.userId}`);
      }

      // 2. Restore voucher
      if (booking.voucherCode) {
        // Decrement voucher use count
        await Voucher.findOneAndUpdate(
          { code: booking.voucherCode },
          { $inc: { usedCount: -1 } }
        );

        // Update UserVoucher status back to 'available'
        await UserVoucher.findOneAndUpdate(
          { userId: booking.userId, code: booking.voucherCode, status: "used" },
          { status: "available", $unset: { usedBookingId: 1, usedAt: 1 } }
        );
        console.log(`[BookingService] Restored voucher ${booking.voucherCode} for user ${booking.userId}`);
      }
    } catch (err) {
      console.error("[BookingService] Error refunding resources:", err);
    }
  }
}

export default new BookingService();
