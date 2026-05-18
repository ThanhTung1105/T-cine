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
  - [x] Giao diện Tổng quan (Dashboard — đã gộp Doanh thu)
  - [x] Quản lý Phim (Bảng danh sách & Modal nhập liệu ảnh/thông tin)
  - [x] Các trang quản lý khác (Rạp, Lịch chiếu, Đơn hàng, Người dùng, Banner)

## Phase 5: Backend & Database (Laravel)
- [x] Khởi tạo dự án Backend & Cấu hình MySQL
- [x] Tạo file Migration cho 13 bảng CSDL (+ bảng Events bổ sung)
- [x] Khởi tạo các Model và thiết lập Relationship (1-N, N-N)
- [x] Xây dựng các API cơ bản (CRUD) cho hệ thống ✅ (68/68 endpoints)
- [x] Bổ sung ràng buộc Unique / Check cho CSDL (migration `add_unique_and_check_constraints`)
- [x] Cấu hình CORS, `storage:link`, Sanctum Token Auth, middleware `admin`
- [x] Seeder Admin (`AdminSeeder`) & Event (`EventSeeder`)
- [x] Tích hợp API vào Frontend thay thế Mock Data ✅ (chi tiết: `Frontend_API_Integration_Plan.md`)

### 5.1 API Xác Thực (AuthController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 1 | POST | `/api/register` | Đăng ký tài khoản mới | [x] |
| 2 | POST | `/api/login` | Đăng nhập, trả về Token | [x] |
| 3 | POST | `/api/logout` | Đăng xuất, thu hồi Token | [x] |
| 4 | GET | `/api/auth/me` | Lấy thông tin user đang đăng nhập | [x] |
| 5 | PUT | `/api/auth/profile` | Cập nhật thông tin cá nhân | [x] |
| 6 | PUT | `/api/auth/change-password` | Đổi mật khẩu | [x] |

### 5.2 API Phim (MovieController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 7 | GET | `/api/movies` | Lấy danh sách phim (phân trang, lọc) | [x] |
| 8 | GET | `/api/movies/now-showing` | Lấy phim đang chiếu | [x] |
| 9 | GET | `/api/movies/coming-soon` | Lấy phim sắp chiếu | [x] |
| 10 | GET | `/api/movies/{id}` | Lấy chi tiết phim | [x] |
| 11 | GET | `/api/movies/search` | Tìm kiếm phim theo từ khóa | [x] |
| 12 | POST | `/api/admin/movies` | [Admin] Thêm phim mới | [x] |
| 13 | PUT | `/api/admin/movies/{id}` | [Admin] Cập nhật phim | [x] |
| 14 | DELETE | `/api/admin/movies/{id}` | [Admin] Xóa phim | [x] |

### 5.3 API Rạp & Phòng Chiếu (CinemaController / RoomController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 15 | GET | `/api/cinemas` | Lấy danh sách rạp | [x] |
| 16 | GET | `/api/cinemas/{id}` | Lấy chi tiết rạp (kèm phòng chiếu) | [x] |
| 17 | GET | `/api/cinemas/{id}/rooms` | Lấy danh sách phòng chiếu của rạp | [x] |
| 18 | POST | `/api/admin/cinemas` | [Admin] Thêm rạp mới | [x] |
| 19 | PUT | `/api/admin/cinemas/{id}` | [Admin] Cập nhật rạp | [x] |
| 20 | DELETE | `/api/admin/cinemas/{id}` | [Admin] Xóa rạp | [x] |
| 21 | POST | `/api/admin/cinemas/{id}/rooms` | [Admin] Thêm phòng chiếu | [x] |
| 22 | PUT | `/api/admin/cinemas/{id}/rooms/{roomId}` | [Admin] Cập nhật phòng chiếu | [x] |
| 23 | DELETE | `/api/admin/cinemas/{id}/rooms/{roomId}` | [Admin] Xóa phòng chiếu | [x] |

