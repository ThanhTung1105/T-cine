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
- [x] Xây dựng các API cơ bản (CRUD) cho hệ thống ✅ (75/75 endpoints)
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
| 24 | GET | `/api/movies/{movieId}/showtimes` | Lấy lịch chiếu theo phim (trả `from_price` từ bảng giá) | [x] |
| 25 | GET | `/api/cinemas/{cinemaId}/showtimes` | Lấy lịch chiếu theo rạp | [x] |
| 26 | GET | `/api/showtimes/{id}` | Chi tiết suất chiếu (kèm trạng thái ghế, `prices` matrix, `seats[].price` resolve sẵn) | [x] |
| 27 | GET | `/api/admin/showtimes` | [Admin] Lấy tất cả suất chiếu | [x] |
| 28 | POST | `/api/admin/showtimes` | [Admin] Thêm suất chiếu (không cần nhập giá, lấy từ bảng `pricings`) | [x] |
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

### 5.13 API Quản lý Ghế (SeatController — Admin) ✅ — *mới bổ sung*
| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 69 | GET | `/api/admin/cinemas/{cId}/rooms/{rId}/seats` | [Admin] Lấy sơ đồ ghế của phòng | [x] |
| 70 | POST | `/api/admin/cinemas/{cId}/rooms/{rId}/seats/generate` | [Admin] Tạo sơ đồ ghế (rows × cols). Hàng đôi chỉ sinh `floor(cols/2)` ghế (mỗi ghế đôi rộng = 2 ghế thường nên giữ thẳng hàng). Validate sức chứa dùng `≤ room.capacity` (1 ghế đôi = 2 chỗ). **KHÔNG đụng tới `capacity`** | [x] |
| 71 | PUT | `/api/admin/cinemas/{cId}/rooms/{rId}/seats/{seatId}` | [Admin] Cập nhật `type` (normal/vip/couple) hoặc `status` (active/broken) của 1 ghế | [x] |
| 72 | DELETE | `/api/admin/cinemas/{cId}/rooms/{rId}/seats` | [Admin] Xoá toàn bộ ghế của phòng (reset sơ đồ) | [x] |

### 5.14 API Bảng giá vé (PricingController) ✅ — *mới bổ sung*
Tách giá vé khỏi `Showtime.base_price`. Toàn hệ thống dùng chung 9 dòng `pricings` (3 loại ghế × 3 loại ngày). Chi tiết tại `Pricing_Module_Plan.md`.

| # | Method | Endpoint | Mô tả | Trạng thái |
|---|--------|----------|-------|:----------:|
| 73 | GET | `/api/pricings/active` | Bảng giá hiện hành dạng matrix `{ normal: {weekday/weekend/holiday}, vip: ..., couple: ... }` | [x] |
| 74 | GET | `/api/admin/pricings` | [Admin] Lấy toàn bộ 9 dòng + matrix | [x] |
| 75 | PUT | `/api/admin/pricings` | [Admin] Upsert hàng loạt 9 cell (bulk update, transaction). Validate `seat_type ∈ {normal,vip,couple}`, `day_type ∈ {weekday,weekend,holiday}`, `price ≥ 0` | [x] |

---

## Phase 6: Tích Hợp API Frontend ✅

Tham khảo chi tiết tại `Frontend_API_Integration_Plan.md`.

### 6.1 Xác thực
- [x] `authApi.js` — Sửa URL `/register`, `/login`
- [x] `useAuthStore.js` — Gọi API thật (Zustand)
- [x] `LoginPage.jsx` — Bỏ mock, hiển thị Toast lỗi
- [x] `RegisterPage.jsx` — Thêm `phone`, `password_confirmation`

