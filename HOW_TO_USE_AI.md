# 🚀 Hướng Dẫn Sử Dụng Tính Năng AI

## ✅ Đã Hoàn Thành

1. ✅ Backend API đã sẵn sàng
2. ✅ Frontend components đã tạo
3. ✅ Route đã được thêm vào
4. ✅ Environment variables đã cấu hình

## 🎯 Cách Truy Cập

### Option 1: Truy cập trực tiếp URL

```
http://localhost:5173/ai-search
```

### Option 2: Thêm link vào Navigation

Mở file navigation component và thêm:

```tsx
<Link to="/ai-search">
  🤖 AI Tìm Sân
</Link>
```

## 📱 Cách Sử Dụng

### 1. Truy cập trang AI Search

- Đăng nhập với tài khoản player
- Vào `/ai-search`

### 2. Tìm kiếm bằng AI

**Cách 1: Dùng Quick Prompts**
- Click vào một trong 6 prompt mẫu
- AI sẽ tự động tìm kiếm

**Cách 2: Nhập prompt tự do**
- Gõ mô tả sân bạn muốn tìm
- Click "🤖 AI Gợi Ý"
- Hoặc nhấn Enter

### 3. Xem kết quả

- AI sẽ giải thích lý do gợi ý
- Hiển thị tiêu chí phù hợp
- Danh sách sân được gợi ý
- Khoảng cách (nếu có vị trí)

## 💡 Ví Dụ Prompt

### Cơ Bản:
```
Tìm sân bóng đá giá rẻ
Sân cầu lông gần đây
Muốn chơi tennis
```

### Chi Tiết:
```
Tìm sân bóng đá mini, giá dưới 300k/giờ, gần trung tâm
Sân cầu lông có điều hòa, giá khoảng 100-200k/giờ
Sân tennis chất lượng cao, không quan tâm giá
```

### Phức Tạp:
```
Tôi là người Hà Nội sắp vào Đà Nẵng chơi, muốn tìm sân pickleball đẹp gần quán ăn
Muốn đá bóng tối nay, sân có đèn chiếu sáng tốt, gần khách sạn
```

## 🔧 Troubleshooting

### Lỗi: "Cannot connect to API"

**Giải pháp:**
1. Kiểm tra backend đang chạy:
```bash
cd ezsport-backend
npm run dev
```

2. Kiểm tra URL trong `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

3. Restart frontend:
```bash
cd ezsport-web
npm run dev
```

### Lỗi: "Route not found"

**Giải pháp:**
- Đảm bảo đã import AISearchPage trong router
- Kiểm tra ROUTES.AI_SEARCH đã được thêm
- Clear cache và restart

### Lỗi: "AI không trả về kết quả"

**Giải pháp:**
- Kiểm tra Groq API key trong backend `.env`
- Xem logs server để biết lỗi cụ thể
- Thử prompt khác đơn giản hơn

## 🎨 Tùy Chỉnh

### Thay đổi số lượng gợi ý:

```tsx
// Trong AICourtSearch.tsx
const data = await aiService.suggestCourts({
  prompt: searchPrompt.trim(),
  limit: 10, // Thay đổi từ 5 thành 10
});
```

### Thêm Quick Prompts:

```tsx
// Trong QuickPrompts.tsx
const prompts = [
  { icon: '⚽', text: 'Sân bóng đá giá rẻ' },
  { icon: '🏸', text: 'Sân cầu lông có điều hòa' },
  // Thêm prompt mới
  { icon: '🎯', text: 'Prompt của bạn' },
];
```

### Thay đổi màu sắc:

```css
/* Trong AICourtSearch.css */
.search-button {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## 📊 Monitoring

### Xem logs backend:

```bash
# Terminal backend
# Logs sẽ hiển thị mỗi khi có request AI
```

### Xem network requests:

1. Mở DevTools (F12)
2. Tab Network
3. Filter: `/ai/suggest`
4. Xem request/response

## 🚀 Next Steps

### Tích hợp vào Navigation:

Tìm file Navigation component (thường ở `components/shared/Navigation.tsx`):

```tsx
import { ROUTES } from '../../constants/routes';

// Thêm vào menu
<NavLink to={ROUTES.AI_SEARCH}>
  <span>🤖</span>
  <span>AI Tìm Sân</span>
</NavLink>
```

### Thêm vào Landing Page:

```tsx
<Link to="/ai-search" className="cta-button">
  🤖 Thử AI Tìm Sân
</Link>
```

## ✨ Features

- ✅ Tìm kiếm bằng ngôn ngữ tự nhiên
- ✅ AI giải thích lý do gợi ý
- ✅ Hiển thị tiêu chí phù hợp
- ✅ Tự động lấy vị trí người dùng
- ✅ Sắp xếp theo khoảng cách
- ✅ Quick prompts tiện lợi
- ✅ Responsive design
- ✅ Loading & error states
- ✅ MIỄN PHÍ với Groq AI

## 🎉 Hoàn Thành!

Bây giờ bạn có thể:
1. Truy cập `/ai-search`
2. Thử các prompt khác nhau
3. Xem AI gợi ý sân thông minh

**Chúc bạn thành công! 🚀**
