const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Read dotenv manually if present
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.log('[Info] Could not parse .env automatically, using default sandbox keys.');
}

const bookingId = process.argv[2];
const customAmount = process.argv[3];

if (!bookingId) {
  console.error("\x1b[31m[Lỗi] Vui lòng cung cấp mã đơn đặt sân (Booking ID):\x1b[0m");
  console.error("👉 node trigger-momo-ipn.js <bookingId> [amount]");
  process.exit(1);
}

const amount = customAmount ? parseInt(customAmount) : 35000;
const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const responseTime = Date.now();
const extraData = "";
const message = "Successful.";
const resultCode = 0;
const transId = "MOMO_TEST_TRANS_" + Math.floor(Math.random() * 10000000);
const requestId = bookingId;
const orderId = bookingId;
const orderInfo = "Thanh toan dat san EZSport";

const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

const signature = crypto
  .createHmac("sha256", secretKey)
  .update(rawSignature)
  .digest("hex");

const payload = {
  partnerCode,
  orderId,
  requestId,
  amount,
  orderInfo,
  orderType: "momo_wallet",
  transId,
  resultCode,
  message,
  payType: "qr",
  responseTime,
  extraData,
  signature
};

console.log(`\x1b[36m[Test MoMo] Đang giả lập thanh toán THÀNH CÔNG cho Đơn sân: ${bookingId}...\x1b[0m`);

axios.post('http://localhost:5000/api/bookings/momo-ipn', payload)
  .then(res => {
    console.log(`\x1b[32m[Thành công] Server phản hồi trạng thái: ${res.status}\x1b[0m`);
    console.log(`🎉 Đơn hàng ${bookingId} đã được tự động kích hoạt sang trạng thái "CONFIRMED" (Đã xác nhận)!`);
  })
  .catch(err => {
    console.error("\x1b[31m[Thất bại] Không thể giả lập thanh toán:\x1b[0m", err.response ? err.response.data : err.message);
  });
