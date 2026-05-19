# TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE)

Dưới đây là các bảng cơ sở dữ liệu dự kiến cho hệ thống T-CINE:

### 3.9.1 Bảng Cinemas
**Mục đích:** Bảng Cinemas lưu trữ thông tin về các rạp chiếu phim trong hệ thống.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã rạp |
| 2 | `name` | Varchar | 255 | | Tên rạp |
| 3 | `address` | Varchar | 255 | | Địa chỉ rạp |
| 4 | `city` | Varchar | 100 | | Thành phố |

> Lưu ý: trước đây có cột `total_screens` nhập tay khi tạo rạp, nhưng đã được loại bỏ vì gây nhầm lẫn với số phòng chiếu thực tế. Hiện tại số phòng chiếu được tính tự động qua `withCount('rooms')` (alias `rooms_count`).

---

### 3.9.2 Bảng Rooms
**Mục đích:** Bảng Rooms lưu trữ thông tin về các phòng chiếu thuộc từng rạp.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã phòng chiếu |
| 2 | `cinema_id` | Int | | Khóa ngoại (Cinemas.id) | Mã rạp |
| 3 | `name` | Varchar | 100 | | Tên phòng chiếu |
| 4 | `capacity` | Int | | | Sức chứa của phòng |

---

### 3.9.3 Bảng Seats
**Mục đích:** Bảng Seats lưu trữ thông tin về các ghế trong từng phòng chiếu.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã ghế |
| 2 | `room_id` | Int | | Khóa ngoại (Rooms.id) | Mã phòng chiếu |
| 3 | `row` | Varchar | 10 | | Hàng ghế |
| 4 | `column_num` | Int | | | Số cột (vị trí ghế) |
| 5 | `type` | Enum | | | Loại ghế (normal/vip/couple) |
| 6 | `status` | Enum | | | Trạng thái (active/broken) |

---

### 3.9.4 Bảng Movies
**Mục đích:** Bảng Movies lưu trữ thông tin chi tiết về các bộ phim trong hệ thống.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã phim |
| 2 | `title` | Varchar | 255 | | Tên phim |
| 3 | `slug` | Varchar | 255 | Duy nhất | Đường dẫn thân thiện (SEO) |
| 4 | `description` | Text | | | Mô tả nội dung phim |
| 5 | `poster` | Varchar | 255 | | Ảnh poster |
| 6 | `banner` | Varchar | 255 | | Ảnh banner |
| 7 | `trailer_url` | Varchar | 255 | | Link trailer |
| 8 | `genre` | Varchar | 100 | | Thể loại |
| 9 | `director` | Varchar | 100 | | Đạo diễn |
| 10 | `cast_info` | Varchar | 255 | | Diễn viên |
| 11 | `duration` | Int | | | Thời lượng (phút) |
| 12 | `age_rating` | Varchar | 10 | | Độ tuổi quy định |
| 13 | `rating` | Decimal | | | Điểm đánh giá |
| 14 | `release_date`| Date | | | Ngày khởi chiếu |
| 15 | `status` | Enum | | | Trạng thái (now_showing/coming_soon/ended) |

---

### 3.9.5 Bảng Showtimes
**Mục đích:** Bảng Showtimes lưu trữ thông tin về các suất chiếu của từng phim tại các phòng chiếu.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã suất chiếu |
| 2 | `movie_id` | Int | | Khóa ngoại (Movies.id) | Mã phim |
| 3 | `room_id` | Int | | Khóa ngoại (Rooms.id) | Mã phòng chiếu |
| 4 | `start_time` | Datetime| | | Thời gian bắt đầu |
| 5 | `end_time` | Datetime| | | Thời gian kết thúc |

> Lưu ý: trước đây có cột `base_price` lưu giá riêng cho từng suất chiếu, đã được **drop** từ migration `2026_05_18_170100_drop_base_price_from_showtimes_table`. Giá vé hiện nay tra từ bảng **`pricings`** (3.9.14) theo cặp (loại ghế × loại ngày). Xem chi tiết tại `Pricing_Module_Plan.md`.

---

