# 🤖 EZSport AI Features - Tính Năng Gợi Ý Sân Thông Minh

## 📖 Tổng Quan

Hệ thống AI gợi ý sân thể thao sử dụng **OpenAI GPT-4o-mini** để phân tích yêu cầu của người dùng bằng ngôn ngữ tự nhiên và đề xuất các sân phù hợp nhất.

### ✨ Tính Năng Chính

1. **🔍 AI Court Suggestion** - Gợi ý sân dựa trên prompt tự nhiên
2. **📝 Auto Description Generator** - Tự động tạo mô tả hấp dẫn cho sân
3. **⚖️ Court Comparison** - So sánh và phân tích nhiều sân

---

## 🚀 Quick Start

### 1. Cài Đặt Dependencies

```bash
cd ezsport-backend
npm install openai express-validator --legacy-peer-deps
```

### 2. Cấu Hình Environment

Thêm vào file `.env`:
```env
OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 3. Khởi Động Server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

---

## 📚 Tài Liệu

### Backend API Documentation
👉 Xem chi tiết: [AI_COURT_SUGGESTION_API.md](./ezsport-backend/AI_COURT_SUGGESTION_API.md)

### Frontend Integration Guide
👉 Xem chi tiết: [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)

---

## 🎯 Ví Dụ Sử Dụng

### Gọi API với cURL:

```bash
curl -X POST http://localhost:5000/api/courts/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Tìm sân bóng đá giá rẻ gần trung tâm Hà Nội",
    "userLat": 21.0285,
    "userLng": 105.8542,
    "limit": 5
  }'
```

### Response:

```json
{
  "message": "AI gợi ý sân thành công",
  "data": {
    "suggestions": [
      {
        "_id": "...",
        "name": "Sân Bóng Đá Mini ABC",
        "sportType": "Bóng đá",
        "location": "Đống Đa, Hà Nội",
        "price": "200.000đ/giờ",
        "rating": 4.5,
        "distance": 1.2
      }
    ],
    "aiExplanation": "Dựa trên yêu cầu của bạn về sân bóng đá giá rẻ gần trung tâm Hà Nội...",
    "matchedCriteria": {
      "sportType": "Bóng đá",
      "priceRange": "Giá rẻ",
      "location": "Trung tâm Hà Nội"
    }
  }
}
```

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────┐
│   Backend API (Express)         │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Court Controller        │  │
│  │  - suggestCourts()       │  │
│  │  - generateDescription() │  │
│  │  - compareCourts()       │  │
│  └───────────┬──────────────┘  │
│              │                  │
│  ┌───────────▼──────────────┐  │
│  │  Court Service           │  │
│  │  - AI Logic              │  │
│  │  - Data Processing       │  │
│  └───────────┬──────────────┘  │
│              │                  │
└──────────────┼──────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  OpenAI API │  │  MongoDB    │
│  (GPT-4o)   │  │  (Courts)   │
└─────────────┘  └─────────────┘
```

---

## 📁 Cấu Trúc File

```
ezsport-backend/
├── src/
│   ├── configs/
│   │   └── openai.ts              # OpenAI configuration
│   ├── controllers/
│   │   └── court.controller.ts    # Court endpoints + AI features
│   ├── services/
│   │   └── court.service.ts       # AI logic & business rules
│   ├── routes/
│   │   └── court.routes.ts        # API routes
│   ├── validators/
│   │   └── court.validator.ts     # Request validation
│   └── models/
│       └── court.model.ts         # Court schema
├── test-ai-api.http               # API testing file
├── AI_COURT_SUGGESTION_API.md     # API documentation
└── .env                           # Environment variables
```

---

## 🎨 Các Prompt Mẫu

### Tìm Kiếm Cơ Bản:
- "Tìm sân bóng đá giá rẻ"
- "Sân cầu lông gần đây"
- "Muốn chơi tennis"

### Tìm Kiếm Chi Tiết:
- "Tìm sân bóng đá mini 5-7 người, có mái che, giá dưới 300k/giờ"
- "Sân cầu lông có điều hòa, gần trường đại học, giá sinh viên"
- "Sân tennis ngoài trời, view đẹp, có huấn luyện viên"

### Tìm Kiếm Theo Thời Gian:
- "Muốn đá bóng tối nay"
- "Sân có đèn chiếu sáng tốt cho buổi tối"
- "Tìm sân mở cửa sớm cho buổi sáng"

