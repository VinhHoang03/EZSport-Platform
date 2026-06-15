import crypto from "crypto";
import https from "https";

export interface MomoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  shortLink: string;
}

class MomoService {
  private get accessKey(): string {
    return process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j";
  }

  private get secretKey(): string {
    return process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
  }

  private get partnerCode(): string {
    return process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529";
  }

  private get redirectUrl(): string {
    return process.env.MOMO_REDIRECT_URL || "http://localhost:5173/booking/success";
  }

  private get ipnUrl(): string {
    return process.env.MOMO_IPN_URL || "http://localhost:5000/api/bookings/momo-ipn";
  }

  /**
   * Extract original bookingId from a MoMo orderId.
   * orderId format: <bookingIdHex><timestamp>
   * MongoDB ObjectId is always 24 hex chars.
   */
  extractBookingId(momoOrderId: string): string {
    // orderId = safeBookingId (24 chars) + timestamp suffix
    return momoOrderId.substring(0, 24);
  }

  /**
   * Create a new payment request to MoMo gateway
   */
  async createPayment(bookingId: string, amount: number, orderInfo: string): Promise<MomoPaymentResponse> {
    // MoMo requires orderId/requestId to be alphanumeric only, max 50 chars
    // Append timestamp to make orderId unique per payment attempt
    // (prevents "transaction already exists" on retry)
    const safeBase = bookingId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);
    const ts = Date.now().toString();
    const orderId = (safeBase + ts).substring(0, 50);       // unique per attempt
    const requestId = orderId; // Must be identical for MoMo Sandbox bank redirect to work
    const safeAmount = Math.floor(amount); // MoMo requires integer
    const extraData = "";
    const requestType = "payWithMethod";
    const autoCapture = true;
    const lang = "vi";

    // Build raw signature string — field order is CRITICAL for MoMo HMAC
    const rawSignature = `accessKey=${this.accessKey}&amount=${safeAmount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    console.log("[MomoService] orderId:", orderId);
    console.log("[MomoService] requestId:", requestId);
    console.log("[MomoService] amount:", safeAmount);

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      partnerCode: this.partnerCode,
      partnerName: "EZSport Platform",
      storeId: "EZSportStore",
      requestId,
      amount: safeAmount,
      orderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      signature,
    });

    console.log("[MomoService] Sending request to MoMo test gateway...");

    return new Promise((resolve, reject) => {
      const options = {
        hostname: "test-payment.momo.vn",
        port: 443,
        path: "/v2/gateway/api/create",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            console.log("[MomoService] Response status:", res.statusCode);
            console.log("[MomoService] Response body:", body);
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (err) {
            console.error("[MomoService] Parse error:", err);
            reject(new Error("Không thể giải mã phản hồi từ máy chủ MoMo"));
          }
        });
      });

      req.on("error", (e) => {
        console.error("[MomoService] Request error:", e);
        reject(e);
      });

      req.write(requestBody);
      req.end();
    });
  }

  /**
   * Verify secure hash signature from MoMo callback/IPN
   */
  verifySignature(signatureToVerify: string, rawSignature: string): boolean {
    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");
    return signature === signatureToVerify;
  }
}

export default new MomoService();
