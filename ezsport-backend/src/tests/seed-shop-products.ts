import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/user.model";
import Product from "../models/product.model";

dotenv.config({ path: path.join(__dirname, "../../.env") });
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vinhhoangdev:03072005@cluster0-hoangvinh.msq1gzg.mongodb.net/EZSport?retryWrites=true&w=majority";

const productsToSeed = [
  {
    name: "Nước bù khoáng Pocari Sweat 500ml",
    category: "Đồ uống",
    description: "Nước bù khoáng giải khát cực nhanh khi vận động cường độ cao",
    price: 15000,
    stock: 60,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400",
    type: "sell",
    isActive: true
  },
  {
    name: "Nước uống Aquafina 500ml",
    category: "Đồ uống",
    description: "Nước suối tinh khiết đóng chai mát lạnh",
    price: 8000,
    stock: 120,
    image: "https://images.unsplash.com/photo-1616118132299-57a62807be63?q=80&w=400",
    type: "sell",
    isActive: true
  },
  {
    name: "Nước tăng lực Redbull Thái",
    category: "Đồ uống",
    description: "Nước tăng lực tiếp thêm sinh lực tức thì",
    price: 18000,
    stock: 50,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400",
    type: "sell",
    isActive: true
  },
  {
    name: "Vợt Pickleball Carbon Fiber T700",
    category: "Dụng cụ",
    description: "Vợt Pickleball sợi Carbon cao cấp, trợ lực tốt, độ bền cao",
    price: 45000,
    priceWithCourt: 30000,
    stock: 15,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400",
    type: "rent",
    chargeType: "per_booking",
    isActive: true
  },
  {
    name: "Bộ vợt cầu lông Yonex Astrox",
    category: "Dụng cụ",
    description: "Cặp vợt Yonex chính hãng kèm bao đựng và 3 quả cầu lông",
    price: 35000,
    priceWithCourt: 25000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400",
    type: "rent",
    chargeType: "per_hour",
    isActive: true
  },
  {
    name: "Hộp 3 bóng Pickleball Franklin X-40",
    category: "Phụ kiện",
    description: "Bóng thi đấu ngoài trời chuẩn quốc tế Franklin X-40",
    price: 140000,
    stock: 25,
    image: "https://images.unsplash.com/photo-1595257841889-ecea6a143430?q=80&w=400",
    type: "sell",
    isActive: true
  },
  {
    name: "Cuộn quấn cán vợt chống trơn Wilson",
    category: "Phụ kiện",
    description: "Quấn cán cao su êm ái, thấm hút mồ hôi cực tốt",
    price: 20000,
    stock: 45,
    image: "https://images.unsplash.com/photo-1595257841889-ecea6a143430?q=80&w=400",
    type: "sell",
    isActive: true
  },
  {
    name: "Giày thi đấu thể thao chuyên dụng (Thuê)",
    category: "Trang phục",
    description: "Giày ôm chân, chống trơn trượt trên sân pickleball/cầu lông",
    price: 50000,
    priceWithCourt: 35000,
    stock: 8,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400",
    type: "rent",
    chargeType: "per_booking",
    isActive: true
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to database!");

  const shop = await User.findOne({ username: "Tony123" });
  if (!shop) {
    console.error("Shop user Tony123 not found!");
    process.exit(1);
  }

  const shopId = shop._id;
  const venues = shop.venueIds || [];

  if (venues.length === 0) {
    console.warn("Shop Tony123 has no linked venues! Please link a venue first.");
    process.exit(0);
  }

  // Clear existing products for this shop first to avoid duplicates during tests
  await Product.deleteMany({ owner: shopId });
  console.log(`Cleared existing products owned by shop ${shopId}.`);

  for (const venueId of venues) {
    console.log(`⏳ Seeding products for venue: ${venueId}...`);
    const docs = productsToSeed.map(p => ({
      ...p,
      owner: shopId,
      venueId: venueId
    }));
    await Product.insertMany(docs);
    console.log(`   -> Successfully seeded ${docs.length} products!`);
  }

  console.log("💪 Seeding products completed successfully!");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Seed error:", err);
  mongoose.disconnect();
});