### 5.4 API Suất Chiếu (ShowtimeController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 24 | GET | `/api/movies/{movieId}/showtimes` | Lấy lịch chiếu theo phim | [x] |
| 25 | GET | `/api/cinemas/{cinemaId}/showtimes` | Lấy lịch chiếu theo rạp | [x] |
| 26 | GET | `/api/showtimes/{id}` | Chi tiết suất chiếu (kèm trạng thái ghế) | [x] |
| 27 | GET | `/api/admin/showtimes` | [Admin] Lấy tất cả suất chiếu | [x] |
| 28 | POST | `/api/admin/showtimes` | [Admin] Thêm suất chiếu | [x] |
| 29 | PUT | `/api/admin/showtimes/{id}` | [Admin] Cập nhật suất chiếu | [x] |
| 30 | DELETE | `/api/admin/showtimes/{id}` | [Admin] Xóa suất chiếu | [x] |

### 5.5 API Đặt Vé (BookingController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 31 | POST | `/api/bookings` | Tạo đơn đặt vé (chọn ghế + combo) | [x] |
| 32 | GET | `/api/bookings/my` | Lấy lịch sử đặt vé của user | [x] |
| 33 | GET | `/api/bookings/{id}` | Chi tiết đơn đặt vé | [x] |
| 34 | PUT | `/api/bookings/{id}/cancel` | Hủy đơn đặt vé | [x] |
| 35 | GET | `/api/admin/bookings` | [Admin] Lấy tất cả đơn đặt vé | [x] |
| 36 | PUT | `/api/admin/bookings/{id}/status` | [Admin] Cập nhật trạng thái đơn | [x] |

### 5.6 API Quản Lý Người Dùng (UserController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 37 | GET | `/api/user/profile` | Lấy thông tin cá nhân | [x] |
| 38 | PUT | `/api/user/profile` | Cập nhật thông tin cá nhân | [x] |
| 39 | GET | `/api/admin/users` | [Admin] Lấy danh sách người dùng | [x] |
| 40 | GET | `/api/admin/users/{id}` | [Admin] Chi tiết người dùng | [x] |
| 41 | PUT | `/api/admin/users/{id}` | [Admin] Cập nhật người dùng | [x] |
| 42 | DELETE | `/api/admin/users/{id}` | [Admin] Xóa người dùng | [x] |

### 5.7 API Combo Bắp Nước (ComboController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 43 | GET | `/api/combos` | Lấy danh sách combo | [x] |
| 44 | POST | `/api/admin/combos` | [Admin] Thêm combo | [x] |
| 45 | PUT | `/api/admin/combos/{id}` | [Admin] Cập nhật combo | [x] |
| 46 | DELETE | `/api/admin/combos/{id}` | [Admin] Xóa combo | [x] |

### 5.8 API Khuyến Mãi (PromotionController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 47 | GET | `/api/promotions/check` | Kiểm tra mã khuyến mãi | [x] |
| 48 | GET | `/api/admin/promotions` | [Admin] Lấy danh sách khuyến mãi | [x] |
| 49 | POST | `/api/admin/promotions` | [Admin] Thêm khuyến mãi | [x] |
| 50 | PUT | `/api/admin/promotions/{id}` | [Admin] Cập nhật khuyến mãi | [x] |
| 51 | DELETE | `/api/admin/promotions/{id}` | [Admin] Xóa khuyến mãi | [x] |

### 5.9 API Banner (BannerController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 52 | GET | `/api/banners` | Lấy danh sách banner đang hiển thị | [x] |
| 53 | GET | `/api/admin/banners` | [Admin] Lấy tất cả banner | [x] |
| 54 | POST | `/api/admin/banners` | [Admin] Thêm banner | [x] |
| 55 | PUT | `/api/admin/banners/{id}` | [Admin] Cập nhật banner | [x] |
| 56 | DELETE | `/api/admin/banners/{id}` | [Admin] Xóa banner | [x] |

### 5.10 API Thống Kê Admin (DashboardController) ✅
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 57 | GET | `/api/admin/dashboard` | Thống kê tổng quan (Dashboard) | [x] |
| 58 | GET | `/api/admin/revenue` | Thống kê doanh thu | [x] |
| 59 | GET | `/api/admin/revenue/by-movie` | Doanh thu theo phim | [x] |
| 60 | GET | `/api/admin/revenue/by-cinema` | Doanh thu theo rạp | [x] |
| 61 | GET | `/api/admin/stats/tickets` | Thống kê số lượng vé | [x] |

