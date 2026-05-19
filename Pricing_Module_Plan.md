# Module Quản lý Giá Vé Tập Trung (Pricing Module)

> Tài liệu này ghi chép quá trình thiết kế & triển khai module "Bảng giá vé" tách khỏi lịch chiếu.
> Ngày thực hiện: **18/05/2026**.

---

## 1. Vấn đề / Lý do tách module

Trước đây, mỗi `showtimes` (suất chiếu) có 1 trường `base_price` riêng. Admin phải nhập giá khi tạo từng suất chiếu, FE tự nhân hệ số (`VIP +30%`, `Couple +50%`) để tính giá cuối.

Vấn đề:
- **Lặp dữ liệu**: tạo 100 suất chiếu → nhập 100 lần. Muốn tăng/giảm giá toàn hệ thống → phải sửa N record.
- **Sai concern**: `Showtime` là "phim X chiếu rạp Y phòng Z lúc H giờ" — không nên là nơi quyết định giá. Giá là chính sách kinh doanh.
- **Không phân biệt được Ngày thường / Cuối tuần / Lễ Tết**: rạp thật thường tăng giá vào cuối tuần & lễ — schema cũ không cho phép.
- **Khó hiển thị legend giá cho khách**: FE phải tự tính, không đồng nhất.

→ **Quyết định**: tách thành bảng `pricings` toàn cục (9 dòng = 3 loại ghế × 3 loại ngày), có 1 trang quản lý riêng.

---

## 2. Thiết kế CSDL

### Bảng `pricings` (mới)

| STT | Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|---|
| 1 | `id` | Int | Khóa chính | |
| 2 | `seat_type` | Enum | `normal/vip/couple` | Loại ghế |
| 3 | `day_type` | Enum | `weekday/weekend/holiday` | Loại ngày |
| 4 | `price` | Decimal(10,2) | ≥ 0 | Giá vé |
| 5 | `is_active` | Boolean | default true | Bật/tắt áp dụng |
| 6 | `created_at` / `updated_at` | Timestamp | | |

- **UNIQUE** `(seat_type, day_type)` — đảm bảo mỗi cell chỉ có 1 record.
- Logic phân loại ngày trong `Pricing::classifyDayType()`:
  - `holiday`: ngày nằm trong `config('holidays.dates')` (mảng ISO date strings)
  - `weekend`: Thứ 7 hoặc Chủ nhật
  - `weekday`: còn lại

### Bảng `showtimes` (sửa)

- **DROP** cột `base_price` (migration `2026_05_18_170100_drop_base_price_from_showtimes_table.php`).
- Schema mới: `id, movie_id, room_id, start_time, end_time, timestamps`.

### Seed mặc định

`PricingSeeder` chạy `updateOrCreate` 9 dòng:

| Loại ghế | Ngày thường | Cuối tuần | Lễ Tết |
|---|---|---|---|
| Thường | 70,000 đ | 90,000 đ | 110,000 đ |
| VIP | 100,000 đ | 130,000 đ | 160,000 đ |
| Đôi | 160,000 đ | 200,000 đ | 250,000 đ |

---

## 3. API mới (Backend Laravel)

### Public

| # | Method | Endpoint | Mô tả |
|---|---|---|---|
| 73 | GET | `/api/pricings/active` | Trả về bảng giá hiện hành dạng matrix `{ normal: {weekday, weekend, holiday}, vip: ..., couple: ... }` |

### Admin

| # | Method | Endpoint | Mô tả |
|---|---|---|---|
| 74 | GET | `/api/admin/pricings` | Trả về `data` (array 9 rows) + `matrix` (nested object) |
| 75 | PUT | `/api/admin/pricings` | Body `{ items: [{seat_type, day_type, price, is_active}, ...] }` — upsert hàng loạt cell, transaction |

### Tham chiếu trong các API hiện có

- `GET /api/showtimes/{id}` — bỏ `base_price`, thêm:
  - `data.showtime.day_type` (string: weekday/weekend/holiday)
  - `data.prices: { normal, vip, couple }` (giá đã resolve theo ngày suất chiếu)
  - mỗi `data.seats[].price` (giá tính sẵn cho ghế đó)
- `GET /api/movies/{movieId}/showtimes` — bỏ `base_price`, thêm `from_price` (giá ghế thường = giá tham khảo "từ X VND")
- `POST /api/bookings` — không nhận `base_price` từ client, server tự `Pricing::resolve(seat_type, showtime.start_time)` cho mỗi ghế.

---

## 4. File backend đã chỉnh sửa

### Thêm mới

- `backend/database/migrations/2026_05_18_170000_create_pricings_table.php`
- `backend/database/migrations/2026_05_18_170100_drop_base_price_from_showtimes_table.php`
- `backend/app/Models/Pricing.php` — Eloquent model + 3 helper:
  - `Pricing::classifyDayType($dateTime): string`
  - `Pricing::resolve(string $seatType, $startTime): float`
  - `Pricing::asMatrix(): array`
- `backend/database/seeders/PricingSeeder.php`
- `backend/app/Http/Controllers/Admin/PricingController.php` (index, bulkUpdate)
- `backend/app/Http/Controllers/PricingController.php` (active)

### Sửa