### 6.2 Trang Khách Hàng
- [x] `MovieSelection.jsx` — API `/movies/now-showing` (Sửa triệt để lỗi lệch poster bằng giải pháp padding-bottom: 150% kinh điển + absolute image + thêm min-width: 0 cho movieCard để ngăn tiêu đề dài nowrap kéo giãn cột Grid)
- [x] `MovieListPage.jsx` — API phim đang/sắp chiếu + tìm kiếm (Sửa triệt để lỗi lệch poster bằng giải pháp padding-bottom: 150% kinh điển + absolute image + thêm min-width: 0 cho movieCard để ngăn tiêu đề dài nowrap kéo giãn cột Grid)
- [x] `MovieDetailPage.jsx` — API `/movies/{id}` + trailer
- [x] `BookingPage.jsx` — Luồng chọn 3 bước **Rạp → Ngày → Suất chiếu** (tuần tự, có badge số bước, các block sau sẽ disable mờ khi chưa chọn xong block trước). Fetch 1 lần tất cả lịch chiếu sắp tới của phim, lọc client-side theo rạp/ngày để mượt. **Sửa bug timezone**: trước dùng `toISOString().split('T')[0]` (sai sang UTC khi máy UTC+7 → label "20" nhưng query date="19") → giờ format local `YYYY-MM-DD` chuẩn. Hiển thị giá tham khảo "từ X đ" trên mỗi suất.
- [x] `CinemaListPage.jsx` — API danh sách rạp
- [x] `OrderHistoryPage.jsx` — API lịch sử đặt vé + hủy đơn
- [x] `ProfilePage.jsx` — API cập nhật profile + đổi mật khẩu
- [x] `EventPage.jsx` + `EventDetailPage.jsx` — API danh sách & chi tiết sự kiện

### 6.3 Trang Quản Trị
- [x] `MovieManagePage.jsx` — CRUD phim + Upload **poster** (banner đã tách sang trang riêng)
- [x] `CinemaManagePage.jsx` — CRUD rạp (Tên / Địa chỉ / Thành phố); cột "Số phòng chiếu" hiển thị `rooms_count` thực tế từ BE (đã bỏ `total_screens` ảo)
- [x] `RoomManagePage.jsx` — CRUD phòng chiếu + **trình thiết kế sơ đồ ghế**: `capacity` của phòng = sức chứa tối đa cố định (muốn đổi phải bấm Sửa); designer nhập rows × cols + hàng VIP/Đôi, hàng đôi tự sinh `floor(cols/2)` ghế để giữ thẳng hàng (mỗi ghế đôi rộng = 2 thường); validate sức chứa dùng ≤ capacity (1 ghế đôi = 2 chỗ); live preview "X ghế → Y / Z chỗ"; click từng ghế để cycle loại; nút "Tạo lại" / "Xoá hết"; live stats Thường/VIP/Đôi
- [x] `ShowtimeManagePage.jsx` — CRUD lịch chiếu + dropdown phim/rạp/phòng (đã **bỏ trường "Giá vé mặc định"** — giá vé giờ tra từ trang Bảng giá vé). Sửa bug timezone khi gửi `end_time` (trước dùng `toISOString` lệch UTC → end < start → Laravel bắn `after:start_time`; giờ format local cho cả 2 đầu)
- [x] `PricingManagePage.jsx` — **Bảng giá vé tập trung**: ma trận 3×3 (loại ghế × loại ngày), inline edit + preview format VND, cảnh báo logic ngược (VIP < Thường, Đôi < VIP), nút "Hoàn tác" / "Lưu bảng giá"; thay thế hoàn toàn cơ chế nhập `base_price` cho từng suất chiếu
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
- [x] Nâng giới hạn upload ảnh từ 5MB → **10MB** (BE: `UploadController` `max:10240`, FE: đồng bộ hint "≤ 10MB" ở 4 trang Movie/Banner/Event/Combo) + thông điệp validate tiếng Việt rõ ràng

### 6.4 Component hỗ trợ
- [x] `Toast` component (thông báo thành công/lỗi)
- [x] Axios interceptor — tự gắn Bearer Token, redirect khi 401
- [x] `HeroCarousel` lấy banner thật từ API `/banners` (thay vì 3 slide placeholder cứng)
- [x] **`NotificationCenter` + `useNotifyStore`** — hệ thống thông báo toàn cục thay cho `window.alert/confirm`: toast stack góc phải-trên (success/error/info/warning, auto dismiss với progress bar), confirm modal trả Promise<boolean> (Enter/Escape, danger mode); helper `notify.success/error/info/warning` & `confirmDialog({...})` qua `utils/notify.js`

---

## Phase 7: Còn Lại / Cần Làm Tiếp

