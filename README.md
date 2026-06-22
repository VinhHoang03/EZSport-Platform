# 🏟️ EZSport Platform

> Nền tảng đặt sân thể thao thông minh với AI

## 📖 Giới Thiệu

EZSport là nền tảng đặt sân thể thao hiện đại, tích hợp công nghệ AI để giúp người dùng tìm kiếm và đặt sân một cách dễ dàng và thông minh nhất.

### ✨ Tính Năng Nổi Bật

- 🤖 **AI Gợi Ý Sân Thông Minh** - Tìm sân bằng ngôn ngữ tự nhiên
- 📍 **Tìm Kiếm Theo Vị Trí** - Tự động tìm sân gần bạn nhất
- ⭐ **Đánh Giá & Review** - Xem đánh giá từ cộng đồng
- 📅 **Đặt Sân Online** - Đặt sân nhanh chóng, tiện lợi
- 🎯 **Check-in & Tích Điểm** - Nhận điểm thưởng khi check-in
- 📊 **So Sánh Sân** - AI phân tích và so sánh nhiều sân

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- OpenAI API Key

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/ezsport-platform.git
cd ezsport-platform

# Install backend dependencies
cd ezsport-backend
npm install

# Install frontend dependencies
cd ../ezsport-web
npm install
```

### Configuration

1. **Backend (.env):**
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

2. **Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Run Development

```bash
# Chạy cả backend + web cùng lúc từ root (không cần cd)
npm run dev

# Hoặc chạy riêng lẻ
npm run backend:dev   # chỉ backend
npm run web:dev       # chỉ web
```

---

## 📜 Scripts Reference

Tất cả lệnh chạy từ thư mục **root** `EZSport-Platform/`, không cần `cd` vào từng folder.

### Development

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy **cả backend + web** song song |
| `npm run backend:dev` | Chỉ chạy backend với hot reload |
| `npm run web:dev` | Chỉ chạy Vite dev server |

### Build

| Script | Mô tả |
|--------|-------|
| `npm run build` | Build cả backend + web |
| `npm run backend:build` | Build backend TypeScript |
| `npm run web:build` | Build web production |
| `npm run backend:start` | Chạy backend bản đã build |
| `npm run web:preview` | Preview web bản đã build |

### Git

| Script | Mô tả |
|--------|-------|
| `npm run git:status` | Xem trạng thái thay đổi |
| `npm run git:commit -- "message"` | Add all + commit với message |
| `npm run git:push` | Push lên remote |
| `npm run git:sync` | Add + commit "sync" + push 1 lệnh |

### Install

| Script | Mô tả |
|--------|-------|
| `npm run install:all` | Cài dependencies cho cả backend + web |

---

## 📁 Project Structure

```
EZSport-Platform/
├── ezsport-backend/          # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── configs/          # Configurations (DB, OpenAI, JWT...)
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic & AI services
│   │   ├── middlewares/      # Auth, upload, etc.
│   │   ├── validators/       # Request validation
│   │   └── utils/            # Utility functions
│   ├── test-ai-api.http      # API testing
│   └── package.json
│
├── ezsport-web/              # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Utilities
│   └── package.json
│
└── docs/                     # Documentation
    ├── AI_COURT_SUGGESTION_API.md
    ├── FRONTEND_INTEGRATION_GUIDE.md
    ├── AI_FEATURES_README.md
    ├── DEPLOYMENT_CHECKLIST.md
    ├── HUONG_DAN_SU_DUNG.md
    └── SUMMARY.md
