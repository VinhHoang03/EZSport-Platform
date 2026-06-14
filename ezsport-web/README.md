# 🏆 EZSport Web Platform

Hệ thống quản lý và đặt sân thể thao thông minh, hỗ trợ người dùng tìm kiếm, điều hướng và tích lũy điểm thưởng.

## 🚀 Tính năng chính (Frontend)

### 1. Bản đồ tương tác (Interactive Map)
- **Hiển thị sân:** Xem vị trí tất cả các sân thể thao trên bản đồ thời gian thực.
- **Vị trí người dùng:** Tự động xác định vị trí hiện tại của người dùng qua GPS.
- **Marker thông minh:** Nhấn vào Marker để xem thông tin nhanh và khoảng cách từ vị trí hiện tại.

### 2. Tìm kiếm và Bộ lọc
- **Thanh tìm kiếm:** Tìm kiếm sân theo môn thể thao, địa điểm và ngày tháng.
- **Tìm kiếm theo khu vực:** Nút "Search this area" cho phép quét các sân trong vùng bản đồ đang xem.

### 3. Danh sách sân (Court Listing)
- **Hiển thị trực quan:** Danh sách sân ở sidebar với hình ảnh, tên, giá và khoảng cách động.
- **Tính khoảng cách:** Tự động tính khoảng cách từ người dùng đến từng sân theo đường chim bay.

### 4. Hệ thống Điều hướng & Chỉ đường (Routing)
- **Chỉ đường thời gian thực:** Sử dụng máy chủ OSRM/Leaflet Routing Machine để vẽ đường đi ngắn nhất.
- **Bảng điều hướng:** Hiển thị thời gian dự kiến (ETA) và quãng đường cần di chuyển.
- **Chế độ thu nhỏ:** Thu gọn bảng điều hướng thành một "pill" nhỏ dưới màn hình để tối ưu diện tích bản đồ.

### 5. Hệ thống Check-in & Tích lũy điểm (Mới ✨)
- **Nhận diện đến nơi:** Nút "Check-in" tự động xuất hiện khi người dùng đi vào phạm vi 200m quanh sân.
- **Tích điểm thưởng:** Người dùng nhận được điểm thưởng (Loyalty Points) sau khi hoàn thành quãng đường và check-in thành công.
- **Chống gian lận:** Backend tự động kiểm tra tọa độ GPS thực tế trước khi cộng điểm.

### 6. Quản lý Sân
- **Thêm sân mới:** Form Modal cho phép nhà cung cấp thêm sân với đầy đủ thông tin (tên, giá, loại sân, vị trí qua bản đồ).

### 7. Xác thực người dùng
- **Đăng ký/Đăng nhập:** Hỗ trợ lưu trữ Token qua LocalStorage để duy trì phiên làm việc.

---

## 🛠 Công nghệ sử dụng
- **Core:** React 19, TypeScript, Vite.
- **Bản đồ:** Leaflet, React-Leaflet, Leaflet Routing Machine.
- **UI/UX:** Tailwind CSS, Bootstrap, Framer Motion (Animation), Lucide React (Icons).
- **API:** Axios (với interceptor tự động đính kèm Token).

---

## 📂 Cấu trúc thư mục `src/`
- `components/`: Các thành phần giao diện (Map, Sidebar, Search, Modals).
- `api/`: Cấu hình Axios và các hàm gọi API.
- `context/`: Quản lý trạng thái ứng dụng (Auth, Global State).
- `assets/`: Hình ảnh và icon.

---

## 💻 Hướng dẫn chạy dự án
1. `npm install`
2. Tạo file `.env` (copy từ `.env.example` nếu có).
3. `npm run dev`