- [x] ~~Trang Thanh Toán (`PaymentPage`) — luồng thanh toán mô phỏng (mock VNPay/MoMo/ZaloPay)~~ ✅ *Đã xong*
- [x] Sửa lỗi trùng lịch chiếu & tích hợp panel trực quan xem trạng thái phòng chiếu trống khi thêm lịch chiếu (Đã sửa lỗi hiển thị ô tình trạng phòng & đồng bộ múi giờ local UTC+7) ✅
- [ ] Trang Cộng Đồng (`CommunityPage`) — nội dung & API (nếu cần)
- [x] Tích hợp Chatbot AI Gemini (Xem chi tiết công việc tại Phase 9) ✅
- [x] ~~Quản lý Khuyến mãi (mã giảm giá) trong Admin (`PromotionManagePage`)~~ ✅ *Đã xong*
- [x] Thiết kế lại trang Đặt vé (`BookingPage`) ✅:
  - [x] Bước 1: Hiện đầy đủ tất cả rạp, không auto-select. Bước 2 ẩn cho đến khi chọn rạp (chuyển cảnh animation slide-down)
  - [x] Bước 2: Hiện ngày theo tuần + biểu tượng lịch (date picker popup) cho khách chọn ngày ngoài tuần hiện tại
  - [x] Fix lỗi: Nhấn chọn suất chiếu bị điều hướng sang trang admin → tách route đặt vé ra khỏi `requiredRole="customer"`, chỉ cần đăng nhập
- [ ] Kiểm thử end-to-end các luồng nghiệp vụ: Đăng ký → Đặt vé → Thanh toán → Xem lịch sử
- [ ] Triển khai (Deployment): Backend (Laravel) + Frontend (Vite build)

---

## Phase 8.1: Tổ chức thư mục lưu ảnh upload

Tất cả ảnh do admin upload đều đi qua endpoint chung `POST /api/admin/upload` (xem `UploadController`).
Tham số `folder` quyết định ảnh được lưu vào thư mục con nào dưới `backend/storage/app/public/`:

| Loại ảnh | Folder | URL truy cập |
|---|---|---|
| Poster phim | `movies` | `/storage/movies/{filename}` |
| Banner trang chủ | `banners` | `/storage/banners/{filename}` |
| Sự kiện / Ưu đãi | `events` | `/storage/events/{filename}` |
| Combo bắp nước | `combos` | `/storage/combos/{filename}` |
| Logo / Ảnh rạp *(dự phòng)* | `cinemas` | `/storage/cinemas/{filename}` |
| Ảnh khuyến mãi *(dự phòng)* | `promotions` | `/storage/promotions/{filename}` |
| Avatar người dùng *(dự phòng)* | `avatars` | `/storage/avatars/{filename}` |

- Các thư mục đã được tạo sẵn với `.gitkeep` để git tracking, file ảnh thực tế không commit lên git (`.gitignore` đã cấu hình).
- Cần chạy `php artisan storage:link` 1 lần để tạo symlink `public/storage` → `storage/app/public`.
- Validation: file ≤ 5MB, định dạng `jpeg/png/jpg/gif/webp`.
- Tên file tự động slug từ tên gốc + 8 ký tự random để tránh trùng.

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
- [x] `SeatSelectionPage` — load sơ đồ ghế thật từ `GET /showtimes/{id}`, hiển thị trạng thái (available/booked/maintenance), **giá lấy trực tiếp từ BE qua bảng `pricings`** (mỗi `seat.price` server-side resolve theo loại ghế × loại ngày của suất chiếu), legend hiển thị giá tham chiếu Standard/VIP/Couple
- [x] `ConcessionPage` — load combo thật từ `GET /combos`, đồng bộ store
- [x] `PaymentPage` — hiển thị tóm tắt thật, input mã giảm giá + `promotionApi.check`, chọn phương thức (Zalopay / VNPAY / MoMo), gọi `POST /bookings` để tạo đơn rồi chuyển sang Mock Payment. Thay `alert` bằng `notify.error + getErrorMessage`
- [x] `MockPaymentPage` (`/mock-payment/:bookingId`) — đếm ngược 5 phút, hết giờ tự hủy đơn, nút "Thành công" gọi `confirmPayment`, nút "Hủy" gọi `cancel`. Thay `alert/window.confirm` bằng `notify + confirmDialog` global
- [x] `OrderHistoryPage` + `TicketDetailModal` — thay `alert/window.confirm` bằng `notify + confirmDialog` global
- [x] `BookingSuccessPage` (`/dat-ve-thanh-cong/:bookingId`) — trang xác nhận đặt vé thành công, hiển thị mã đơn, phim, rạp, ghế, combo, mã giao dịch
- [x] Cập nhật `customerRoutes.jsx` — chuẩn hoá `/dat-ve/:id`, `/chon-ghe/:showtimeId`, `/bap-nuoc`, `/thanh-toan`, `/mock-payment/:bookingId`, `/dat-ve-thanh-cong/:bookingId`

