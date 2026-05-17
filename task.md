# T-Cine Frontend — Task Tracker

## Phase 1: Khởi tạo & Nền tảng

- [x] Khởi tạo project Vite + React
- [x] Cài đặt dependencies (Zustand, React Router, Axios, SCSS, v.v.)
- [x] Tạo cấu trúc thư mục đầy đủ
- [x] Setup SCSS global (design system: biến màu, font, spacing, mixins)
- [x] Setup Axios client & cấu hình API
- [x] Tạo file .env, .gitignore

## Phase 2: Layout & Routing
- [x] Tạo CustomerLayout (Header, Footer)
- [x] Tích hợp React Router cho các trang khách hàng
- [x] Tạo AdminLayout (Sidebar, Header)
- [x] Setup route bảo vệ (ProtectedRoute) cho admin

## Phase 3: Trang Khách Hàng
- [x] Xây dựng Trang Chủ (HomePage) với Hero Banner, Movie Selection, Event Section, Bottom Banners
- [x] Xây dựng Trang Danh Sách Phim
- [x] Xây dựng Trang Chi Tiết Phim
- [x] Xây dựng Trang Sự Kiện (Tin Mới & Ưu Đãi)
- [x] Xây dựng Trang Chọn Ghế / Thanh Toán

## Phase 4: Tính năng Khác & Admin
- [x] Xây dựng trang Đăng Nhập / Đăng Ký (Mock data)
- [x] Xây dựng Trang Quản Trị (Mô phỏng tĩnh)
  - [x] Hoàn thiện Layout (Sidebar & Header)
  - [x] Giao diện Tổng quan (Dashboard)
  - [x] Quản lý Phim (Bảng danh sách & Modal nhập liệu ảnh/thông tin)
  - [x] Các trang quản lý khác (Rạp, Lịch chiếu, Đơn hàng, Người dùng, Doanh thu)

## Phase 5: Backend & Database (Laravel)
- [x] Khởi tạo dự án Backend & Cấu hình MySQL
- [x] Tạo file Migration cho 13 bảng CSDL
- [x] Khởi tạo các Model và thiết lập Relationship (1-N, N-N)
- [x] Xây dựng các API cơ bản (CRUD) cho hệ thống ✅ (61/61 endpoints)
- [ ] Tích hợp API vào Frontend thay thế Mock Data

### 5.1 API Xác Thực (AuthController) — `đang làm`
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 1 | POST | `/api/register` | Đăng ký tài khoản mới | [ ] |
| 2 | POST | `/api/login` | Đăng nhập, trả về Token | [ ] |
| 3 | POST | `/api/logout` | Đăng xuất, thu hồi Token | [ ] |
| 4 | GET | `/api/auth/me` | Lấy thông tin user đang đăng nhập | [ ] |
| 5 | PUT | `/api/auth/profile` | Cập nhật thông tin cá nhân | [ ] |
| 6 | PUT | `/api/auth/change-password` | Đổi mật khẩu | [ ] |

### 5.2 API Phim (MovieController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 7 | GET | `/api/movies` | Lấy danh sách phim (phân trang, lọc) | [ ] |
| 8 | GET | `/api/movies/now-showing` | Lấy phim đang chiếu | [ ] |
| 9 | GET | `/api/movies/coming-soon` | Lấy phim sắp chiếu | [ ] |
| 10 | GET | `/api/movies/{id}` | Lấy chi tiết phim | [ ] |
| 11 | GET | `/api/movies/search` | Tìm kiếm phim theo từ khóa | [ ] |
| 12 | POST | `/api/admin/movies` | [Admin] Thêm phim mới | [ ] |
| 13 | PUT | `/api/admin/movies/{id}` | [Admin] Cập nhật phim | [ ] |
| 14 | DELETE | `/api/admin/movies/{id}` | [Admin] Xóa phim | [ ] |

### 5.3 API Rạp & Phòng Chiếu (CinemaController / RoomController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 15 | GET | `/api/cinemas` | Lấy danh sách rạp | [ ] |
| 16 | GET | `/api/cinemas/{id}` | Lấy chi tiết rạp (kèm phòng chiếu) | [ ] |
| 17 | GET | `/api/cinemas/{id}/rooms` | Lấy danh sách phòng chiếu của rạp | [ ] |
| 18 | POST | `/api/admin/cinemas` | [Admin] Thêm rạp mới | [ ] |
| 19 | PUT | `/api/admin/cinemas/{id}` | [Admin] Cập nhật rạp | [ ] |
| 20 | DELETE | `/api/admin/cinemas/{id}` | [Admin] Xóa rạp | [ ] |
| 21 | POST | `/api/admin/cinemas/{id}/rooms` | [Admin] Thêm phòng chiếu | [ ] |
| 22 | PUT | `/api/admin/cinemas/{id}/rooms/{roomId}` | [Admin] Cập nhật phòng chiếu | [ ] |
| 23 | DELETE | `/api/admin/cinemas/{id}/rooms/{roomId}` | [Admin] Xóa phòng chiếu | [ ] |

