import Booking, { IBooking, BookingStatus } from "../models/booking.model";
import Court from "../models/court.model";
import { User } from "../models/user.model";
import Voucher from "../models/voucher.model";
import UserVoucher from "../models/userVoucher.model";
import Venue from "../models/venue.model";
import { calculateDistance } from "../utils/distance.util";
import Product from "../models/product.model";

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
    await this.cleanupStalePayOSBookings();
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    const court = bookingData.courtId ? await Court.findById(bookingData.courtId) : null;
    const venueId = court ? court.venue : bookingData.venueId;
    const venue = venueId ? await Venue.findById(venueId) : null;

    if (bookingData.courtId && !court) throw new Error("Sân không tồn tại");
    if (!venue) throw new Error("Địa điểm không tồn tại");

    const now = new Date();
    const sessionsCount = court && (bookingData.comboType === "month" ? 4 : (bookingData.comboType === "week" ? 2 : 1)) || 1;
    const bookingDates: Date[] = [];
    for (let i = 0; i < sessionsCount; i++) {
      const d = new Date(bookingData.bookingDate || now);
      d.setDate(d.getDate() + i * 7);
      bookingDates.push(d);
    }

    if (court) {
      for (const bDate of bookingDates) {
        const targetDateStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, "0")}-${String(bDate.getDate()).padStart(2, "0")}`;
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        
        const isPastDate = targetDateStr < todayStr;
        const isToday = targetDateStr === todayStr;
        
        if (isPastDate) {
          throw new Error(`Không thể đặt sân trong quá khứ (${targetDateStr})`);
        }
        
        if (isToday) {
          const [slotHour, slotMinute] = bookingData.startTime.split(":").map(Number);
          const currentHourNow = now.getHours();
          const currentMinuteNow = now.getMinutes();
          
          if (slotHour < currentHourNow || (slotHour === currentHourNow && slotMinute <= currentMinuteNow)) {
            throw new Error("Không thể đặt khung giờ đã trôi qua");
          }
        }

        const conflictingBooking = await Booking.findOne({
          courtId: bookingData.courtId,
          bookingDate: {
            $gte: new Date(bDate),
            $lt: new Date(new Date(bDate).getTime() + 86400000),
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
                { status: "PENDING", paymentMethod: { $nin: ["momo", "payos"] } }
              ]
            }
          ]
        });

        if (conflictingBooking) {
          const formattedDate = bDate.toLocaleDateString("vi-VN");
          throw new Error(`Sân đã bị đặt vào ngày ${formattedDate} trong khung giờ này`);
        }
      }
    }

    const singleBasePrice = Number(bookingData.basePrice || 0);
    const subtotal = singleBasePrice * sessionsCount;

    const weeklyRate = (venue.comboWeeklyDiscount !== undefined) ? venue.comboWeeklyDiscount : 5;
    const monthlyRate = (venue.comboMonthlyDiscount !== undefined) ? venue.comboMonthlyDiscount : 15;

    let comboDiscount = 0;
    if (bookingData.comboType === "month") {
      comboDiscount = Math.floor(subtotal * (monthlyRate / 100));
    } else if (bookingData.comboType === "week") {
      comboDiscount = Math.floor(subtotal * (weeklyRate / 100));
    }

    const serviceFee = Number(bookingData.serviceFee || 0);
    const orderValue = subtotal + serviceFee;
    let discount = 0;
    let pointsUsedForDiscount = Number(bookingData.pointsUsed || 0);
    const voucherCode = bookingData.voucherCode
      ? String(bookingData.voucherCode).toUpperCase().trim()
      : undefined;
    let userVoucher: any = null;

    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode, active: true });
      if (!voucher) throw new Error("Voucher khong ton tai");
      if (voucher.expiresAt && voucher.expiresAt.getTime() < Date.now()) {
        throw new Error("Voucher da het han");
      }
      if (voucher.usedCount >= voucher.quantity) {
        throw new Error("Voucher da het luot su dung");
      }
      if ((orderValue - comboDiscount) < voucher.minOrderValue) {
        throw new Error(`Don hang toi thieu ${voucher.minOrderValue.toLocaleString("vi-VN")}d`);
      }

      const rawDiscount = voucher.type === "percent"
        ? Math.floor((orderValue - comboDiscount) * (voucher.value / 100))
        : voucher.value;
      discount = Math.min(rawDiscount, voucher.maxDiscount || rawDiscount, orderValue - comboDiscount);

      if (voucher.pointCost > 0) {
        userVoucher = await UserVoucher.findOne({ userId, voucherId: voucher._id, status: "available" });
        if (!userVoucher) {
          throw new Error("Ban can doi voucher nay bang diem truoc khi su dung");
        }
      }
    }

    let pointsDiscount = 0;
    if (pointsUsedForDiscount > 0) {
      if ((user.loyaltyPoints || 0) < pointsUsedForDiscount) {
        throw new Error("Ban khong du diem de su dung");
      }
      pointsDiscount = Math.floor(pointsUsedForDiscount * 100);
      user.loyaltyPoints = (user.loyaltyPoints || 0) - pointsUsedForDiscount;
      await user.save();
    }

    // Tích hợp kiểm tra và tính tiền sản phẩm
    let productsTotal = 0;
    const processedProducts: any[] = [];
    const productsPayload = bookingData.products || [];

    for (const prod of productsPayload) {
      const dbProduct = await Product.findById(prod.productId);
      if (!dbProduct) {
        throw new Error(`Sản phẩm/dịch vụ ${prod.name || prod.productId} không tồn tại`);
      }
      if (dbProduct.stock < prod.quantity) {
        throw new Error(`Sản phẩm ${dbProduct.name} không đủ tồn kho (còn lại: ${dbProduct.stock})`);
      }

      // Xác định giá áp dụng:
      // So sánh venueId của sản phẩm với venueId của sân đấu (court.venue)
      const isSameVenue = court && dbProduct.venueId.toString() === court.venue.toString();
      let priceToApply = dbProduct.price;
      let priceTypeApplied: 'standard' | 'discounted' = 'standard';

      if (isSameVenue && dbProduct.type === 'rent' && dbProduct.priceWithCourt !== undefined) {
        priceToApply = dbProduct.priceWithCourt;
        priceTypeApplied = 'discounted';
      }

      // Tính tổng tiền:
      // Nếu thuê theo giờ: price * quantity * duration
      // Nếu bán hoặc thuê theo lượt: price * quantity
      let itemTotal = priceToApply * prod.quantity;
      if (dbProduct.type === 'rent' && dbProduct.chargeType === 'per_hour') {
        itemTotal = priceToApply * prod.quantity * bookingData.duration;
      }

      productsTotal += itemTotal;

      processedProducts.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        price: priceToApply,
        priceTypeApplied,
        quantity: prod.quantity,
        type: dbProduct.type,
        chargeType: dbProduct.chargeType
      });

      // Khấu trừ kho hàng
      dbProduct.stock -= prod.quantity;
      await dbProduct.save();
    }

    const finalTotal = Math.max(orderValue + productsTotal - comboDiscount - discount - pointsDiscount, 0);

    const mongoose = require("mongoose");
    const comboId = sessionsCount > 1 ? new mongoose.Types.ObjectId() : undefined;

    let primaryBooking: any = null;

    for (let i = 0; i < sessionsCount; i++) {
      const bDate = bookingDates[i];
      const isFirst = i === 0;

      const sessionBooking = await Booking.create({
        userId,
        courtId: bookingData.courtId || undefined,
        bookingDate: bDate,
        startTime: bookingData.startTime || "12:00",
        endTime: bookingData.endTime || "13:00",
        duration: bookingData.duration || 1,
        sport: bookingData.sport || "Shop",
        basePrice: singleBasePrice,
        serviceFee: isFirst ? serviceFee : 0,
        discount: isFirst ? (discount + comboDiscount) : 0,
        pointsUsed: isFirst ? pointsUsedForDiscount : 0,
        voucherCode: isFirst ? voucherCode : undefined,
        totalPrice: isFirst ? finalTotal : 0,
        paymentMethod: bookingData.paymentMethod,
        bookerName: bookingData.bookerName,
        bookerPhone: bookingData.bookerPhone,
        bookerEmail: bookingData.bookerEmail,
        notes: isFirst
          ? (bookingData.notes || "")
          : `Combo buổi thứ ${i + 1} (Đã thanh toán chung trong buổi đầu tiên)`,
        status: "PENDING",
        comboId,
        comboType: bookingData.comboType,
        products: isFirst ? processedProducts : [],
      });

      if (isFirst) {
        primaryBooking = sessionBooking;
      }
    }

    if (voucherCode && primaryBooking) {
      const voucher = await Voucher.findOneAndUpdate(
        { code: voucherCode },
        { $inc: { usedCount: 1 } },
        { new: true }
      );

      if (userVoucher) {
        userVoucher.status = "used";
        userVoucher.usedBookingId = primaryBooking._id;
        userVoucher.usedAt = new Date();
        await userVoucher.save();
      } else if (voucher && voucher.pointCost === 0) {
        await UserVoucher.create({
          userId,
          voucherId: voucher._id,
          code: voucher.code,
          status: "used",
          usedBookingId: primaryBooking._id,
          usedAt: new Date(),
        }).catch(() => null);
      }
    }

    return primaryBooking.populate("userId courtId");
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
    await this.cleanupStalePayOSBookings();
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { userId, deletedByUser: { $ne: true } };

    if (filters?.status) {
      if (filters.status === "PENDING") {
        query.$and = [
          { status: "PENDING" },
          { paymentMethod: { $nin: ["momo", "payos"] } }
        ];
      } else {
        query.status = filters.status;
      }
    } else {
      // By default, exclude unpaid MoMo & PayOS bookings
      query.$or = [
        { status: { $ne: "PENDING" } },
        { status: "PENDING", paymentMethod: { $nin: ["momo", "payos"] } }
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
        .populate("userId")
        .populate({
          path: "courtId",
          populate: {
            path: "venue"
          }
        })
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
    const isNumeric = /^\d+$/.test(bookingId);
    if (isNumeric) {
      return await Booking.findOne({ payosOrderCode: Number(bookingId) })
        .populate("userId")
        .populate({
          path: "courtId",
          populate: {
            path: "venue",
          },
        });
    }

    const cleanId = bookingId && bookingId.length > 24 ? bookingId.substring(0, 24) : bookingId;
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(cleanId)) return null;

    return await Booking.findById(cleanId)
      .populate("userId")
      .populate({
        path: "courtId",
        populate: {
          path: "venue",
        },
      });
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

    if (booking.comboId) {
      await Booking.updateMany(
        { comboId: booking.comboId, status: { $ne: "CANCELLED" } },
        { status: "CANCELLED" }
      );
    }

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
    await this.cleanupStalePayOSBookings();
    const court = await Court.findById(courtId);
    if (!court) throw new Error("Sân không tồn tại");

    // Get all active bookings (excluding unpaid MoMo/PayOS bookings) for this court on the date
    const bookings = await Booking.find({
      courtId,
      bookingDate: {
        $gte: new Date(bookingDate),
        $lt: new Date(new Date(bookingDate).getTime() + 86400000),
      },
      $or: [
        { status: { $in: ["CONFIRMED", "CHECKED_IN"] } },
        { status: "PENDING", paymentMethod: { $nin: ["momo", "payos"] } }
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
    await this.cleanupStalePayOSBookings();
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { courtId };

    if (filters?.status) {
      if (filters.status === "PENDING") {
        query.$and = [
          { status: "PENDING" },
          { paymentMethod: { $nin: ["momo", "payos"] } }
        ];
      } else {
        query.status = filters.status;
      }
    } else {
      // By default, exclude unpaid MoMo & PayOS bookings
      query.$or = [
        { status: { $ne: "PENDING" } },
        { status: "PENDING", paymentMethod: { $nin: ["momo", "payos"] } }
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

    if (booking.comboId) {
      await Booking.updateMany(
        { comboId: booking.comboId, status: "PENDING" },
        { status: "CONFIRMED" }
      );
    }

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

    if (booking.comboId) {
      await Booking.updateMany(
        { comboId: booking.comboId, status: { $ne: "CANCELLED" } },
        { status: "CANCELLED" }
      );
    }

    if (updated) {
      await this.refundBookingResources(updated);
    }

    return updated;
  }

  /**
   * Check-in booking (court staff only)
   */
  async checkInBooking(
    bookingId: string,
    userId?: string,
    role?: string,
    userLat?: number,
    userLng?: number
  ): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId).populate({
      path: "courtId",
      populate: {
        path: "venue",
      },
    });
    if (!booking) throw new Error("Đặt sân không tồn tại");

    if (booking.status !== "CONFIRMED") {
      throw new Error("Chỉ có thể check-in đặt sân đã xác nhận");
    }

    const isOwnerOrAdmin = role === "admin" || role === "owner";
    const isBooker = booking.userId._id.toString() === userId || booking.userId.toString() === userId;

    if (!isOwnerOrAdmin && isBooker) {
      if (userLat === undefined || userLng === undefined) {
        throw new Error("Vui lòng cung cấp vị trí GPS để check-in");
      }

      const court = booking.courtId as any;
      const venue = court?.venue;
      if (!venue || venue.lat === undefined || venue.lng === undefined) {
        throw new Error("Không tìm thấy thông tin định vị của sân");
      }

      const distance = calculateDistance(userLat, userLng, venue.lat, venue.lng);
      if (distance > 0.2) {
        throw new Error(
          `Bạn ở quá xa sân để check-in (Khoảng cách hiện tại: ${(distance * 1000).toFixed(0)}m, cần dưới 200m)`
        );
      }
    } else if (!isOwnerOrAdmin && !isBooker) {
      throw new Error("Bạn không có quyền check-in đặt sân này");
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CHECKED_IN" },
      { new: true }
    )
      .populate("userId")
      .populate({
        path: "courtId",
        populate: {
          path: "venue",
        },
      });

    // Cộng điểm thưởng loyaltyPoints cho người chơi khi họ tự check-in
    if (isBooker && userId) {
      const pointsToReward = 50;
      await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsToReward } });
    }

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

    // Hoàn trả tồn kho cho dụng cụ thuê (rent) khi hoàn thành đơn chơi
    if (booking.products && booking.products.length > 0) {
      for (const item of booking.products) {
        if (item.type === 'rent') {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
          }).catch((err) => console.error(`Failed to return rental stock for ${item.name}:`, err));
          console.log(`[BookingService] Returned rental item ${item.name} stock by ${item.quantity} on completion.`);
        }
      }
    }

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

    if (booking.comboId) {
      await Booking.updateMany(
        { comboId: booking.comboId },
        { status }
      );

      if (status === "CANCELLED" && booking.status !== "CANCELLED") {
        const comboBookings = await Booking.find({ comboId: booking.comboId });
        for (const cb of comboBookings) {
          await this.refundBookingResources(cb);
        }
      }
    } else {
      if (status === "CANCELLED" && booking.status !== "CANCELLED" && updated) {
        await this.refundBookingResources(updated);
      }
    }

    return updated;
  }

  /**
   * Automatically cancel stale unpaid PayOS bookings (older than 10 minutes)
   */
  async cleanupStalePayOSBookings(): Promise<void> {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const staleBookings = await Booking.find({
        paymentMethod: "payos",
        status: "PENDING",
        createdAt: { $lt: tenMinutesAgo }
      });

      for (const booking of staleBookings) {
        booking.status = "CANCELLED";
        await booking.save();
        await this.refundBookingResources(booking);
        console.log(`[BookingService.cleanupStalePayOSBookings] Stale unpaid PayOS booking ${booking._id} has been automatically cancelled.`);
      }
    } catch (err) {
      console.error("[BookingService.cleanupStalePayOSBookings] Error cleaning up stale bookings:", err);
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

      // 3. Hoàn trả tồn kho cho tất cả sản phẩm (cả bán và thuê) khi đơn đặt sân bị hủy
      if (booking.products && booking.products.length > 0) {
        for (const item of booking.products) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
          }).catch((err) => console.error(`Failed to refund product stock for ${item.name}:`, err));
          console.log(`[BookingService] Restored product/rental ${item.name} stock by ${item.quantity} due to cancellation.`);
        }
      }
    } catch (err) {
      console.error("[BookingService] Error refunding resources:", err);
    }
  }

  /**
   * Hide/remove a booking from user history (soft delete for user only)
   */
  async deleteBookingHistory(bookingId: string, userId: string): Promise<void> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Đặt sân không tồn tại");

    // Check ownership
    if (booking.userId.toString() !== userId) {
      throw new Error("Bạn không có quyền xóa lịch sử đặt sân này");
    }

    // Only allow deleting cancelled bookings
    if (booking.status !== "CANCELLED") {
      throw new Error("Chỉ có thể xóa lịch sử đặt sân đã hủy");
    }

    booking.deletedByUser = true;
    await booking.save();
  }

  /**
   * Hide/remove all cancelled bookings from user history (soft delete for user only)
   */
  async deleteAllBookingHistory(userId: string): Promise<void> {
    await Booking.updateMany(
      {
        userId,
        status: "CANCELLED",
        deletedByUser: { $ne: true }
      },
      {
        $set: { deletedByUser: true }
      }
    );
  }
}

export default new BookingService();
