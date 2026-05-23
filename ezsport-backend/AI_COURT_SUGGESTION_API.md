# 🤖 API Gợi Ý Sân Thể Thao Bằng AI

## Tổng Quan

Hệ thống sử dụng OpenAI GPT-4o-mini để phân tích yêu cầu của người dùng và gợi ý các sân thể thao phù hợp nhất.

## 🚀 Các API Endpoints

### 1. Gợi Ý Sân Dựa Trên Prompt

**Endpoint:** `POST /api/courts/ai/suggest`

**Mô tả:** AI phân tích prompt của người dùng và gợi ý các sân phù hợp nhất.

**Request Body:**
```json
{
  "prompt": "Tôi muốn tìm sân bóng đá giá rẻ gần trung tâm Hà Nội",
  "userLat": 21.0285,
  "userLng": 105.8542,
  "maxDistance": 10,
  "limit": 5
}
```

**Parameters:**
- `prompt` (required): Mô tả yêu cầu của người dùng (3-500 ký tự)
- `userLat` (optional): Vĩ độ vị trí người dùng
- `userLng` (optional): Kinh độ vị trí người dùng
- `maxDistance` (optional): Khoảng cách tối đa (km), mặc định 10km
- `limit` (optional): Số lượng sân gợi ý, mặc định 5

**Response:**
```json
{
  "message": "AI gợi ý sân thành công",
  "data": {
    "suggestions": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f1a",
        "name": "Sân Bóng Đá Mini ABC",
        "sportType": "Bóng đá",
        "location": "Đống Đa, Hà Nội",
        "price": "200.000đ/giờ",
        "rating": 4.5,
        "lat": 21.0285,
        "lng": 105.8542,
        "image": "https://...",
        "emoji": "⚽",
        "description": "Sân bóng đá mini chất lượng cao..."
      }
    ],
    "aiExplanation": "Dựa trên yêu cầu của bạn về sân bóng đá giá rẻ gần trung tâm Hà Nội, tôi gợi ý các sân sau...",
    "matchedCriteria": {
      "sportType": "Bóng đá",
      "priceRange": "Giá rẻ (dưới 300.000đ/giờ)",
      "location": "Trung tâm Hà Nội",
      "features": ["Gần trung tâm", "Giá cả phải chăng"]
    }
  }
}
```

**Ví dụ Prompt:**
- "Tìm sân cầu lông có điều hòa gần đây"
- "Sân bóng rổ chất lượng cao, không quan tâm giá"
- "Muốn đá bóng với bạn bè, khoảng 300k/giờ"
- "Sân tennis ngoài trời, view đẹp"
- "Tìm sân giá rẻ để tập thể dục buổi sáng"

---

### 2. Tạo Mô Tả Chi Tiết Cho Sân Bằng AI

**Endpoint:** `POST /api/courts/:id/ai/description`

**Mô tả:** Tự động tạo mô tả hấp dẫn cho sân thể thao bằng AI.

**Request:**
```
POST /api/courts/60d5ec49f1b2c72b8c8e4f1a/ai/description
```

**Response:**
```json
{
  "message": "Tạo mô tả thành công",
  "data": {
    "description": "Sân Bóng Đá Mini ABC là lựa chọn hoàn hảo cho những ai yêu thích bóng đá tại khu vực Đống Đa. Với mặt sân cỏ nhân tạo chất lượng cao và hệ thống chiếu sáng hiện đại, sân đảm bảo trải nghiệm tuyệt vời cho mọi trận đấu."
  }
}
```

---

### 3. So Sánh Nhiều Sân Bằng AI

**Endpoint:** `POST /api/courts/ai/compare`

**Mô tả:** AI phân tích và so sánh chi tiết nhiều sân thể thao.

**Request Body:**
```json
{
  "courtIds": [
    "60d5ec49f1b2c72b8c8e4f1a",
    "60d5ec49f1b2c72b8c8e4f1b",
    "60d5ec49f1b2c72b8c8e4f1c"
  ]
}
```

**Parameters:**
- `courtIds` (required): Mảng 2-5 ID sân cần so sánh

**Response:**
```json
{
  "message": "So sánh sân thành công",
  "data": {
    "comparison": "**So sánh chi tiết:**\n\n1. **Sân ABC** - Điểm mạnh: Giá rẻ, vị trí thuận tiện. Điểm yếu: Cơ sở vật chất cũ.\n\n2. **Sân XYZ** - Điểm mạnh: Chất lượng cao, hiện đại. Điểm yếu: Giá cao hơn.\n\n**Đề xuất:**\n- Nếu ưu tiên tiết kiệm: Chọn Sân ABC\n- Nếu ưu tiên chất lượng: Chọn Sân XYZ"
  }
}
```

