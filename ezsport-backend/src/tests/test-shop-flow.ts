import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load dotenv
dotenv.config({ path: path.join(__dirname, "../../.env") });

import { User } from "../models/user.model";
import Venue from "../models/venue.model";
import Court from "../models/court.model";
import Product from "../models/product.model";
import Booking from "../models/booking.model";
import bookingService from "../services/booking.service";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vinhhoangdev:03072005@cluster0-hoangvinh.msq1gzg.mongodb.net/EZSport?retryWrites=true&w=majority";

async function runTest() {
  console.log("🚀 Bắt đầu kết nối CSDL...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Kết nối CSDL thành công!");

  // Clean up existing leftovers if any
  await User.deleteMany({ email: /@test-shop-flow\.com/ });
  await Venue.deleteMany({ name: "Venue Test Shop Flow" });
  await Product.deleteMany({ name: /Test Flow|Pocari Sweat/ });
  await Booking.deleteMany({ bookerName: "Player Test" });

  try {
    // 1. Tạo Shop Seller
    console.log("⏳ 1. Tạo tài khoản Shop Seller...");
    const shopSeller = await User.create({
      username: "shopseller_test",
      email: "shop@test-shop-flow.com",
      password: "password123",
      fullName: "Shop Owner Test",
      role: "shop",
      venueIds: []
    });
    console.log(`   -> Tạo thành công Shop Seller ID: ${shopSeller._id}`);

    // 2. Tạo Player
    console.log("⏳ 2. Tạo tài khoản Player...");
    const player = await User.create({
      username: "player_test",
      email: "player@test-shop-flow.com",
      password: "password123",
      fullName: "Player Test",
      role: "player"
    });
    console.log(`   -> Tạo thành công Player ID: ${player._id}`);

    // 3. Tạo Venue & Court
    console.log("⏳ 3. Tạo Venue & Court...");
    const venue = await Venue.create({
      name: "Venue Test Shop Flow",
      location: "123 Test Street, Da Nang",
      lat: 16.047,
      lng: 108.206,
      openTime: "06:00",
      closeTime: "22:00",
      sportTypes: ["BADMINTON"],
      pricePerHour: 100000,
      price: "100.000đ",
      owner: player._id // Mock owner
    });
    const court = await Court.create({
      name: "Sân số 1 - Test Flow",
      venue: venue._id,
      sportTypes: ["BADMINTON"],
      pricePerHour: 100000
    });
    console.log(`   -> Tạo thành công Venue ID: ${venue._id}, Court ID: ${court._id}`);

    // 4. Liên kết Venue cho Shop Seller
    console.log("⏳ 4. Liên kết Venue cho Shop Seller...");
    shopSeller.venueIds = [venue._id];
    await shopSeller.save();
    console.log("   -> Liên kết thành công!");

    // 5. Tạo Sản phẩm Bán & Cho Thuê
    console.log("⏳ 5. Tạo Sản phẩm bán đứt và cho thuê...");
    const rentalProduct = await Product.create({
      venueId: venue._id,
      owner: shopSeller._id,
      name: "Vợt Yonex Cao Cấp (Thuê)",
      category: "Dụng cụ",
      description: "Thuê vợt Yonex chất lượng",
      price: 50000,
      priceWithCourt: 30000, // Giá ưu đãi khi thuê kèm sân
      stock: 10,
      isActive: true,
      type: "rent",
      chargeType: "per_booking"
    });

    const drinkProduct = await Product.create({
      venueId: venue._id,
      owner: shopSeller._id,
      name: "Nước Pocari Sweat (Bán)",
      category: "Đồ uống",
      description: "Nước bù khoáng uống giải khát",
      price: 15000,
      stock: 20,
      isActive: true,
      type: "sell"
    });
    console.log("   -> Tạo sản phẩm thành công!");

    // 6. Thực hiện Đặt sân kèm sản phẩm (Kiểm thử Giá ưu đãi & Khấu trừ tồn kho)
    console.log("⏳ 6. Đặt sân kèm sản phẩm...");
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 1); // Ngày mai
    const dateStr = bookingDate.toISOString().split("T")[0];

    const bookingPayload = {
      courtId: court._id,
      bookingDate: dateStr,
      startTime: "08:00",
      endTime: "10:00",
      duration: 2,
      sport: "BADMINTON",
      basePrice: 200000, // 100k/h * 2h
      paymentMethod: "cash",
      bookerName: "Player Test",
      bookerPhone: "0999888777",
      products: [
        { productId: rentalProduct._id, name: rentalProduct.name, quantity: 2 }, // Thuê 2 vợt (Cùng sân -> Giá ưu đãi 30k * 2 = 60k)
        { productId: drinkProduct._id, name: drinkProduct.name, quantity: 3 } // Mua 3 nước (15k * 3 = 45k)
      ]
    };

    const newBooking = await bookingService.createBooking(player._id.toString(), bookingPayload);
    console.log(`   -> Tạo đặt sân thành công! Tổng số tiền: ${newBooking.totalPrice}đ (Giá mong muốn: 200k sân + 15k dịch vụ sân + 60k thuê vợt ưu đãi + 45k mua nước = 320kđ)`);

    // Verify stock deduction
    const updatedRental = await Product.findById(rentalProduct._id);
    const updatedDrink = await Product.findById(drinkProduct._id);
    console.log(`   -> Kiểm tra tồn kho sau đặt sân: Vợt còn ${updatedRental?.stock} (mong muốn 8), Nước còn ${updatedDrink?.stock} (mong muốn 17)`);

    if (updatedRental?.stock !== 8 || updatedDrink?.stock !== 17) {
      throw new Error("❌ Sai sót trong việc cập nhật số lượng tồn kho!");
    }

    // 7. Hoàn thành Đặt sân (Trả lại dụng cụ thuê, nước bán đứt giữ nguyên)
    console.log("⏳ 7. Hoàn thành trận đấu...");
    newBooking.status = "CHECKED_IN";
    await newBooking.save();
    await bookingService.completeBooking(newBooking._id.toString());

    const rentalAfterComplete = await Product.findById(rentalProduct._id);
    const drinkAfterComplete = await Product.findById(drinkProduct._id);
    console.log(`   -> Tồn kho sau hoàn thành: Vợt hoàn lại ${rentalAfterComplete?.stock} (mong muốn 10), Nước giữ nguyên ${drinkAfterComplete?.stock} (mong muốn 17)`);

    if (rentalAfterComplete?.stock !== 10 || drinkAfterComplete?.stock !== 17) {
      throw new Error("❌ Luồng hoàn dụng cụ thuê khi hoàn thành đơn bị lỗi!");
    }

    // 8. Hủy đặt sân & Hoàn trả toàn bộ tài nguyên
    console.log("⏳ 8. Hủy đặt sân kiểm thử hoàn kho toàn bộ...");
    // Khấu trừ lại tồn kho giả lập để test hủy đơn
    rentalAfterComplete!.stock = 8;
    drinkAfterComplete!.stock = 17;
    await rentalAfterComplete!.save();
    await drinkAfterComplete!.save();

    await bookingService.refundBookingResources(newBooking);
    const rentalAfterRefund = await Product.findById(rentalProduct._id);
    const drinkAfterRefund = await Product.findById(drinkProduct._id);
    console.log(`   -> Tồn kho sau hủy đơn: Vợt hoàn ${rentalAfterRefund?.stock} (mong muốn 10), Nước hoàn ${drinkAfterRefund?.stock} (mong muốn 20)`);

    if (rentalAfterRefund?.stock !== 10 || drinkAfterRefund?.stock !== 20) {
      throw new Error("❌ Sai sót trong việc hoàn kho khi hủy đặt sân!");
    }

    console.log("💪 TẤT CẢ CÁC BƯỚC THỬ NGHIỆM ĐỀU THÀNH CÔNG RỰC RỠ!");
  } catch (err: any) {
    console.error("❌ Phát hiện lỗi trong luồng kiểm thử:", err.message);
  } finally {
    console.log("🧹 Dọn dẹp dữ liệu thử nghiệm...");
    await User.deleteMany({ email: /@test-shop-flow\.com/ });
    await Venue.deleteMany({ name: "Venue Test Shop Flow" });
    await Product.deleteMany({ name: /Test Flow|Pocari Sweat/ });
    await Booking.deleteMany({ bookerName: "Player Test" });
    await mongoose.connection.close();
    console.log("🔌 Đã đóng kết nối CSDL!");
  }
}

runTest();
