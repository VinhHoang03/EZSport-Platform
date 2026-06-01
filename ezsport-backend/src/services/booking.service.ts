import Booking, { IBooking, BookingStatus } from "../models/booking.model";
import Court from "../models/court.model";
import { User } from "../models/user.model";

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

    // Create booking
    const booking = await Booking.create({
      userId,
      ...bookingData,
      status: "PENDING",
    });

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
    // Default hours: 06:00 - 22:00 (can be configured per court)
    const startHour = 6;
    const startMin = 0;
    const endHour = 22;
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
        price: court.pricePerHour ?? 0,
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
