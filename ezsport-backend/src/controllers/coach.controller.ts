import { Request, Response } from "express";
import CoachProfile from "../models/coachProfile.model";
import CoachBooking from "../models/coachBooking.model";
import coachService from "../services/coach.service";
import payosService from "../services/payos.service";

const userId = (req: Request) => req.user?.id || req.id;
const param = (req: Request, name: string) => Array.isArray(req.params[name]) ? req.params[name][0] : req.params[name];

class CoachController {
  async list(req: Request, res: Response) {
    try { return res.json({ data: await coachService.listPublic({ sport: req.query.sport as string, mode: req.query.mode as string, area: req.query.area as string, q: req.query.q as string, minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined, maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined, date: req.query.date as string, startTime: req.query.startTime as string, durationMinutes: req.query.durationMinutes ? Number(req.query.durationMinutes) : undefined }) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async getProfile(req: Request, res: Response) {
    try { return res.json({ data: await coachService.getPublicProfile(param(req, "id")) }); }
    catch (error: any) { return res.status(404).json({ message: error.message }); }
  }
  async getSlots(req: Request, res: Response) {
    try { if (!req.query.date) return res.status(400).json({ message: "date là bắt buộc (YYYY-MM-DD)" }); return res.json({ data: await coachService.getSlots(param(req, "id"), String(req.query.date)) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async saveMyProfile(req: Request, res: Response) {
    try { return res.json({ data: await coachService.upsertProfile(userId(req)!, req.body) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async myProfile(req: Request, res: Response) {
    const profile = await CoachProfile.findOne({ userId: userId(req) });
    return res.json({ data: profile });
  }
  async saveAvailability(req: Request, res: Response) {
    try { return res.json({ data: await coachService.updateAvailability(userId(req)!, req.body) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async createBooking(req: Request, res: Response) {
    try {
      const booking = await coachService.createBooking(userId(req)!, param(req, "id"), req.body);
      const payos = await payosService.createPaymentLink(booking._id.toString(), booking.totalPrice, `Coach ${booking.sport}`, "coach");
      return res.status(201).json({ message: "Vui lòng hoàn tất thanh toán", data: booking, payUrl: payos.checkoutUrl });
    } catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async playerBookings(req: Request, res: Response) { return res.json({ data: await coachService.getPlayerBookings(userId(req)!) }); }
  async playerBooking(req: Request, res: Response) {
    try { return res.json({ data: await coachService.getPlayerBooking(param(req, "id"), userId(req)!) }); }
    catch (error: any) { return res.status(404).json({ message: error.message }); }
  }
  async coachBookings(req: Request, res: Response) { return res.json({ data: await coachService.getCoachBookings(userId(req)!) }); }
  async cancel(req: Request, res: Response) {
    try { return res.json({ data: await coachService.cancelByPlayer(param(req, "id"), userId(req)!, req.body.reason) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async transition(req: Request, res: Response) {
    try { return res.json({ data: await coachService.transition(param(req, "id"), userId(req)!, req.body.action, req.body.reason) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async adminList(req: Request, res: Response) { return res.json({ data: await CoachProfile.find(req.query.status ? { reviewStatus: req.query.status } : {}).populate("userId", "fullName email phone avatar") }); }
  async adminReview(req: Request, res: Response) {
    const { status, note } = req.body;
    if (!["APPROVED", "REJECTED", "SUSPENDED"].includes(status)) return res.status(400).json({ message: "Trạng thái duyệt không hợp lệ" });
    const profile = await CoachProfile.findByIdAndUpdate(req.params.id, { reviewStatus: status, reviewNote: note, reviewedBy: userId(req), reviewedAt: new Date(), isAcceptingBookings: status === "APPROVED" }, { new: true });
    if (!profile) return res.status(404).json({ message: "Không tìm thấy hồ sơ Coach" });
    return res.json({ data: profile });
  }
  async adminRefunds(req: Request, res: Response) {
    try { return res.json({ data: await coachService.listRefunds(req.query.status as any) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async adminUpdateRefund(req: Request, res: Response) {
    try { return res.json({ data: await coachService.updateRefund(param(req, "id"), userId(req)!, req.body) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  }
  async syncPayment(req: Request, res: Response) {
    const booking = await CoachBooking.findById(req.params.id);
    if (!booking || booking.playerId.toString() !== userId(req)) return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    if (booking.status !== "PENDING_PAYMENT" || !booking.payosOrderCode) return res.json({ data: await coachService.getPlayerBooking(booking.id, userId(req)!) });
    const info = await payosService.getPaymentLinkInformation(booking.payosOrderCode);
    if (info.status === "PAID") await coachService.markPaymentPaid(booking.id);
    else if (info.status === "CANCELLED") await coachService.markPaymentCancelled(booking.id);
    else if (info.status === "EXPIRED") await coachService.markPaymentFailed(booking.id);
    return res.json({ data: await coachService.getPlayerBooking(booking.id, userId(req)!) });
  }
}

export default new CoachController();