```

---

## 🤖 AI Features

### 1. Smart Court Suggestion

Tìm sân bằng ngôn ngữ tự nhiên:

```bash
POST /api/courts/ai/suggest
{
  "prompt": "Tìm sân bóng đá giá rẻ gần trung tâm",
  "userLat": 21.0285,
  "userLng": 105.8542,
  "limit": 5
}
```

### 2. Auto Description Generator

Tự động tạo mô tả hấp dẫn cho sân:

```bash
POST /api/courts/:id/ai/description
```

### 3. Court Comparison

So sánh và phân tích nhiều sân:

```bash
POST /api/courts/ai/compare
{
  "courtIds": ["id1", "id2", "id3"]
}
```

📚 **Chi tiết:** Xem [AI_FEATURES_README.md](./AI_FEATURES_README.md)

---

## 📚 Documentation

### Tiếng Việt:
- 🚀 [Hướng Dẫn Sử Dụng Nhanh](./HUONG_DAN_SU_DUNG.md)
- 📝 [Tóm Tắt Tính Năng](./SUMMARY.md)

### English:
- 📖 [API Documentation](./ezsport-backend/AI_COURT_SUGGESTION_API.md)
- 🎨 [Frontend Integration Guide](./FRONTEND_INTEGRATION_GUIDE.md)
- 🤖 [AI Features README](./AI_FEATURES_README.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

---

## 🧪 Testing

### Backend API Testing

**Option 1: REST Client (VS Code)**
```bash
# Open test-ai-api.http and click "Send Request"
```

**Option 2: Node Script**
```bash
cd ezsport-backend
node test-ai-quick.js
```

**Option 3: Postman**
```bash
# Import postman_collection.json
```

**Option 4: cURL**
```bash
curl -X POST http://localhost:5000/api/courts/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tìm sân bóng đá giá rẻ", "limit": 3}'
```

---

## 🛠️ Tech Stack

### Backend:
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB + Mongoose
- **AI:** OpenAI GPT-4o-mini
- **Auth:** JWT + Google OAuth
- **Storage:** Cloudinary
- **Email:** Nodemailer

### Frontend:
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** CSS Modules / Tailwind
- **State Management:** React Context / Zustand
- **HTTP Client:** Axios
- **Maps:** Google Maps API

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/register          # Đăng ký
POST   /api/auth/login             # Đăng nhập
POST   /api/auth/google            # Google OAuth
POST   /api/auth/forgot-password   # Quên mật khẩu
POST   /api/auth/reset-password    # Reset mật khẩu
```

### Courts
```
GET    /api/courts                 # Lấy danh sách sân
POST   /api/courts                 # Tạo sân mới
DELETE /api/courts/:id             # Xóa sân
POST   /api/courts/:id/check-in    # Check-in tại sân
```

### AI Features
```
POST   /api/courts/ai/suggest      # AI gợi ý sân
POST   /api/courts/:id/ai/description  # Tạo mô tả AI
POST   /api/courts/ai/compare      # So sánh nhiều sân
```

### Users
```
GET    /api/users/profile          # Lấy thông tin user
PUT    /api/users/profile          # Cập nhật profile
GET    /api/users/loyalty-points   # Xem điểm tích lũy
```

---

## 💰 Cost Estimation

### OpenAI API (GPT-4o-mini):
- **Input:** ~$0.15 / 1M tokens
- **Output:** ~$0.60 / 1M tokens

### Estimated Monthly Costs:
| Usage | Requests/Month | Cost |
|-------|----------------|------|
| Small | 1,000 | ~$1-3 |
| Medium | 10,000 | ~$10-30 |
| Large | 100,000 | ~$100-300 |

💡 **Tip:** Implement caching để giảm chi phí

---

## 🔐 Security

- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ Rate limiting (recommended)
- ✅ CORS configuration
- ✅ Environment variables
- ✅ API key protection

---

## 🚀 Deployment

### Backend (Node.js)

**Option 1: PM2**
```bash
npm install -g pm2
pm2 start npm --name "ezsport-backend" -- start
pm2 save
pm2 startup
```

**Option 2: Docker**
```bash
docker build -t ezsport-backend .
docker run -p 5000:5000 ezsport-backend
```

### Frontend (React)

**Option 1: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

📚 **Chi tiết:** Xem [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Backend Developer:** [Your Name]
- **Frontend Developer:** [Your Name]
- **AI Integration:** [Your Name]
- **UI/UX Designer:** [Your Name]

---

## 📞 Contact

- **Email:** support@ezsport.com
- **Website:** https://ezsport.com
- **GitHub:** https://github.com/your-username/ezsport-platform

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) - AI capabilities
- [MongoDB](https://mongodb.com) - Database
- [Cloudinary](https://cloudinary.com) - Image storage
- [Google Maps](https://developers.google.com/maps) - Maps integration

---

## 📈 Roadmap

### Phase 1 (Current) ✅
- [x] Basic court listing
- [x] User authentication
- [x] AI court suggestion
- [x] Check-in & loyalty points

### Phase 2 (Next) 🚧
- [ ] Online booking system
- [ ] Payment integration
- [ ] Real-time availability
- [ ] Push notifications

### Phase 3 (Future) 📅
- [ ] Voice search
- [ ] Image recognition
- [ ] Social features
- [ ] Mobile app (React Native)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/ezsport-platform&type=Date)](https://star-history.com/#your-username/ezsport-platform&Date)

---

<div align="center">

**Made with ❤️ by EZSport Team**

[Website](https://ezsport.com) • [Documentation](./docs) • [Report Bug](https://github.com/your-username/ezsport-platform/issues) • [Request Feature](https://github.com/your-username/ezsport-platform/issues)

</div>