- `backend/app/Models/Showtime.php` — bỏ `base_price` khỏi `$fillable`.
- `backend/app/Http/Controllers/Admin/ShowtimeController.php` — bỏ validation `base_price` trong `store/update`.
- `backend/app/Http/Controllers/ShowtimeController.php`:
  - `byMovie`: trả `from_price` thay vì `base_price`.
  - `show`: trả `day_type`, `prices` (map theo loại ghế), và `seats[].price`.
- `backend/app/Http/Controllers/BookingController.php` — dùng `Pricing::resolve()` thay cho `$showtime->base_price * 1.3/1.5`.
- `backend/routes/api.php` — đăng ký 3 route mới (`/pricings/active`, `/admin/pricings` GET & PUT).

---

## 5. File frontend đã chỉnh sửa

### Thêm mới

- `frontend/src/api/pricingApi.js` — 3 method `getActive / adminGetAll / adminBulkUpdate`.
- `frontend/src/pages/admin/PricingManagePage/PricingManagePage.jsx`
- `frontend/src/pages/admin/PricingManagePage/PricingManagePage.module.scss`

### Sửa

- `frontend/src/routes/adminRoutes.jsx` — thêm route `/admin/gia-ve` → `PricingManagePage`.
- `frontend/src/components/layout/Sidebar/Sidebar.jsx` — thêm menu "Bảng giá vé" (icon `MdAttachMoney`), đặt sau "Lịch chiếu".
- `frontend/src/pages/admin/ShowtimeManagePage/ShowtimeManagePage.jsx`:
  - Bỏ trường `base_price` khỏi form, state, payload, bảng hiển thị.
  - Thay `window.alert / window.confirm` bằng `notify / confirmDialog`.
  - Thêm hint "Giá vé lấy tự động từ Bảng giá vé".
- `frontend/src/pages/customer/BookingPage/SeatSelectionPage.jsx`:
  - Lưu `prices` từ response BE (`d.prices`).
  - Legend hiển thị giá kèm loại ghế: "Standard (70.000đ) / VIP (100.000đ) / Couple (160.000đ)".
- `frontend/src/store/useBookingStore.js`:
  - `toggleSeat`: thay vì tự nhân hệ số, **tin server-side** `seat.price` đã được resolve.

---

## 6. Luồng end-to-end mới

### Admin

1. Vào sidebar **"Bảng giá vé"** (`/admin/gia-ve`).
2. Sửa 9 ô giá (3 loại ghế × 3 loại ngày). Có cảnh báo nếu VIP < Thường hoặc Đôi < VIP.
3. Bấm **"Lưu bảng giá"** → toast thành công.

### Khách hàng

1. Vào chi tiết phim, chọn suất → đến `/chon-ghe/:showtimeId`.
2. BE đã lookup giá theo `start_time` (xác định day_type) và trả về:
   - `seats[].price` đã đúng
   - `prices: { normal, vip, couple }` để FE hiển thị legend
3. Click ghế → store lưu `price` từ BE, KHÔNG tự tính.
4. Khi `POST /api/bookings`, BE tính lại từ pricings (không tin price client gửi).

---

## 7. Migration & Seed

```bash
cd backend
php artisan migrate              # chạy 2 migration mới
php artisan db:seed --class=PricingSeeder
```

Output thực tế:

```
2026_05_18_170000_create_pricings_table .................. ~130ms DONE
2026_05_18_170100_drop_base_price_from_showtimes_table .... ~74ms DONE
Seeding database. (9 rows pricings)
```

---

## 8. Trade-offs & Mở rộng tương lai

| Hiện tại | Trade-off |
|---|---|
| 9 dòng cố định, không thêm/xoá | Đơn giản, đủ dùng cho rạp đa số. |
| Holiday hard-code qua `config('holidays.dates')` | Khi cần dynamic → tạo bảng `holidays(date, name)` quản lý qua admin. |
| Không có giá theo rạp / phòng | Khi rạp VIP có giá riêng → thêm `cinema_id` nullable + ưu tiên cinema-specific row. |
| Không có giá theo khung giờ | Khi cần (matinee giá thấp, evening giá cao) → thêm `time_slot` enum. |
| Không lưu lịch sử giá | Lúc cần audit/báo cáo → tạo bảng `pricing_history` snapshot. |

---

## 9. Checklist QA sau khi triển khai

- [x] Migration chạy thành công, bảng `pricings` có 9 dòng, `showtimes.base_price` đã drop.
- [x] `/admin/gia-ve` hiển thị đúng 9 giá, sửa & lưu OK.
- [x] `/admin/lich-chieu`: form không còn ô "Giá vé mặc định", bảng list không cột giá.
- [x] Tạo lịch chiếu mới không cần nhập giá, vẫn thành công.
- [x] Trang chọn ghế: legend hiển thị giá theo ngày suất chiếu (T2-T6 / T7-CN / Lễ).
- [x] Đặt vé: số tiền tổng đúng = sum của `seats[].price` từ BE.
- [x] Đổi giá trong admin → khách hàng vào trang chọn ghế thấy giá mới ngay (không cần redeploy).
- [ ] *(Optional)* Test booking với showtime vào ngày Lễ — cần thêm date vào `config/holidays.php`.

---

## 10. Tài liệu liên quan

- `csdl.md` — đã cập nhật bảng `Pricings` và bỏ `base_price` khỏi `Showtimes`.
- `task.md` — đã thêm API #73-75 vào section 5.14 "API Bảng giá vé" và đánh dấu phase mới.