### Tìm Kiếm Theo Tiện Nghi:
- "Sân có chỗ đậu xe rộng rãi"
- "Có phòng thay đồ và nhà vệ sinh sạch sẽ"
- "Sân có dịch vụ cho thuê đồ"

---

## 🔧 Cấu Hình Nâng Cao

### Tùy Chỉnh AI Model:

```typescript
// src/services/court.service.ts

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",        // Có thể đổi sang gpt-4, gpt-3.5-turbo
  temperature: 0.7,             // 0-1: Độ sáng tạo
  max_tokens: 500,              // Giới hạn độ dài response
  response_format: { type: "json_object" }, // Format JSON
});
```

### Tùy Chỉnh System Prompt:

Chỉnh sửa `systemPrompt` trong `court.service.ts` để thay đổi cách AI phân tích và gợi ý.

---

## 💰 Chi Phí & Giới Hạn

### OpenAI Pricing (GPT-4o-mini):
- **Input:** ~$0.15 / 1M tokens
- **Output:** ~$0.60 / 1M tokens

### Ước Tính Chi Phí:
- 1 request gợi ý sân: ~$0.001 - $0.003
- 1000 requests/ngày: ~$1 - $3
- 30,000 requests/tháng: ~$30 - $90

### Rate Limits:
- Free tier: 3 requests/minute
- Paid tier: 3,500 requests/minute

👉 **Khuyến nghị:** Implement caching và rate limiting

---

## 🛡️ Bảo Mật

### 1. API Key Protection:
```typescript
// ✅ ĐÚNG - Lưu trong .env
OPENAI_API_KEY=sk-proj-...

// ❌ SAI - Không hardcode trong code
const apiKey = "sk-proj-...";
```

### 2. Input Validation:
```typescript
// Validator đã được implement
- Prompt: 3-500 ký tự
- Lat/Lng: Kiểm tra range hợp lệ
- Limit: 1-20 sân
```

### 3. Rate Limiting:
```typescript
// TODO: Implement rate limiting
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // 10 requests
});

router.post('/ai/suggest', aiLimiter, suggestCourts);
```

---

## 📊 Monitoring & Analytics

### Metrics Cần Theo Dõi:

1. **Usage Metrics:**
   - Số lượng AI requests/ngày
   - Thời gian response trung bình
   - Tỷ lệ thành công/thất bại

2. **Cost Metrics:**
   - Chi phí OpenAI/ngày
   - Tokens consumed
   - Cost per request

3. **Quality Metrics:**
   - User satisfaction với gợi ý
   - Click-through rate
   - Conversion rate

### Implement Logging:

```typescript
// src/services/court.service.ts

console.log({
  timestamp: new Date(),
  action: 'ai_suggest_courts',
  prompt: prompt.substring(0, 50),
  resultsCount: suggestedCourts.length,
  tokensUsed: completion.usage?.total_tokens,
  cost: calculateCost(completion.usage),
});
```

---

## 🐛 Troubleshooting

### Lỗi: "Invalid API Key"
```bash
# Kiểm tra API key
echo $OPENAI_API_KEY

# Verify key còn hoạt động
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Lỗi: "Rate limit exceeded"
```typescript
// Implement retry logic
const result = await retry(
  () => courtAIService.suggestCourts(params),
  { retries: 3, delay: 1000 }
);
```

### Lỗi: "Timeout"
```typescript
// Tăng timeout
axios.defaults.timeout = 30000; // 30 seconds
```

---

## 🚀 Tính Năng Tương Lai

### Phase 2:
- [ ] Voice input (Speech-to-text)
- [ ] Image analysis (Phân tích ảnh sân)
- [ ] Personalization (Học sở thích người dùng)
- [ ] Multi-language support

### Phase 3:
- [ ] Real-time availability check
- [ ] Price prediction
- [ ] Weather-based suggestions
- [ ] Social recommendations

---

## 📞 Support

### Liên Hệ:
- Email: support@ezsport.com
- GitHub Issues: [Link]
- Documentation: [Link]

### Resources:
- OpenAI Docs: https://platform.openai.com/docs
- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com

---

## 📄 License

MIT License - EZSport Platform 2026

---

## 🎉 Kết Luận

Bạn đã hoàn thành việc tích hợp AI vào hệ thống EZSport! 

**Next Steps:**
1. ✅ Test API endpoints
2. ✅ Tích hợp vào frontend
3. ✅ Deploy lên production
4. ✅ Monitor usage & costs
5. ✅ Collect user feedback

**Happy Coding! 🚀**
