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
    return process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
  }

  private get secretKey(): string {
    return process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  }

  private get partnerCode(): string {
    return process.env.MOMO_PARTNER_CODE || "MOMO";
  }

  private get redirectUrl(): string {
    return process.env.MOMO_REDIRECT_URL || "http://localhost:5173/booking/success";
  }

  private get ipnUrl(): string {
    return process.env.MOMO_IPN_URL || "http://localhost:5000/api/bookings/momo-ipn";
  }

  /**
   * Create a new payment request to MoMo gateway
   */
  async createPayment(orderId: string, amount: number, orderInfo: string): Promise<MomoPaymentResponse> {
    const requestId = orderId;
    const extraData = "";
    const requestType = "payWithMethod";
    const autoCapture = true;
    const lang = "vi";

    // Build raw signature string matching MoMo's guidelines
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    console.log("[MomoService] Raw Signature:", rawSignature);

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      partnerCode: this.partnerCode,
      partnerName: "EZSport Platform",
      storeId: "EZSportStore",
      requestId,
      amount: amount.toString(),
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
