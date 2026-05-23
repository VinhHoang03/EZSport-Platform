# 🚀 Hướng Dẫn Sử Dụng Nhanh - AI Gợi Ý Sân

## 📝 Tóm Tắt

Tính năng AI gợi ý sân giúp người dùng tìm kiếm sân thể thao bằng ngôn ngữ tự nhiên. Chỉ cần mô tả sân bạn muốn, AI sẽ tự động phân tích và gợi ý những lựa chọn tốt nhất.

---

## ⚡ Bắt Đầu Nhanh

### Bước 1: Kiểm Tra Cài Đặt

```bash
cd ezsport-backend

# Kiểm tra OpenAI API key
cat .env | grep OPENAI_API_KEY
# Kết quả: OPENAI_API_KEY=sk-proj-...
```

### Bước 2: Khởi Động Server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### Bước 3: Test API

**Cách 1: Dùng cURL (Terminal)**
```bash
curl -X POST http://localhost:5000/api/courts/ai/suggest \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"Tìm sân bóng đá giá rẻ\", \"limit\": 3}"
```

**Cách 2: Dùng REST Client (VS Code)**
1. Mở file `test-ai-api.http`
2. Click vào "Send Request" ở trên mỗi request
3. Xem kết quả bên phải

**Cách 3: Dùng Node Script**
```bash
node test-ai-quick.js
```

**Cách 4: Dùng Postman**
1. Import file `postman_collection.json`
2. Chọn request muốn test
3. Click "Send"

---

## 🎯 3 Tính Năng Chính

### 1. 🤖 Gợi Ý Sân Thông Minh

**API:** `POST /api/courts/ai/suggest`

**Ví dụ Request:**
```json
{
  "prompt": "Tìm sân cầu lông có điều hòa, giá khoảng 100-200k/giờ",
  "userLat": 21.0285,
  "userLng": 105.8542,
  "maxDistance": 5,
  "limit": 5
}
```

**Ví dụ Response:**
```json
{
  "message": "AI gợi ý sân thành công",
  "data": {
    "suggestions": [
      {
        "name": "Sân Cầu Lông ABC",
        "sportType": "Cầu lông",
        "location": "Đống Đa, Hà Nội",
        "price": "150.000đ/giờ",
        "rating": 4.5,
        "distance": 1.2
      }
    ],
    "aiExplanation": "Dựa trên yêu cầu của bạn...",
    "matchedCriteria": {
      "sportType": "Cầu lông",
      "priceRange": "100-200k/giờ",
      "location": "Gần bạn"
    }
  }
}
```

**Các Prompt Mẫu:**
- "Tìm sân bóng đá giá rẻ"
- "Sân cầu lông gần đây"
- "Muốn chơi tennis buổi tối"
- "Sân bóng rổ ngoài trời, view đẹp"
- "Tìm sân có đèn chiếu sáng tốt"

---

### 2. 📝 Tạo Mô Tả Tự Động

**API:** `POST /api/courts/:id/ai/description`

**Ví dụ:**
```bash
curl -X POST http://localhost:5000/api/courts/60d5ec49f1b2c72b8c8e4f1a/ai/description
```

**Response:**
```json
{
  "message": "Tạo mô tả thành công",
  "data": {
    "description": "Sân Bóng Đá Mini ABC là lựa chọn hoàn hảo cho những ai yêu thích bóng đá..."
  }
}
```

---

### 3. ⚖️ So Sánh Nhiều Sân

**API:** `POST /api/courts/ai/compare`

**Ví dụ Request:**
```json
{
  "courtIds": [
    "60d5ec49f1b2c72b8c8e4f1a",
    "60d5ec49f1b2c72b8c8e4f1b",
    "60d5ec49f1b2c72b8c8e4f1c"
  ]
}
```

**Response:**
```json
{
  "message": "So sánh sân thành công",
  "data": {
    "comparison": "**So sánh chi tiết:**\n\n1. Sân ABC - Giá rẻ nhưng cơ sở vật chất cũ...\n2. Sân XYZ - Chất lượng cao nhưng giá cao..."
  }
}
```

---

## 📱 Tích Hợp Vào Frontend

### React Example:

```typescript
// 1. Tạo service
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/courts';

export const suggestCourts = async (prompt: string) => {
  const response = await axios.post(`${API_URL}/ai/suggest`, {
    prompt,
    limit: 5
  });
  return response.data.data;
};

// 2. Sử dụng trong component
import { useState } from 'react';

function CourtSearch() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await suggestCourts(prompt);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Mô tả sân bạn muốn tìm..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Đang tìm...' : 'Tìm Sân'}
      </button>

      {results && (
        <div>
          <p>{results.aiExplanation}</p>
          {results.suggestions.map(court => (
            <div key={court._id}>
              <h3>{court.name}</h3>
              <p>{court.location} - {court.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 Các Ví Dụ Prompt

### Tìm Kiếm Cơ Bản:
```
✅ "Tìm sân bóng đá"
✅ "Sân cầu lông gần đây"
✅ "Muốn chơi tennis"
```

### Tìm Kiếm Theo Giá:
```
✅ "Sân bóng đá giá rẻ"
✅ "Sân cầu lông dưới 200k/giờ"
✅ "Tìm sân giá sinh viên"
```

### Tìm Kiếm Theo Vị Trí:
```
✅ "Sân gần trung tâm Hà Nội"
✅ "Tìm sân gần trường đại học"
✅ "Sân ở quận Đống Đa"
```

### Tìm Kiếm Theo Tiện Nghi:
```
✅ "Sân có điều hòa"
✅ "Sân có đèn chiếu sáng"
✅ "Sân có chỗ đậu xe"
✅ "Sân có phòng thay đồ"
```

### Tìm Kiếm Phức Tạp:
```
✅ "Tìm sân bóng đá mini 5-7 người, có mái che, giá dưới 300k/giờ, gần trường đại học"
✅ "Sân cầu lông có điều hòa, view đẹp, giá tầm trung, gần trung tâm"
✅ "Sân tennis ngoài trời, chất lượng cao, có huấn luyện viên"
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. API Key:
- ✅ Đã được cấu hình trong `.env`
- ⚠️ Không share API key với người khác
- ⚠️ Không commit `.env` lên Git

### 2. Chi Phí:
- 💰 Mỗi request tốn ~$0.001 - $0.003
- 💰 1000 requests/ngày = ~$1-3
- 💡 Nên implement caching để tiết kiệm

### 3. Rate Limiting:
- ⏱️ Free tier: 3 requests/phút
- ⏱️ Paid tier: 3500 requests/phút
- 💡 Nên thêm rate limiting cho user

### 4. Response Time:
- ⏱️ Trung bình: 2-5 giây
- ⏱️ Tùy thuộc vào độ phức tạp prompt
- 💡 Nên có loading state trong UI

---

## 🐛 Xử Lý Lỗi

### Lỗi: "Invalid API Key"
```bash
# Kiểm tra API key
echo $OPENAI_API_KEY

# Verify key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Lỗi: "Rate limit exceeded"
- Đợi 1 phút rồi thử lại
- Hoặc upgrade OpenAI plan

### Lỗi: "Timeout"
- Prompt quá dài, rút ngắn lại
- Hoặc tăng timeout trong axios config

### Lỗi: "No courts found"
- Kiểm tra database có sân không
- Thử prompt khác rõ ràng hơn

---

## 📊 Monitoring

### Kiểm Tra Logs:
```bash
# Xem logs server
tail -f logs/server.log

# Hoặc nếu dùng PM2
pm2 logs ezsport-backend
```

### Kiểm Tra OpenAI Usage:
1. Truy cập: https://platform.openai.com/usage
2. Xem số requests và chi phí
3. Set budget alerts nếu cần

---

## 🎯 Tips & Best Practices

### 1. Viết Prompt Tốt:
```
❌ Tệ: "sân"
✅ Tốt: "Tìm sân bóng đá giá rẻ"
✅ Tốt hơn: "Tìm sân bóng đá mini, giá dưới 300k/giờ, gần trung tâm"
```

### 2. Sử Dụng Vị Trí:
```javascript
// Lấy vị trí người dùng
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // Gửi kèm trong request
});
```

### 3. Cache Kết Quả:
```javascript
// Cache prompt phổ biến
const cache = new Map();

if (cache.has(prompt)) {
  return cache.get(prompt);
}

const result = await suggestCourts(prompt);
cache.set(prompt, result);
```

### 4. Error Handling:
```javascript
try {
  const result = await suggestCourts(prompt);
  // Success
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limit
    alert('Vui lòng thử lại sau 1 phút');
  } else {
    // Other errors
    alert('Có lỗi xảy ra, vui lòng thử lại');
  }
}
```

---

## 📚 Tài Liệu Chi Tiết

Để biết thêm chi tiết, xem các file sau:

1. **API Documentation:** `AI_COURT_SUGGESTION_API.md`
2. **Frontend Guide:** `FRONTEND_INTEGRATION_GUIDE.md`
3. **Main README:** `AI_FEATURES_README.md`
4. **Deployment:** `DEPLOYMENT_CHECKLIST.md`
5. **Summary:** `SUMMARY.md`

---

## 🆘 Cần Giúp Đỡ?

### Tài Nguyên:
- OpenAI Docs: https://platform.openai.com/docs
- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com

### Test Files:
- REST Client: `test-ai-api.http`
- Node Script: `test-ai-quick.js`
- Postman: `postman_collection.json`

---

## ✅ Checklist Trước Khi Deploy

- [ ] API key đã được cấu hình
- [ ] Test tất cả endpoints thành công
- [ ] Frontend đã tích hợp
- [ ] Monitoring đã setup
- [ ] Rate limiting đã implement
- [ ] Error handling đã hoàn thiện
- [ ] Documentation đã đầy đủ

---

## 🎉 Hoàn Thành!

Bạn đã sẵn sàng sử dụng tính năng AI gợi ý sân!

**Bắt đầu ngay:**
```bash
npm run dev
node test-ai-quick.js
```

**Chúc bạn thành công! 🚀**