### 5.11 API Sự Kiện / Ưu Đãi (EventController) ✅ — *mới bổ sung*
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 62 | GET | `/api/events` | Lấy danh sách sự kiện đang hoạt động (lọc theo `category`: promotion/member/news) | [x] |
| 63 | GET | `/api/events/{id}` | Lấy chi tiết sự kiện | [x] |
| 64 | GET | `/api/admin/events` | [Admin] Lấy tất cả sự kiện (kể cả inactive) | [x] |
| 65 | POST | `/api/admin/events` | [Admin] Thêm sự kiện | [x] |
| 66 | PUT | `/api/admin/events/{id}` | [Admin] Cập nhật sự kiện | [x] |
| 67 | DELETE | `/api/admin/events/{id}` | [Admin] Xóa sự kiện | [x] |

### 5.12 API Upload Ảnh (UploadController) ✅ — *mới bổ sung*
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 68 | POST | `/api/admin/upload` | [Admin] Upload ảnh (poster, banner, combo...) → trả về URL trong `storage/` | [x] |

---

## Phase 6: Tích Hợp API Frontend ✅

Tham khảo chi tiết tại `Frontend_API_Integration_Plan.md`.

### 6.1 Xác thực
- [x] `authApi.js` — Sửa URL `/register`, `/login`
- [x] `useAuthStore.js` — Gọi API thật (Zustand)
- [x] `LoginPage.jsx` — Bỏ mock, hiển thị Toast lỗi
- [x] `RegisterPage.jsx` — Thêm `phone`, `password_confirmation`

### 6.2 Trang Khách Hàng
- [x] `MovieSelection.jsx` — API `/movies/now-showing`
- [x] `MovieListPage.jsx` — API phim đang/sắp chiếu + tìm kiếm
- [x] `MovieDetailPage.jsx` — API `/movies/{id}` + trailer
- [x] `BookingPage.jsx` — API lịch chiếu theo phim + ngày + chọn ghế
- [x] `CinemaListPage.jsx` — API danh sách rạp
- [x] `OrderHistoryPage.jsx` — API lịch sử đặt vé + hủy đơn
- [x] `ProfilePage.jsx` — API cập nhật profile + đổi mật khẩu
- [x] `EventPage.jsx` + `EventDetailPage.jsx` — API danh sách & chi tiết sự kiện

### 6.3 Trang Quản Trị
- [x] `MovieManagePage.jsx` — CRUD phim + Upload **poster** (banner đã tách sang trang riêng)
- [x] `CinemaManagePage.jsx` — CRUD rạp
- [x] `RoomManagePage.jsx` — CRUD phòng chiếu + xem sơ đồ ghế
- [x] `ShowtimeManagePage.jsx` — CRUD lịch chiếu + dropdown phim/rạp/phòng
- [x] `OrderManagePage.jsx` — Xem + cập nhật trạng thái đơn hàng
- [x] `UserManagePage.jsx` — Quản lý người dùng + sửa role
- [x] `DashboardPage.jsx` — **Tổng quan** (gộp Doanh thu vào): stats cards + lọc khoảng ngày + biểu đồ doanh thu + Top phim doanh thu + Đơn hàng gần đây
- [x] ~~`RevenuePage.jsx`~~ — *Đã gộp vào Tổng quan*
- [x] `BannerManagePage.jsx` — CRUD banner Hero Carousel trang chủ (upload ảnh, link, vị trí, bật/tắt hiển thị)
- [x] `EventManagePage.jsx` — CRUD sự kiện / ưu đãi (danh mục promotion/member/news, upload ảnh, ngày hiệu lực, bật/tắt hiển thị, **đính kèm Mã Giảm Giá**)
- [x] `ComboManagePage.jsx` — CRUD combo bắp nước (grid card, upload ảnh, giá)
- [x] `PromotionManagePage.jsx` — CRUD mã giảm giá (code, % giảm, max_discount, thời gian, lượt dùng); hiển thị trạng thái Đang hoạt động/Hết hạn/Hết lượt; copy mã nhanh
- [x] Backend: migration `add_promotion_id_to_events_table` (FK nullable, onDelete = setNull)
- [x] Trang chi tiết sự kiện (customer) hiển thị card mã giảm giá nổi bật + nút sao chép, khi event có đính kèm `promotion_id`
- [x] Thêm chú thích yêu cầu kích thước ảnh ở tất cả phần upload (Poster phim 600×900px, Banner 1920×600px, Event 800×500px, Combo 500×500px)

