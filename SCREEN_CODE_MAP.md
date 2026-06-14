# 📺 EZSport — Màn Hình & File Code Tương Ứng

Tài liệu này liệt kê toàn bộ các màn hình (screen) của ứng dụng EZSport và file code nguồn tương ứng trong dự án.

---

## 🗂️ Kiến Trúc Tổng Quan

```
ezsport-web/src/
├── app/router.tsx              # Định nghĩa toàn bộ routing
├── App.tsx                     # Legacy app shell (map dashboard + venues)
├── pages/                      # Page wrapper (entry point cho mỗi route)
│   ├── public/                 # Màn hình công khai (chưa đăng nhập)
│   ├── player/                 # Màn hình dành cho Player
│   ├── owner/                  # Màn hình dành cho Owner
│   └── admin/                  # Màn hình dành cho Admin
├── components/                 # UI Components (logic + giao diện thực tế)
│   ├── shared/                 # Dùng chung cho mọi role
│   ├── auth/                   # Đăng nhập / Đăng ký
│   ├── player/                 # Components dành riêng cho Player
│   ├── owner/                  # Components dành riêng cho Owner
│   └── admin/                  # Components dành riêng cho Admin
└── layouts/                    # Layout bọc ngoài theo role
```

---

## 🌐 Màn Hình Công Khai (Public — Chưa Đăng Nhập)

### 1. 🏠 Landing Page (Trang Chủ)
| Thành phần | File |
|---|---|
| Route | `/` |
| Page Wrapper | `src/pages/public/LandingPage.tsx` |
| Core Component | `src/components/shared/LandingPage.tsx` |
| Layout | `src/layouts/AuthLayout.tsx` |
| Sub-components | `src/components/shared/Footer.tsx` · `src/components/shared/FadingVideo.tsx` |

---

### 2. 🔐 Đăng Nhập / Đăng Ký (Auth Page)
| Thành phần | File |
|---|---|
| Route Login | `/login` |
| Route Register | `/register` |
| Page Wrapper Login | `src/pages/public/LoginPage.tsx` |
| Page Wrapper Register | `src/pages/public/RegisterPage.tsx` |
| Core Component (cả Login + Register) | `src/components/auth/AuthPage.tsx` |
| Layout | `src/layouts/AuthLayout.tsx` |
| Backend API | `POST /auth/login` · `POST /auth/register` |
| Backend Controller | `ezsport-backend/src/controllers/auth.controller.ts` |

---

### 3. 🔑 Quên Mật Khẩu
| Thành phần | File |
|---|---|
| Route | `/forgot-password` |
| Page Wrapper | `src/pages/public/ForgotPasswordPage.tsx` |
| Core Component | `src/components/auth/ForgotPasswordForm.tsx` |
| Backend API | `POST /auth/forgot-password` |

---

### 4. 🔄 Đặt Lại Mật Khẩu
| Thành phần | File |
|---|---|
| Route | `/reset-password` |
| Page Wrapper | `src/components/auth/ResetPasswordPage.tsx` |
| Core Component | `src/components/auth/ResetPasswordForm.tsx` |
| Backend API | `POST /auth/reset-password` |

---

## 👤 Màn Hình Player (Người Chơi)

> **Guard:** `src/components/shared/ProtectedRoute.tsx` — chỉ cho phép role `player`

---

### 5. 🗺️ Bản Đồ Đặt Sân (Map Dashboard)
| Thành phần | File |
|---|---|
| Route | `/map` |
| Page Wrapper | `src/pages/player/MapPage.tsx` |
| Core Component (App Shell) | `src/App.tsx` |
| Bản đồ Leaflet | `src/components/shared/MapComponent.tsx` |
| Danh sách sân (sidebar trái) | `src/components/player/CourtList.tsx` |
| Thanh tìm kiếm dưới | `src/components/shared/SearchBar.tsx` |
| Panel chỉ đường | `src/components/shared/NavigationPanel.tsx` |
| AI Chatbot nổi | `src/components/shared/AIChatbot.tsx` |
| Backend API | `GET /courts` |
| Backend Controller | `ezsport-backend/src/controllers/court.controller.ts` |

---

### 6. 🔍 Tìm Sân (Venues Discovery)
| Thành phần | File |
|---|---|
| Route | `/venues` |
| Page Wrapper + Logic | `src/pages/player/VenuesPage.tsx` |
| Layout | `src/layouts/PlayerLayout.tsx` |
| Danh sách sân | `src/components/player/CourtList.tsx` |
| Sidebar lọc trái | `src/components/player/LeftFilterSidebar.tsx` |
| Bản đồ mini phải | `src/components/shared/MapComponent.tsx` |
| Backend API | `GET /courts` |

---

### 7. 📋 Chi Tiết Sân (Court Detail)
| Thành phần | File |
|---|---|
| Route | `/venues/:id` |
| Page Wrapper | `src/pages/player/CourtDetailPage.tsx` |
| Core Component | `src/components/player/CourtDetail.tsx` |
| Layout | `src/layouts/PlayerLayout.tsx` |

---

### 8. 💳 Đặt Sân / Thanh Toán (Checkout)
| Thành phần | File |
|---|---|
| Route | `/venues/:id/checkout` |
| Page Wrapper | `src/pages/player/CheckoutPageWrapper.tsx` |
| Core Component | `src/components/player/CheckoutPage.tsx` |
| Layout | `src/layouts/PlayerLayout.tsx` |

