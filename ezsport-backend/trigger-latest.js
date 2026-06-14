const dns = require('dns');
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Fix for Windows/local environment DNS resolution issue in Node.js (c-ares)
try {
  const dnsServers = dns.getServers();
  if (!dnsServers || dnsServers.length === 0 || (dnsServers.length === 1 && dnsServers[0] === "127.0.0.1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
} catch (dnsErr) {
  console.warn("Database Connection: Failed to inspect or configure DNS fallback:", dnsErr);
}

// Read dotenv manually
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
  console.log('[Info] Could not parse .env automatically.');
}

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://vinhhoangdev:03072005@cluster0-hoangvinh.msq1gzg.mongodb.net/EZSport?retryWrites=true&w=majority';

console.log('\x1b[36m[EZSport Tool] Đang kết nối tới Database của bạn để tìm đơn đặt sân mới nhất...\x1b[0m');

mongoose.connect(mongoUri)
  .then(async () => {
    // Define a loose Booking model
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    
    // Find the latest booking created with MoMo
    const latestBooking = await Booking.findOne({ paymentMethod: 'momo' }).sort({ createdAt: -1 });

    if (!latestBooking) {
      console.log("\x1b[31m[Lỗi] Không tìm thấy bất kỳ đơn đặt sân MoMo nào trong Database!\x1b[0m");
      process.exit(0);
    }

    const bookingId = latestBooking._id.toString();
    const amount = latestBooking.totalPrice || 35000;

    console.log(`\x1b[32m[Tìm thấy] Đơn mới nhất: ${bookingId} (Số tiền: ${amount}đ)\x1b[0m`);
    console.log(`\x1b[36m[Test MoMo] Đang kích hoạt thanh toán thành công...\x1b[0m`);

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

    axios.post('http://localhost:5000/api/bookings/momo-ipn', payload)
      .then(res => {
        console.log(`\x1b[32m[Thành công] Server phản hồi trạng thái: ${res.status}\x1b[0m`);
        console.log(`🎉 Đơn đặt sân ${bookingId} đã được duyệt thanh toán THÀNH CÔNG!`);
        process.exit(0);
      })
      .catch(err => {
        console.error("\x1b[31m[Lỗi] Không thể gửi IPN:\x1b[0m", err.response ? err.response.data : err.message);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error("\x1b[31m[Lỗi] Kết nối MongoDB thất bại:\x1b[0m", err.message);
    process.exit(1);
  });
