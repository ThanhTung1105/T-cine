# Kế Hoạch Tích Hợp API Vào Frontend (T-CINE)

## 🖼️ Về Upload Ảnh (Poster, Banner)

### Ảnh sẽ lưu ở đâu?
- **Thư mục:** `backend/storage/app/public/movies/`, `.../combos/`, `.../banners/`
- **Truy cập URL:** `http://localhost:8000/storage/movies/abc.jpg`
- **API Upload:** `POST /api/admin/upload` (file + folder)

## ✅ Tiến Độ Hoàn Thành

### Bước 1: Cấu hình Backend ✅
- [x] `php artisan storage:link`
- [x] `UploadController` — API upload ảnh
- [x] CORS đã mở

### Bước 2: Tích hợp Auth ✅
- [x] `authApi.js` — Sửa URL `/register`, `/login`
- [x] `useAuthStore.js` — Gọi API thật
- [x] `LoginPage.jsx` — Xóa mock
- [x] `RegisterPage.jsx` — Thêm phone, password_confirmation

### Bước 3: Tích hợp Customer ✅
- [x] `MovieSelection.jsx` — API `/movies/now-showing`
- [x] `MovieListPage.jsx` — API phim đang/sắp chiếu
- [x] `MovieDetailPage.jsx` — API `/movies/{id}`
- [x] `BookingPage.jsx` — API lịch chiếu theo phim + ngày
- [x] `CinemaListPage.jsx` — API danh sách rạp
- [x] `OrderHistoryPage.jsx` — API lịch sử đặt vé + hủy đơn
- [x] `ProfilePage.jsx` — API cập nhật profile + đổi mật khẩu

### Bước 4: Tích hợp Admin ✅
- [x] `MovieManagePage.jsx` — CRUD + Upload poster/banner
- [x] `CinemaManagePage.jsx` — CRUD rạp
- [x] `RoomManagePage.jsx` — CRUD phòng chiếu + xem sơ đồ ghế
- [x] `ShowtimeManagePage.jsx` — CRUD lịch chiếu + dropdown phim/rạp/phòng
- [x] `OrderManagePage.jsx` — Xem + cập nhật trạng thái đơn hàng
- [x] `UserManagePage.jsx` — Quản lý người dùng + sửa role
- [x] `DashboardPage.jsx` — Thống kê tổng quan
- [x] `RevenuePage.jsx` — Doanh thu + biểu đồ
