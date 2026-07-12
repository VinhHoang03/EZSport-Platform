import CoachProfile from "../models/coachProfile.model";
import CoachBooking, { CoachBookingStatus } from "../models/coachBooking.model";
import CoachRefund, { CoachRefundStatus } from "../models/coachRefund.model";
import mongoose from "mongoose";

const timeToMinutes = (time?: string) => {
  if (!time || !/^([0-1]?\d|2[0-3]):[0-5]\d$/.test(time)) return Number.NaN;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const dayRange = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Ngày không hợp lệ (YYYY-MM-DD)");
  // Compute the weekday from the requested calendar date, independently of
  // the server timezone. Vietnam midnight is the previous day in UTC.
  const calendarDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(calendarDate.getTime())) throw new Error("Ngày không hợp lệ (YYYY-MM-DD)");
  const start = new Date(`${value}T00:00:00.000+07:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end, dayOfWeek: calendarDate.getUTCDay() };
};

class CoachService {
  async listPublic(filters: { sport?: string; mode?: string; area?: string; q?: string; minPrice?: number; maxPrice?: number; date?: string; startTime?: string; durationMinutes?: number }) {
    const query: any = { reviewStatus: "APPROVED", isAcceptingBookings: true };
    if (filters.sport) query.sports = filters.sport;
    if (filters.mode) query.teachingModes = filters.mode;
    if (filters.area) query.area = new RegExp(filters.area, "i");
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.pricePerHour = {};
      if (filters.minPrice !== undefined) query.pricePerHour.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.pricePerHour.$lte = filters.maxPrice;
    }
    const profiles = await CoachProfile.find(query)
      .populate({ path: "userId", select: "fullName avatar" })
      .sort({ pricePerHour: 1 });
    let validProfiles = profiles.filter((profile: any) => profile.userId);
    if (filters.q) {
      const keyword = filters.q.toLocaleLowerCase();
      validProfiles = validProfiles.filter((profile: any) => [profile.userId?.fullName, ...(profile.specialties || [])]
        .some((value) => String(value || "").toLocaleLowerCase().includes(keyword)));
    }

    const hasScheduleFilter = filters.date || filters.startTime || filters.durationMinutes;
    if (!hasScheduleFilter) return validProfiles;
    if (!filters.date || !filters.startTime || !filters.durationMinutes) throw new Error("Cần chọn đủ ngày, giờ bắt đầu và thời lượng");
    const startMinute = timeToMinutes(filters.startTime);
    if (!Number.isFinite(startMinute) || filters.durationMinutes < 30) throw new Error("Thời gian lọc không hợp lệ");
    const { start, end, dayOfWeek } = dayRange(filters.date);
    const requestedStart = new Date(`${filters.date}T${filters.startTime}:00+07:00`);
    const requestedEnd = new Date(requestedStart.getTime() + filters.durationMinutes * 60_000);
    if (requestedStart <= new Date() || requestedEnd >= end) return [];

    const profileIds = validProfiles.map(profile => profile._id);
    const bookings = await CoachBooking.find({
      coachProfileId: { $in: profileIds },
      status: { $in: ["PENDING_PAYMENT", "PENDING_COACH_CONFIRMATION", "CONFIRMED"] },
      startAt: { $lt: requestedEnd },
      endAt: { $gt: requestedStart },
    }).select("coachProfileId");
    const busyIds = new Set(bookings.map(booking => booking.coachProfileId.toString()));

    return validProfiles.flatMap(profile => {
      if (busyIds.has(profile._id.toString()) || !profile.sessionDurations.includes(filters.durationMinutes!)) return [];
      const exception = profile.dateExceptions.find(item => item.date >= start && item.date < end);
      const availability = exception
        ? (exception.isAvailable && exception.startTime && exception.endTime ? [exception] : [])
        : profile.weeklyAvailability.filter(item => item.dayOfWeek === dayOfWeek);
      const fits = availability.some(slot => startMinute >= timeToMinutes(slot.startTime) && startMinute + filters.durationMinutes! <= timeToMinutes(slot.endTime));
      return fits ? [{ ...profile.toObject(), availableStartTime: filters.startTime }] : [];
    });
  }

  async getPublicProfile(id: string) {
    const profile = await CoachProfile.findOne({ _id: id, reviewStatus: "APPROVED", isAcceptingBookings: true })
      .populate({ path: "userId", select: "fullName avatar" });
    if (!profile) throw new Error("Không tìm thấy huấn luyện viên đang hoạt động");
    return profile;
  }

  async upsertProfile(userId: string, data: any) {
    const required = ["sports", "teachingModes", "pricePerHour", "sessionDurations"];
    for (const field of required) if (data[field] === undefined) throw new Error(`Thiếu trường ${field}`);
    if (!Array.isArray(data.sports) || !data.sports.length) throw new Error("Cần chọn ít nhất một môn thể thao");
    if (!Array.isArray(data.teachingModes) || !data.teachingModes.length) throw new Error("Cần chọn hình thức dạy");
    if (data.teachingModes.includes("offline") && !data.area?.trim()) throw new Error("Khu vực là bắt buộc cho lớp offline");

    const existing = await CoachProfile.findOne({ userId });
    // Saving the profile is also a review submission. Rejected profiles must
    // return to the admin queue, which only lists PENDING_REVIEW profiles.
    const reviewStatus = existing?.reviewStatus === "SUSPENDED"
      ? "SUSPENDED"
      : "PENDING_REVIEW";
    const profile = await CoachProfile.findOneAndUpdate(
      { userId },
      {
        $set: { ...data, reviewStatus, isAcceptingBookings: false },
        ...(reviewStatus === "PENDING_REVIEW" && existing ? {
          $unset: { reviewNote: 1, reviewedBy: 1, reviewedAt: 1 },
        } : {}),
      },
      { new: true, upsert: true, runValidators: true }
    );
    return profile;
  }

  async updateAvailability(userId: string, data: any) {
    const profile = await CoachProfile.findOne({ userId });
    if (!profile) throw new Error("Hãy tạo hồ sơ Coach trước");
    for (const slot of data.weeklyAvailability || []) {
      if (timeToMinutes(slot.startTime) >= timeToMinutes(slot.endTime)) throw new Error("Giờ bắt đầu phải trước giờ kết thúc");
    }
    profile.weeklyAvailability = data.weeklyAvailability || [];
    profile.dateExceptions = data.dateExceptions || [];
    if (typeof data.isAcceptingBookings === "boolean") profile.isAcceptingBookings = data.isAcceptingBookings;
    await profile.save();
    return profile;
  }

  async getSlots(profileId: string, date: string) {
    const profile = await this.getPublicProfile(profileId);
    const { start, end, dayOfWeek } = dayRange(date);
    const exception = profile.dateExceptions.find((item) => item.date >= start && item.date < end);
    if (exception && !exception.isAvailable) return [];
    const slots = exception?.isAvailable && exception.startTime && exception.endTime
      ? [{ startTime: exception.startTime, endTime: exception.endTime }]
      : profile.weeklyAvailability.filter((item) => item.dayOfWeek === dayOfWeek);
    const bookings = await CoachBooking.find({ coachProfileId: profile._id, startAt: { $gte: start, $lt: end }, status: { $in: ["PENDING_PAYMENT", "PENDING_COACH_CONFIRMATION", "CONFIRMED"] } }).select("startAt endAt");
    return slots
      .filter((slot) => Number.isFinite(timeToMinutes(slot.startTime)) && Number.isFinite(timeToMinutes(slot.endTime)) && timeToMinutes(slot.startTime) < timeToMinutes(slot.endTime))
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        booked: bookings.map((booking) => ({ startAt: booking.startAt, endAt: booking.endAt })),
      }));
  }

  async createBooking(playerId: string, profileId: string, data: any) {
    const profile = await this.getPublicProfile(profileId);
    if (!profile.teachingModes.includes(data.teachingMode)) throw new Error("Hình thức dạy không được Coach hỗ trợ");
    if (!profile.sports.includes(data.sport)) throw new Error("Coach không dạy môn thể thao này");
    if (!profile.sessionDurations.includes(data.durationMinutes)) throw new Error("Thời lượng không được Coach hỗ trợ");
    const startAt = new Date(data.startAt);
    if (Number.isNaN(startAt.getTime()) || startAt <= new Date()) throw new Error("Thời gian đặt lịch phải ở tương lai");
    const endAt = new Date(startAt.getTime() + data.durationMinutes * 60_000);
    const conflict = await CoachBooking.exists({ coachProfileId: profile._id, status: { $in: ["PENDING_PAYMENT", "PENDING_COACH_CONFIRMATION", "CONFIRMED"] }, startAt: { $lt: endAt }, endAt: { $gt: startAt } });
    if (conflict) throw new Error("Khung giờ này vừa được đặt, vui lòng chọn giờ khác");
    // The configured Coach price is the price of one session. Duration is an
    // allowed session option, not a multiplier for the checkout amount.
    const totalPrice = Math.round(profile.pricePerHour);
    return CoachBooking.create({ playerId, coachProfileId: profile._id, coachId: profile.userId, startAt, endAt, durationMinutes: data.durationMinutes, teachingMode: data.teachingMode, location: data.location, notes: data.notes, sport: data.sport, hourlyRate: profile.pricePerHour, totalPrice });
  }

  async markPaymentPaid(bookingId: string) {
    return CoachBooking.findOneAndUpdate({ _id: bookingId, status: "PENDING_PAYMENT" }, { status: "PENDING_COACH_CONFIRMATION", paymentStatus: "PAID" }, { new: true });
  }

  async markPaymentFailed(bookingId: string) {
    return CoachBooking.findOneAndUpdate({ _id: bookingId, status: "PENDING_PAYMENT" }, { status: "EXPIRED", paymentStatus: "FAILED" }, { new: true });
  }

  async markPaymentCancelled(bookingId: string) {
    return CoachBooking.findOneAndUpdate(
      { _id: bookingId, status: "PENDING_PAYMENT" },
      { status: "CANCELLED_BY_PLAYER", paymentStatus: "FAILED", cancelledReason: "Player hủy thanh toán" },
      { new: true }
    );
  }

  async getPlayerBookings(playerId: string) {
    const bookings = await CoachBooking.find({ playerId }).populate("coachProfileId").populate("coachId", "fullName avatar").sort({ startAt: -1 });
    const refunds = await CoachRefund.find({ bookingId: { $in: bookings.map(item => item._id) } });
    const refundByBooking = new Map(refunds.map(item => [item.bookingId.toString(), item.toObject()]));
    return bookings.map(item => ({ ...item.toObject(), refund: refundByBooking.get(item._id.toString()) || null }));
  }

  async getPlayerBooking(bookingId: string, playerId: string) {
    const booking = await CoachBooking.findOne({ _id: bookingId, playerId })
      .populate("coachProfileId")
      .populate("coachId", "fullName avatar");
    if (!booking) throw new Error("Không tìm thấy lịch hẹn");
    const refund = await CoachRefund.findOne({ bookingId: booking._id });
    return { ...booking.toObject(), refund: refund?.toObject() || null };
  }

  async getCoachBookings(coachId: string) {
    return CoachBooking.find({ coachId }).populate("playerId", "fullName phone avatar").sort({ startAt: 1 });
  }

  async transition(bookingId: string, coachId: string, action: "confirm" | "reject" | "complete", reason?: string) {
    const booking = await CoachBooking.findOne({ _id: bookingId, coachId });
    if (!booking) throw new Error("Không tìm thấy lịch hẹn của Coach");
    if (action === "confirm" && booking.status === "PENDING_COACH_CONFIRMATION") booking.status = "CONFIRMED";
    else if (action === "reject" && booking.status === "PENDING_COACH_CONFIRMATION") { booking.status = "REJECTED"; booking.rejectionReason = reason || "Coach từ chối lịch"; }
    else if (action === "complete" && booking.status === "CONFIRMED" && booking.endAt <= new Date()) { booking.status = "COMPLETED"; booking.completedAt = new Date(); }
    else throw new Error("Không thể thực hiện thao tác với trạng thái hiện tại");
    await booking.save();
    if (booking.status === "REJECTED" && booking.paymentStatus === "PAID") {
      await CoachRefund.findOneAndUpdate(
        { bookingId: booking._id },
        { $setOnInsert: { bookingId: booking._id, playerId: booking.playerId, coachId: booking.coachId, amount: booking.totalPrice, reason: booking.rejectionReason || "Coach từ chối lịch", status: "PENDING" } },
        { upsert: true, new: true }
      );
    }
    return booking;
  }

  async listRefunds(status?: CoachRefundStatus) {
    return CoachRefund.find(status ? { status } : {})
      .populate("playerId", "fullName email phone")
      .populate("coachId", "fullName email phone")
      .populate("bookingId")
      .sort({ createdAt: -1 });
  }

  async updateRefund(refundId: string, adminId: string, data: { status: CoachRefundStatus; adminNote?: string; transactionReference?: string }) {
    if (!["PROCESSING", "REFUNDED", "FAILED"].includes(data.status)) throw new Error("Trạng thái hoàn tiền không hợp lệ");
    if (data.status === "REFUNDED" && !data.transactionReference?.trim()) throw new Error("Cần nhập mã giao dịch hoàn tiền");
    const refund = await CoachRefund.findById(refundId);
    if (!refund) throw new Error("Không tìm thấy yêu cầu hoàn tiền");
    if (refund.status === "REFUNDED") throw new Error("Yêu cầu này đã hoàn tiền");
    refund.status = data.status;
    refund.adminNote = data.adminNote;
    refund.transactionReference = data.transactionReference;
    refund.processedBy = new mongoose.Types.ObjectId(adminId);
    refund.processedAt = new Date();
    await refund.save();
    if (refund.status === "REFUNDED") await CoachBooking.findByIdAndUpdate(refund.bookingId, { paymentStatus: "REFUNDED" });
    return refund;
  }

  async cancelByPlayer(bookingId: string, playerId: string, reason?: string) {
    const booking = await CoachBooking.findOne({ _id: bookingId, playerId });
    if (!booking) throw new Error("Không tìm thấy lịch hẹn");
    if (!["PENDING_PAYMENT", "PENDING_COACH_CONFIRMATION", "CONFIRMED"].includes(booking.status)) throw new Error("Lịch hẹn này không thể hủy");
    booking.status = "CANCELLED_BY_PLAYER";
    booking.cancelledReason = reason;
    await booking.save();
    return booking;
  }
}

export default new CoachService();