---

## Phase 9: Hệ thống Chatbot AI tư vấn phim (Gemini API) ✅ *(Chú ý: API đang chờ người dùng cung cấp GEMINI_API_KEY trong file .env ở Backend)*

### Backend (Laravel)
- [x] Viết `ChatbotController` xử lý gửi tin nhắn (nhận tin nhắn mới + mảng history từ client gửi lên) ✅
- [x] Thiết lập logic RAG context (truy vấn Phim đang/sắp chiếu, Rạp, Khuyến mãi thực tế từ DB) nhúng vào System Instruction ✅
- [x] Kết nối Gemini API (`gemini-1.5-flash`) thông qua Laravel HTTP Client trực tiếp ✅ *(Lưu ý: Chờ người dùng lấy API key)*
- [x] Đăng ký endpoint công khai `POST /api/chatbot/message` trong `routes/api.php` (đáp ứng yêu cầu: cả khách chưa đăng nhập và đã đăng nhập đều dùng được) ✅

### Frontend (React & SCSS)
- [x] Cập nhật API client `chatbotApi.js` (chỉ giữ lại hàm `sendMessage` truyền kèm tin nhắn và history) ✅
- [x] Tạo component `ChatWidget.jsx` với giao diện bong bóng nổi (Floating Chat Bubble) ở góc màn hình ✅
- [x] Thiết kế style `ChatWidget.module.scss` với phong cách Glassmorphism và Neon Glow Premium ✅
- [x] Tích hợp `ChatWidget` vào layout chung `CustomerLayout.jsx` để xuất hiện ở mọi trang client ✅
- [x] Xây dựng bộ parse Markdown đơn giản (Regex) hiển thị chữ đậm, gạch đầu dòng từ câu trả lời của AI ✅
- [x] Tạo Quick Suggestion Chips (câu hỏi gợi ý nhanh) hỗ trợ người dùng hỏi nhanh và nút Thùng rác để reset cuộc hội thoại (làm sạch state) ✅
- [x] Hiển thị Typing Indicator hoạt họa nhịp nhàng khi đợi AI phản hồi ✅

---

## Phase 10: Rà soát Bảo mật Cơ sở dữ liệu & Nâng cấp Năng lực Chatbot AI ✅

### An toàn & Bảo mật Dữ liệu (Database Security)
- [x] Rà soát và phân loại bảo mật toàn bộ 24 bảng dữ liệu trong hệ thống, phân chia rõ ràng bảng AI được phép đọc và bảng nhạy cảm tuyệt đối cấm AI truy cập ✅
- [x] Tạo tài liệu hướng dẫn lưu trữ chính thức [thong_tin_AI.md](file:///d:/doan/backend/thong_tin_AI.md) đặt trực tiếp trong thư mục gốc backend để quản lý lâu dài quy định bảo mật của AI ✅

### Backend (Laravel - ChatbotController)
- [x] Tích hợp bảng `combos` (Bắp nước) để AI có thể nắm bắt thực đơn concessions và giá cả tư vấn khách hàng ✅
- [x] Tích hợp bảng `showtimes` (Lịch chiếu) liên kết Phim, Phòng, Rạp và bộ lọc thời gian lùi ngày (`subDays(1)`) giúp hiển thị đầy đủ lịch chiếu chạy thử ngày 21/05/2026 ✅
- [x] Cải tiến truy vấn Khuyến mãi (`promotions`) truyền toàn bộ dữ liệu kèm ngày hiệu lực để AI tự so sánh, tránh trả về danh sách rỗng ✅
- [x] Củng cố quy tắc Prompt (`systemInstruction`) bổ sung kiến thức bắp nước, lịch chiếu và chỉ thị bảo mật chặn tuyệt đối các câu hỏi nhạy cảm cá nhân ✅
- [x] Xác minh cú pháp không có lỗi (`No syntax errors`) và dọn dẹp các tệp tin tạm để đảm bảo dự án sạch đẹp ✅



