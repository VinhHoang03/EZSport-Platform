import dns from "dns";
// Apply DNS guard for Windows/local environments
try {
  const dnsServers = dns.getServers();
  if (!dnsServers || dnsServers.length === 0 || (dnsServers.length === 1 && dnsServers[0] === "127.0.0.1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("DNS servers configured for seed connection.");
  }
} catch (dnsErr) {
  console.warn("Failed to configure DNS servers in seed:", dnsErr);
}

import mongoose from "mongoose";
import dotenv from "dotenv";
import Court from "./src/models/court.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const courtsData = [
  {
    name: "Sân Bóng Đá Tuyên Sơn",
    description: "Tổ hợp sân bóng đá mini cỏ nhân tạo hiện đại bậc nhất Đà Nẵng, hệ thống chiếu sáng chuẩn chuyên nghiệp, có khu căng tin nước uống và dịch vụ cho thuê đồ thể thao đầy đủ.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
    rating: 4.8,
    location: "Đường 2 Tháng 9, Hòa Cường Bắc, Hải Châu, Đà Nẵng (Gần Cầu Tuyên Sơn)",
    price: "150.000 - 300.000 VNĐ / Giờ",
    lat: 16.0366,
    lng: 108.2248,
    emoji: "⚽",
    sportType: "soccer",
    isActive: true
  },
  {
    name: "Cung Thể Thao Tiên Sơn (Sân Bóng Rổ)",
    description: "Nhà thi đấu Tiên Sơn với sàn gỗ tiêu chuẩn thi đấu quốc tế, máy lạnh mát mẻ, lý tưởng cho các trận đấu bóng rổ chuyên nghiệp và nghiệp dư tại Đà Nẵng.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
    rating: 4.9,
    location: "03 Phan Đăng Lưu, Hòa Cường Bắc, Hải Châu, Đà Nẵng",
    price: "200.000 - 400.000 VNĐ / Giờ",
    lat: 16.0345,
    lng: 108.2215,
    emoji: "🏀",
    sportType: "basketball",
    isActive: true
  },
  {
    name: "Sân Cầu Lông Kỳ Đồng",
    description: "Hệ thống sân cầu lông trong nhà gồm 6 sân thảm chuyên dụng chống trơn trượt, khoảng cách trần cao thoáng đãng, phục vụ người chơi từ sáng sớm đến tối muộn.",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop",
    rating: 4.6,
    location: "19 Kỳ Đồng, Xuân Hà, Thanh Khê, Đà Nẵng",
    price: "70.000 - 120.000 VNĐ / Giờ",
    lat: 16.0664,
    lng: 108.2045,
    emoji: "🏸",
    sportType: "badminton",
    isActive: true
  },
  {
    name: "Sân Tennis Cung Văn Hoá Thiếu Nhi",
    description: "Cụm sân tennis ngoài trời mặt sân sơn Acrylic tiêu chuẩn quốc tế, có lưới chắn gió, khán đài mini và bãi đỗ xe rộng rãi an toàn.",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop",
    rating: 4.7,
    location: "02 Phan Đăng Lưu, Hòa Cường Bắc, Hải Châu, Đà Nẵng",
    price: "150.000 - 250.000 VNĐ / Giờ",
    lat: 16.0384,
    lng: 108.2242,
    emoji: "🎾",
    sportType: "tennis",
    isActive: true
  },
  {
    name: "Sân bóng đá cỏ nhân tạo Duy Tân",
    description: "Sân bóng cỏ nhân tạo chất lượng tốt, sợi cỏ mềm mại tránh chấn thương, dịch vụ đi kèm hoàn hảo, nước uống mát lạnh miễn phí trà đá.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
    rating: 4.5,
    location: "07 Duy Tân, Hòa Cường Bắc, Hải Châu, Đà Nẵng",
    price: "120.000 - 280.000 VNĐ / Giờ",
    lat: 16.0463,
    lng: 108.2185,
    emoji: "⚽",
    sportType: "soccer",
    isActive: true
  },
  {
    name: "Sân Bóng Rổ Trung tâm VH-TT Quận Sơn Trà",
    description: "Sân bóng rổ ngoài trời miễn phí vào cửa ban ngày và có phụ phí đèn đêm siêu sáng vào ban tối. Mặt sân xi măng chống trơn chất lượng tốt.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
    rating: 4.4,
    location: "01 Trần Quang Diệu, An Hải Tây, Sơn Trà, Đà Nẵng",
    price: "50.000 - 100.000 VNĐ / Giờ",
    lat: 16.0592,
    lng: 108.2325,
    emoji: "🏀",
    sportType: "basketball",
    isActive: true
  },
  {
    name: "Sân Cầu Lông ĐH Thể Dục Thể Thao Đà Nẵng",
    description: "Thuộc khuôn viên trường Đại học TDTT Đà Nẵng, sân trong nhà chất lượng cao phục vụ các giải đấu chuyên nghiệp và đào tạo vận động viên.",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop",
    rating: 4.7,
    location: "44 Dũng Sĩ Thanh Khê, Thanh Khê Tây, Thanh Khê, Đà Nẵng",
    price: "80.000 - 130.000 VNĐ / Giờ",
    lat: 16.0668,
    lng: 108.1818,
    emoji: "🏸",
    sportType: "badminton",
    isActive: true
  },
  {
    name: "Sân Tennis Riverside Đà Nẵng",
    description: "Cụm sân tennis sát sông Hàn thoáng mát, gió mát tự nhiên, chất lượng dịch vụ chuẩn khách sạn, có huấn luyện viên hướng dẫn nếu có nhu cầu.",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop",
    rating: 4.8,
    location: "A30 Trần Hưng Đạo, An Hải Trung, Sơn Trà, Đà Nẵng",
    price: "180.000 - 300.000 VNĐ / Giờ",
    lat: 16.0615,
    lng: 108.2302,
    emoji: "🎾",
    sportType: "tennis",
    isActive: true
  }
];

const seedCourts = async () => {
  if (!MONGO_URI) {
    console.error("Error: MONGO_URI is not set in environment!");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Database...");
    await mongoose.connect(MONGO_URI);
    console.log("Successfully connected to Database.");

    // Clear existing courts
    console.log("Clearing old courts from database...");
    const deleteResult = await Court.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} old courts.`);

    // Insert new courts
    console.log(`Seeding ${courtsData.length} new sports courts in Da Nang...`);
    const insertedCourts = await Court.insertMany(courtsData);
    console.log(`Successfully seeded ${insertedCourts.length} courts!`);

    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding process:", error);
    process.exit(1);
  }
};

seedCourts();