---

## 🧪 Test API

### Sử dụng cURL:

```bash
# 1. Gợi ý sân
curl -X POST http://localhost:5000/api/courts/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Tìm sân bóng đá giá rẻ",
    "limit": 3
  }'

# 2. Tạo mô tả
curl -X POST http://localhost:5000/api/courts/60d5ec49f1b2c72b8c8e4f1a/ai/description

# 3. So sánh sân
curl -X POST http://localhost:5000/api/courts/ai/compare \
  -H "Content-Type: application/json" \
  -d '{
    "courtIds": ["id1", "id2", "id3"]
  }'
```

### Sử dụng Postman:

1. Import collection từ file `postman_collection.json`
2. Chọn endpoint muốn test
3. Điền thông tin request body
4. Click Send

---

## 🔧 Cấu Hình

### Environment Variables (.env):

```env
OPENAI_API_KEY=sk-proj-your-api-key-here
```

### Cài Đặt Dependencies:

```bash
npm install openai
```

---

## 💡 Cách Hoạt Động

1. **Nhận Prompt:** API nhận prompt từ người dùng
2. **Lấy Danh Sách Sân:** Truy vấn tất cả sân đang hoạt động
3. **Gọi OpenAI:** Gửi prompt + context sân đến GPT-4o-mini
4. **Phân Tích:** AI phân tích và xác định tiêu chí (loại sân, giá, vị trí...)
5. **Gợi Ý:** AI chọn các sân phù hợp nhất
6. **Sắp Xếp:** Nếu có vị trí người dùng, sắp xếp theo khoảng cách
7. **Trả Về:** Response với danh sách sân + giải thích chi tiết

---

## 🎯 Use Cases

### 1. Tìm Kiếm Thông Minh
Người dùng không cần biết chính xác tên sân, chỉ cần mô tả nhu cầu:
- "Muốn chơi cầu lông tối nay"
- "Sân bóng gần nhà, giá sinh viên"

### 2. Khám Phá Sân Mới
AI gợi ý các sân phù hợp dựa trên sở thích:
- "Sân có view đẹp để chụp ảnh"
- "Sân hiện đại, có đầy đủ tiện nghi"

### 3. So Sánh & Quyết Định
Giúp người dùng so sánh nhiều sân để chọn lựa tốt nhất:
- So sánh giá, chất lượng, vị trí
- Phân tích ưu nhược điểm

### 4. Tự Động Hóa Nội Dung
Tạo mô tả hấp dẫn cho sân mới:
- Tiết kiệm thời gian viết content
- Mô tả nhất quán và chuyên nghiệp

---

## ⚠️ Lưu Ý

1. **Rate Limiting:** OpenAI có giới hạn request, cân nhắc implement caching
2. **Cost:** Mỗi request tốn tiền, monitor usage thường xuyên
3. **Fallback:** Nếu AI lỗi, hệ thống tự động trả về sân có rating cao nhất
4. **Validation:** Luôn validate input để tránh prompt injection
5. **Language:** Hệ thống được tối ưu cho tiếng Việt

---

## 🚀 Tính Năng Mở Rộng

### Có thể phát triển thêm:

1. **Lịch Sử Gợi Ý:** Lưu lại các lần gợi ý để cải thiện
2. **Personalization:** Học sở thích người dùng theo thời gian
3. **Voice Input:** Tích hợp speech-to-text
4. **Image Analysis:** Phân tích ảnh sân để gợi ý tốt hơn
5. **Real-time Availability:** Kết hợp với lịch đặt sân
6. **Multi-language:** Hỗ trợ nhiều ngôn ngữ

---

## 📊 Monitoring

### Metrics cần theo dõi:

- Số lượng request AI/ngày
- Thời gian response trung bình
- Tỷ lệ thành công/thất bại
- Chi phí OpenAI API
- User satisfaction với gợi ý

---

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **"AI không trả về kết quả"**
   - Kiểm tra OPENAI_API_KEY
   - Verify API key còn credit

2. **"Không tìm thấy sân phù hợp"**
   - Kiểm tra database có sân không
   - Thử prompt khác rõ ràng hơn

3. **Response chậm**
   - OpenAI API có thể chậm
   - Cân nhắc implement timeout
   - Sử dụng caching cho prompt phổ biến

---

## 📝 License

MIT License - EZSport Platform