### 3.9.6 Bảng Users
**Mục đích:** Bảng Users lưu trữ thông tin người dùng trong hệ thống (quản trị viên và khách hàng).

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã người dùng |
| 2 | `name` | Varchar | 255 | | Tên người dùng |
| 3 | `email` | Varchar | 255 | Duy nhất | Email đăng nhập |
| 4 | `password` | Varchar | 255 | | Mật khẩu |
| 5 | `phone` | Varchar | 20 | | Số điện thoại |
| 6 | `role` | Enum | | | Vai trò (admin/customer) |
| 7 | `created_at` | Timestamp| | | Thời gian tạo tài khoản |

---

### 3.9.7 Bảng Bookings
**Mục đích:** Bảng Bookings lưu trữ thông tin đặt vé của người dùng cho các suất chiếu.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã đơn đặt vé |
| 2 | `booking_code` | Varchar | 50 | | Mã đặt vé |
| 3 | `user_id` | Int | | Khóa ngoại (Users.id) | Mã người dùng |
| 4 | `showtime_id` | Int | | Khóa ngoại (Showtimes.id)| Mã suất chiếu |
| 5 | `promotion_id`| Int | | Khóa ngoại (Promotions.id), có thể null| Mã khuyến mãi |
| 6 | `total_amount` | Decimal | | | Tổng tiền ban đầu |
| 7 | `discount_amount`| Decimal| | | Số tiền được giảm |
| 8 | `final_amount` | Decimal | | | Số tiền cuối cùng |
| 9 | `status` | Enum | | | Trạng thái (pending/paid/cancelled) |
| 10 | `created_at` | Timestamp| | | Thời gian đặt vé |

---

### 3.9.8 Bảng Tickets
**Mục đích:** Bảng Tickets lưu trữ thông tin chi tiết từng vé (tương ứng với từng ghế) trong một đơn đặt vé.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã vé |
| 2 | `booking_id` | Int | | Khóa ngoại (Bookings.id) | Mã đơn đặt vé |
| 3 | `seat_id` | Int | | Khóa ngoại (Seats.id) | Mã ghế |
| 4 | `seat_label` | Varchar | 10 | | Ký hiệu ghế (ví dụ: A1, B2) |
| 5 | `seat_type` | Varchar | 20 | | Loại ghế (normal/vip/couple) |
| 6 | `price` | Decimal | | | Giá vé |

---

### 3.9.9 Bảng Combos
**Mục đích:** Bảng Combos lưu trữ thông tin về các combo đồ ăn, thức uống (bắp, nước,...) được bán kèm khi đặt vé.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã combo |
| 2 | `name` | Varchar | 255 | | Tên combo |
| 3 | `description` | Text | | | Mô tả combo |
| 4 | `price` | Decimal | | | Giá combo |
| 5 | `image` | Varchar | 255 | | Hình ảnh combo |

---

### 3.9.10 Bảng Booking_Combos
**Mục đích:** Bảng Booking_Combos là bảng trung gian lưu trữ thông tin các combo được đặt kèm trong mỗi đơn đặt vé.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã bản ghi |
| 2 | `booking_id` | Int | | Khóa ngoại (Bookings.id) | Mã đơn đặt vé |
| 3 | `combo_id` | Int | | Khóa ngoại (Combos.id) | Mã combo |
| 4 | `quantity` | Int | | | Số lượng |
| 5 | `unit_price` | Decimal | | | Giá tại thời điểm đặt |

---

### 3.9.11 Bảng Payments
**Mục đích:** Bảng Payments lưu trữ thông tin thanh toán cho các đơn đặt vé.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã thanh toán |
| 2 | `booking_id` | Int | | Khóa ngoại (Bookings.id) | Mã đơn đặt vé |
| 3 | `method` | Enum | | | Phương thức (vnpay/momo/zalopay/counter) |
| 4 | `transaction_code` | Varchar | 100 | | Mã giao dịch |
| 5 | `amount` | Decimal | | | Số tiền thanh toán |
| 6 | `status` | Enum | | | Trạng thái (pending/success/failed) |
| 7 | `paid_at` | Timestamp| | | Thời gian thanh toán |

---

### 3.9.12 Bảng Promotions
**Mục đích:** Bảng Promotions lưu trữ thông tin các chương trình khuyến mãi/mã giảm giá áp dụng cho đơn đặt vé.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã khuyến mãi |
| 2 | `code` | Varchar | 50 | Duy nhất | Mã giảm giá |
| 3 | `discount_percent`| Int | | | Phần trăm giảm giá (%) |
| 4 | `max_discount` | Decimal | | | Số tiền giảm tối đa |
| 5 | `valid_from` | Date | | | Ngày bắt đầu áp dụng |
| 6 | `valid_to` | Date | | | Ngày kết thúc |
| 7 | `usage_limit`| Int | | | Số lần sử dụng tối đa |
| 8 | `used_count` | Int | | | Số lần đã sử dụng |