### 6.4 Component hỗ trợ
- [x] `Toast` component (thông báo thành công/lỗi)
- [x] Axios interceptor — tự gắn Bearer Token, redirect khi 401
- [x] `HeroCarousel` lấy banner thật từ API `/banners` (thay vì 3 slide placeholder cứng)

---

## Phase 7: Còn Lại / Cần Làm Tiếp

- [x] ~~Trang Thanh Toán (`PaymentPage`) — luồng thanh toán mô phỏng (mock VNPay/MoMo/ZaloPay)~~ ✅ *Đã xong*
- [ ] Trang Cộng Đồng (`CommunityPage`) — nội dung & API (nếu cần)
- [ ] Tích hợp Chatbot AI Gemini (`chatbotApi.js` đã có file, cần kết nối UI ChatWidget + Gemini API)
- [x] ~~Quản lý Khuyến mãi (mã giảm giá) trong Admin (`PromotionManagePage`)~~ ✅ *Đã xong*
- [ ] Kiểm thử end-to-end các luồng nghiệp vụ: Đăng ký → Đặt vé → Thanh toán → Xem lịch sử
- [ ] Triển khai (Deployment): Backend (Laravel) + Frontend (Vite build)

---

## Phase 8: Hoàn thiện luồng Đặt vé → Thanh toán (mô phỏng)

### Backend
- [x] Tạo `PaymentController@confirm` — endpoint `POST /api/bookings/{id}/confirm-payment`
- [x] Logic: tạo bản ghi `Payment` (status=success, paid_at=now), update `Booking.status = 'paid'`
- [x] Trả về booking đã eager-load tickets, combos, showtime, movie, room, cinema, payment

### Frontend
- [x] Mở rộng `useBookingStore` (Zustand + persist) — quản lý showtime, ghế, combo, mã giảm giá, booking ID xuyên suốt 4 bước
- [x] `bookingApi.confirmPayment(id, { method })`
- [x] `BookingPage` — click suất chiếu → reset store + chuyển sang `/chon-ghe/:showtimeId` (yêu cầu đăng nhập)
- [x] `SeatSelectionPage` — load sơ đồ ghế thật từ `GET /showtimes/{id}`, hiển thị trạng thái (available/booked/maintenance), tính giá theo loại ghế (Standard / VIP +30% / Couple +50%)
- [x] `ConcessionPage` — load combo thật từ `GET /combos`, đồng bộ store
- [x] `PaymentPage` — hiển thị tóm tắt thật, input mã giảm giá + `promotionApi.check`, chọn phương thức (Zalopay / VNPAY / MoMo), gọi `POST /bookings` để tạo đơn rồi chuyển sang Mock Payment
- [x] `MockPaymentPage` (`/mock-payment/:bookingId`) — đếm ngược 5 phút, hết giờ tự hủy đơn, nút "Thành công" gọi `confirmPayment`, nút "Hủy" gọi `cancel`
- [x] `BookingSuccessPage` (`/dat-ve-thanh-cong/:bookingId`) — trang xác nhận đặt vé thành công, hiển thị mã đơn, phim, rạp, ghế, combo, mã giao dịch
- [x] Cập nhật `customerRoutes.jsx` — chuẩn hoá `/dat-ve/:id`, `/chon-ghe/:showtimeId`, `/bap-nuoc`, `/thanh-toan`, `/mock-payment/:bookingId`, `/dat-ve-thanh-cong/:bookingId`
