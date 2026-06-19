import { PayOS } from "@payos/node";
import Booking from "../models/booking.model";

class PayosService {
  private payOSInstance: PayOS | null = null;

  private get payos(): PayOS {
    if (!this.payOSInstance) {
      const clientId = process.env.PAYOS_CLIENT_ID;
      const apiKey = process.env.PAYOS_API_KEY;
      const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

      if (!clientId || !apiKey || !checksumKey) {
        throw new Error("PayOS credentials are not configured in environment variables.");
      }

      this.payOSInstance = new PayOS({
        clientId,
        apiKey,
        checksumKey,
      });
    }
    return this.payOSInstance;
  }

  /**
   * Generates a unique numeric order code (PayOS requires an integer).
   */
  generateOrderCode(): number {
    return Number(String(Date.now()).slice(-9) + Math.floor(100 + Math.random() * 900));
  }

  /**
   * Create a new payment link
   */
  async createPaymentLink(bookingId: string, amount: number, description: string) {
    const orderCode = this.generateOrderCode();
    
    // Save orderCode to booking in DB
    await Booking.findByIdAndUpdate(bookingId, { payosOrderCode: orderCode });

    const returnUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/booking/success`;
    const cancelUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/booking/success`;

    // Ensure description is under 25 chars and alphanumeric, as PayOS bank transfer descriptions have constraints
    const cleanDesc = description
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-zA-Z0-9 ]/g, "")  // keep alphanumeric and spaces
      .substring(0, 25);

    const paymentData = {
      orderCode,
      amount: Math.floor(amount),
      description: cleanDesc,
      cancelUrl,
      returnUrl,
    };

    console.log("[PayosService] Creating payment link with payload:", paymentData);
    const response = await this.payos.paymentRequests.create(paymentData);
    return response;
  }

  /**
   * Verify webhook payload signature
   */
  async verifyWebhookData(body: any) {
    try {
      return await this.payos.webhooks.verify(body);
    } catch (error) {
      console.error("[PayosService] Webhook verification failed:", error);
      return null;
    }
  }

  /**
   * Get payment link details
   */
  async getPaymentLinkInformation(orderCode: number) {
    try {
      return await this.payos.paymentRequests.get(orderCode);
    } catch (error) {
      console.error(`[PayosService] Error fetching info for orderCode ${orderCode}:`, error);
      throw error;
    }
  }
}

export default new PayosService();