---

### 9. ✅ Đặt Sân Thành Công (Booking Success)
| Thành phần | File |
|---|---|
| Route | `/booking-success` |
| Page Wrapper | `src/pages/player/BookingSuccessWrapper.tsx` |
| Core Component | `src/components/player/BookingSuccessPage.tsx` |
| Layout | `src/layouts/PlayerLayout.tsx` |

---

### 10. 👤 Hồ Sơ Cá Nhân (Profile)
| Thành phần | File |
|---|---|
| Route | `/profile` |
| Page Wrapper | `src/pages/player/ProfilePageWrapper.tsx` |
| Core Component | `src/components/player/ProfilePage.tsx` |
| Layout | `src/layouts/PlayerLayout.tsx` |

---

### 11. 🤝 Tìm Người Chơi Cùng (Playmates)
| Thành phần | File |
|---|---|
| Route | `/playmates` |
| Page Wrapper | `src/pages/player/PlaymatesWrapper.tsx` |
| Core Component | `src/components/player/PlaymatesPage.tsx` |
| Layout | `src/layouts/PlayerLayout.tsx` |

---

## 🏢 Màn Hình Owner (Chủ Sân)

> **Guard:** `src/components/shared/ProtectedRoute.tsx` — chỉ cho phép role `owner`

### 12. 📊 Dashboard Chủ Sân
| Thành phần | File |
|---|---|
| Route | `/owner` |
| Page Wrapper | `src/pages/owner/OwnerDashboardWrapper.tsx` |
| Core Component | `src/components/owner/OwnerDashboard.tsx` |
| Layout | `src/layouts/OwnerLayout.tsx` |
| Backend API | `GET /courts` · `POST /courts` · `DELETE /courts/:id` |
| Backend Controller | `ezsport-backend/src/controllers/court.controller.ts` |

---

## 🛡️ Màn Hình Admin (Quản Trị Viên)

> **Guard:** `src/components/shared/ProtectedRoute.tsx` — chỉ cho phép role `admin`

### 13. 🖥️ Dashboard Admin
| Thành phần | File |
|---|---|
| Route | `/admin` |
| Page Wrapper | `src/pages/admin/AdminDashboardWrapper.tsx` |
| Core Component | `src/components/admin/AdminDashboard.tsx` |
| Layout | `src/layouts/AdminLayout.tsx` |

---

## 🧩 Shared Components (Dùng Chung)

| Component | File | Được dùng ở |
|---|---|---|
| Navigation Bar | `src/components/shared/Navigation.tsx` | Map, Venues, tất cả Player pages |
| Bản đồ Leaflet | `src/components/shared/MapComponent.tsx` | Map page, Venues page |
| AI Chatbot | `src/components/shared/AIChatbot.tsx` | Map page |
| Panel Chỉ Đường | `src/components/shared/NavigationPanel.tsx` | Map page |
| Thanh Tìm Kiếm | `src/components/shared/SearchBar.tsx` | Map page |
| Protected Route Guard | `src/components/shared/ProtectedRoute.tsx` | Mọi route cần đăng nhập |
| Modal Thêm Sân | `src/components/player/AddCourtModal.tsx` | Map page |
| Sidebar Bộ Lọc | `src/components/player/LeftFilterSidebar.tsx` | Venues page |
| Danh Sách Sân | `src/components/player/CourtList.tsx` | Map page, Venues page |

---

## 🗄️ Backend — Phân Tầng Controller / Route / Model

| Màn hình liên quan | Route File | Controller File | Model File |
|---|---|---|---|
| Sân thể thao | `routes/court.routes.ts` | `controllers/court.controller.ts` | `models/court.model.ts` |
| Đăng nhập / Đăng ký | `routes/auth.routes.ts` | `controllers/auth.controller.ts` | `models/user.model.ts` |
| Check-in tại sân | `routes/court.routes.ts` | `controllers/court.controller.ts` | `models/checkin.model.ts` |
| Yêu cầu dịch vụ | `routes/serviceRequest.routes.ts` | `controllers/serviceRequest.controller.ts` | `models/serviceRequest.model.ts` |
| Yêu cầu đăng ký Provider | `routes/providerRequest.routes.ts` | `controllers/providerRequest.controller.ts` | `models/providerRequest.model.ts` |

---

## 🔐 Luồng Xác Thực (Auth Flow)

```
Người dùng truy cập route cần đăng nhập
        ↓
ProtectedRoute.tsx kiểm tra AuthContext
        ↓
   Chưa đăng nhập → Redirect /login
        ↓
Đăng nhập thành công → AuthContext lưu user + token
        ↓
   role = 'player'  → Redirect /map
   role = 'owner'   → Redirect /owner
   role = 'admin'   → Redirect /admin
```

Context lưu trạng thái: `src/context/AuthContext.tsx`

---

## 🚀 Khởi Động Dự Án

```bash
# Backend
cd ezsport-backend
npm run dev          # Khởi động server tại http://localhost:5000

# Frontend
cd ezsport-web
npm run dev          # Khởi động UI tại http://localhost:5173

# Seed dữ liệu sân test Đà Nẵng
cd ezsport-backend
npm run seed
```
