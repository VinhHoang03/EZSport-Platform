# 🔧 Hướng Dẫn Khởi Động Lại - Sửa Lỗi Import

## ✅ Đã Làm Gì

1. ✅ Dừng tất cả Node processes
2. ✅ Xóa Vite cache (`node_modules/.vite`)
3. ✅ Kiểm tra file `ai.service.ts` - Export đúng rồi!

---

## 🚀 Bây Giờ Làm Gì

### Bước 1: Mở 2 Terminal

#### Terminal 1 - Backend
```bash
cd ezsport-backend
npm run dev
```
✅ Chờ thấy: `Server running on port 5000`

#### Terminal 2 - Frontend
```bash
cd ezsport-web
npm run dev
```
✅ Chờ thấy: `Local: http://localhost:5173`

---

### Bước 2: Mở Trình Duyệt

1. Vào: **http://localhost:5173**
2. Nhấn **Ctrl + Shift + R** (hard refresh - xóa cache trình duyệt)
3. Vào trang **Venues** hoặc **App** (trang bản đồ)
4. Tìm nút **🤖** ở góc dưới bên phải (phía trên nút chat 💬)

---

### Bước 3: Test AI

1. **Nhấn nút 🤖**
2. **Thử prompt**: "Tìm sân bóng đá giá rẻ"
3. **Xem kết quả** với giải thích AI
4. **Nhấn "Chỉ đường"** để xem tích hợp bản đồ

---

## 🎯 Vị Trí Nút AI

```
        🤖  ← Nút AI (mới!) - 100px từ dưới
        
        💬  ← Nút Chat - 24px từ dưới
```

Cả 2 nút đều ở **góc dưới bên phải**

---

## 🐛 Nếu Vẫn Lỗi

### Lỗi Import vẫn xuất hiện?

**Giải pháp 1: Xóa cache trình duyệt**
- Chrome: Nhấn **F12** → Tab **Application** → **Clear storage** → **Clear site data**
- Hoặc: **Ctrl + Shift + Delete** → Xóa cache

**Giải pháp 2: Xóa thêm cache**
```bash
cd ezsport-web
rmdir /s /q node_modules\.vite
rmdir /s /q dist
npm run dev
```

**Giải pháp 3: Restart máy tính**
- Đôi khi Node process vẫn chạy ngầm
- Restart máy sẽ dọn sạch

---

## 🧪 Các Prompt Test

### ✅ Prompt Tốt (về thể thao)
```
1. "Tìm sân bóng đá giá rẻ gần trung tâm"
2. "Sân cầu lông có điều hòa ở Đà Nẵng"
3. "Sân tennis chất lượng cao có bãi đỗ xe"
4. "Sân pickleball đẹp gần quán ăn"
```

### ❌ Prompt Xấu (không về thể thao - sẽ bị từ chối)
```
1. "Tìm nhà hàng ngon"
2. "Bệnh viện ở đâu?"
3. "Thời tiết hôm nay thế nào?"
```

---

## 📞 Cần Trợ Giúp?

### Kiểm tra Backend
```bash
# Xem backend có chạy không
curl http://localhost:5000/courts
```

### Kiểm tra Frontend
```bash
# Xem frontend có chạy không
curl http://localhost:5173
```

### Xem Log Lỗi
- **Backend**: Xem terminal backend
- **Frontend**: Nhấn **F12** → Tab **Console**

---

## 📁 File Đã Sửa

```
✅ ezsport-web/src/services/ai.service.ts
   - Export đúng: CourtSuggestionResponse
   - Export đúng: Court, MatchedCriteria
   - Export đúng: aiService

✅ ezsport-web/src/components/ai/AISearchModal.tsx
   - Import đúng từ ai.service.ts
   - UI hoàn chỉnh với quick prompts

✅ ezsport-web/src/App.tsx
   - Nút AI ở vị trí: bottom: 100px, right: 24px
   - Không chồng lên nút chat
```

---

## ✨ Tính Năng AI

### 1. Modal Tìm Sân AI
- 💡 Gợi ý prompt nhanh (4 loại sân)
- 🔍 Tìm kiếm ngôn ngữ tự nhiên
- 🤖 Giải thích AI
- 📊 Tiêu chí phù hợp (badges)
- 🏟️ Kết quả sân với hình ảnh
- 🧭 "Chỉ đường" (tích hợp bản đồ)
- 👁️ "Xem chi tiết" (trang chi tiết sân)

### 2. Tích Hợp Bản Đồ
- Chỉ đường trực tiếp từ kết quả AI
- Luồng điều hướng mượt mà
- Tìm kiếm theo vị trí

### 3. Trải Nghiệm Người Dùng
- Thiết kế gradient tím đẹp
- Layout responsive
- Trạng thái loading
- Xử lý lỗi
- Hỗ trợ geolocation

---

## 🎉 Sẵn Sàng!

Tất cả đã được thiết lập. Chỉ cần:

1. ✅ Khởi động backend
2. ✅ Khởi động frontend
3. ✅ Nhấn nút 🤖
4. ✅ Thử tìm sân!

---

**Chúc bạn test thành công! 🚀**