### 5.4 API Suất Chiếu (ShowtimeController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 24 | GET | `/api/movies/{movieId}/showtimes` | Lấy lịch chiếu theo phim | [ ] |
| 25 | GET | `/api/cinemas/{cinemaId}/showtimes` | Lấy lịch chiếu theo rạp | [ ] |
| 26 | GET | `/api/showtimes/{id}` | Chi tiết suất chiếu (kèm trạng thái ghế) | [ ] |
| 27 | GET | `/api/admin/showtimes` | [Admin] Lấy tất cả suất chiếu | [ ] |
| 28 | POST | `/api/admin/showtimes` | [Admin] Thêm suất chiếu | [ ] |
| 29 | PUT | `/api/admin/showtimes/{id}` | [Admin] Cập nhật suất chiếu | [ ] |
| 30 | DELETE | `/api/admin/showtimes/{id}` | [Admin] Xóa suất chiếu | [ ] |

### 5.5 API Đặt Vé (BookingController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 31 | POST | `/api/bookings` | Tạo đơn đặt vé (chọn ghế + combo) | [ ] |
| 32 | GET | `/api/bookings/my` | Lấy lịch sử đặt vé của user | [ ] |
| 33 | GET | `/api/bookings/{id}` | Chi tiết đơn đặt vé | [ ] |
| 34 | PUT | `/api/bookings/{id}/cancel` | Hủy đơn đặt vé | [ ] |
| 35 | GET | `/api/admin/bookings` | [Admin] Lấy tất cả đơn đặt vé | [ ] |
| 36 | PUT | `/api/admin/bookings/{id}/status` | [Admin] Cập nhật trạng thái đơn | [ ] |

### 5.6 API Quản Lý Người Dùng (UserController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 37 | GET | `/api/user/profile` | Lấy thông tin cá nhân | [ ] |
| 38 | PUT | `/api/user/profile` | Cập nhật thông tin cá nhân | [ ] |
| 39 | GET | `/api/admin/users` | [Admin] Lấy danh sách người dùng | [ ] |
| 40 | GET | `/api/admin/users/{id}` | [Admin] Chi tiết người dùng | [ ] |
| 41 | PUT | `/api/admin/users/{id}` | [Admin] Cập nhật người dùng | [ ] |
| 42 | DELETE | `/api/admin/users/{id}` | [Admin] Xóa người dùng | [ ] |

### 5.7 API Combo Bắp Nước (ComboController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 43 | GET | `/api/combos` | Lấy danh sách combo | [ ] |
| 44 | POST | `/api/admin/combos` | [Admin] Thêm combo | [ ] |
| 45 | PUT | `/api/admin/combos/{id}` | [Admin] Cập nhật combo | [ ] |
| 46 | DELETE | `/api/admin/combos/{id}` | [Admin] Xóa combo | [ ] |

### 5.8 API Khuyến Mãi (PromotionController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 47 | GET | `/api/promotions/check` | Kiểm tra mã khuyến mãi | [ ] |
| 48 | GET | `/api/admin/promotions` | [Admin] Lấy danh sách khuyến mãi | [ ] |
| 49 | POST | `/api/admin/promotions` | [Admin] Thêm khuyến mãi | [ ] |
| 50 | PUT | `/api/admin/promotions/{id}` | [Admin] Cập nhật khuyến mãi | [ ] |
| 51 | DELETE | `/api/admin/promotions/{id}` | [Admin] Xóa khuyến mãi | [ ] |

### 5.9 API Banner (BannerController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 52 | GET | `/api/banners` | Lấy danh sách banner đang hiển thị | [ ] |
| 53 | GET | `/api/admin/banners` | [Admin] Lấy tất cả banner | [ ] |
| 54 | POST | `/api/admin/banners` | [Admin] Thêm banner | [ ] |
| 55 | PUT | `/api/admin/banners/{id}` | [Admin] Cập nhật banner | [ ] |
| 56 | DELETE | `/api/admin/banners/{id}` | [Admin] Xóa banner | [ ] |

### 5.10 API Thống Kê Admin (AdminController)
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 57 | GET | `/api/admin/dashboard` | Thống kê tổng quan (Dashboard) | [ ] |
| 58 | GET | `/api/admin/revenue` | Thống kê doanh thu | [ ] |
| 59 | GET | `/api/admin/revenue/by-movie` | Doanh thu theo phim | [ ] |
| 60 | GET | `/api/admin/revenue/by-cinema` | Doanh thu theo rạp | [ ] |
| 61 | GET | `/api/admin/stats/tickets` | Thống kê số lượng vé | [ ] |