---

### 3.9.13 Bảng Banners
**Mục đích:** Bảng Banners lưu trữ thông tin các banner quảng cáo hiển thị trên trang chủ hệ thống.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã banner |
| 2 | `title` | Varchar | 255 | | Tiêu đề banner |
| 3 | `image_url` | Varchar | 255 | | Đường dẫn hình ảnh |
| 4 | `link_url` | Varchar | 255 | | Đường dẫn khi click |
| 5 | `position` | Int | | | Vị trí hiển thị |
| 6 | `is_active` | Boolean | | | Trạng thái hiển thị (true/false) |

---

### 3.9.14 Bảng Pricings
**Mục đích:** Bảng Pricings lưu trữ bảng giá vé tập trung của toàn hệ thống, thay cho `Showtimes.base_price` cũ. Mỗi suất chiếu sẽ lookup giá theo cặp `(seat_type, day_type)`.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã dòng giá |
| 2 | `seat_type` | Enum | | normal / vip / couple | Loại ghế |
| 3 | `day_type` | Enum | | weekday / weekend / holiday | Loại ngày áp dụng |
| 4 | `price` | Decimal(10,2) | | ≥ 0 | Giá vé |
| 5 | `is_active` | Boolean | | default true | Cho phép tắt 1 cell mà không cần xoá |
| 6 | `created_at` / `updated_at` | Timestamp | | | |

- **UNIQUE** `(seat_type, day_type)` — đảm bảo tối đa 9 cell (3 × 3).
- Phân loại ngày tự động trong code:
  - `holiday`: ngày khớp danh sách `config('holidays.dates')`
  - `weekend`: Thứ 7, Chủ nhật
  - `weekday`: còn lại
- Seed mặc định 9 dòng qua `PricingSeeder` (chạy `php artisan db:seed --class=PricingSeeder`).

---

### 3.9.15 Bảng Events
**Mục đích:** Bảng Events lưu trữ tin tức / ưu đãi / chương trình thành viên hiển thị trên trang chủ và trang Sự kiện. Có thể đính kèm 1 mã giảm giá để khách copy nhanh.

| STT | Trường dữ liệu | Kiểu dữ liệu | Độ dài | Ràng buộc | Mô tả |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | `id` | Int | | Khóa chính | Mã sự kiện |
| 2 | `title` | Varchar | 255 | | Tiêu đề |
| 3 | `slug` | Varchar | 255 | Duy nhất | Đường dẫn SEO |
| 4 | `description` | Text | | | Mô tả ngắn |
| 5 | `content` | Longtext | | | Nội dung chi tiết (HTML) |
| 6 | `image` | Varchar | 255 | | Ảnh đại diện |
| 7 | `category` | Enum | | promotion / member / news | Phân loại |
| 8 | `promotion_id` | Int | | Khóa ngoại (Promotions.id), nullable, onDelete=setNull | Mã giảm giá đính kèm |
| 9 | `valid_from` | Date | | nullable | Ngày bắt đầu hiển thị |
| 10 | `valid_to` | Date | | nullable | Ngày kết thúc hiển thị |
| 11 | `is_active` | Boolean | | default true | Trạng thái hiển thị |

---

### 3.9.16 Bảng Personal Access Tokens
**Mục đích:** Bảng do Laravel Sanctum tạo, lưu API token cho cơ chế đăng nhập (Bearer Token). Không can thiệp thủ công.

| STT | Trường dữ liệu | Kiểu dữ liệu | Mô tả |
| :---: | :--- | :---: | :--- |
| 1 | `id` | Int | Khóa chính |
| 2 | `tokenable_type` / `tokenable_id` | Polymorphic | Trỏ về Users |
| 3 | `name` | Varchar | Tên token |
| 4 | `token` | Varchar (hashed) | Hash của plain text token |
| 5 | `abilities` | Text | JSON các quyền |
| 6 | `last_used_at` | Timestamp | Lần dùng gần nhất |
| 7 | `expires_at` | Timestamp | Hết hạn |
| 8 | `created_at` / `updated_at` | Timestamp | |
