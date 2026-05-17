# Hướng Dẫn Test API Bằng Postman (T-CINE)

## 🔧 Chuẩn Bị

### 1. Khởi động Laravel Server
Mở Terminal trong thư mục `d:\doan\backend` và chạy:
```bash
php artisan serve
```
Server sẽ chạy tại: **`http://127.0.0.1:8000`**

### 2. Cài đặt Postman
- Tải tại: https://www.postman.com/downloads/
- Cài đặt và mở lên

### 3. Tạo Environment trong Postman
Bấm vào icon ⚙️ (Environments) → **Add** → Đặt tên `T-Cine Local` → Thêm 2 biến:

| Variable | Initial Value |
|----------|--------------|
| `base_url` | `http://127.0.0.1:8000/api` |
| `token` | *(để trống, sẽ tự động điền sau khi đăng nhập)* |

> **Lưu ý quan trọng:** Tất cả request đều cần thêm Header:
> - `Accept`: `application/json`
> - `Content-Type`: `application/json`

---

## 📋 Thứ Tự Test Từng API

### Bước 1: Test Đăng Ký (API #1)

```
POST {{base_url}}/register
```

**Body (raw JSON):**
```json
{
    "name": "Nguyen Van A",
    "email": "nguyenvana@gmail.com",
    "password": "123456",
    "password_confirmation": "123456",
    "phone": "0901234567"
}
```

**Kết quả mong đợi (201):**
```json
{
    "message": "Đăng ký thành công",
    "user": { "id": 1, "name": "Nguyen Van A", ... },
    "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

✅ **Copy giá trị `token` → Dán vào biến `token` trong Environment**

---

### Bước 2: Test Đăng Nhập (API #2)

```
POST {{base_url}}/login
```

**Body (raw JSON):**
```json
{
    "email": "nguyenvana@gmail.com",
    "password": "123456"
}
```

**Kết quả mong đợi (200):**
```json
{
    "message": "Đăng nhập thành công",
    "user": { ... },
    "token": "2|yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
}
```

✅ **Copy `token` mới → Cập nhật vào biến `token` trong Environment**

> **Mẹo tự động lưu Token:** Vào tab **Tests** của request Login, dán đoạn script sau:
> ```javascript
> var jsonData = pm.response.json();
> pm.environment.set("token", jsonData.token);
> ```
> Từ giờ mỗi lần Login, token sẽ tự động được lưu!

---

### Bước 3: Test Lấy Thông Tin User (API #4)

```
GET {{base_url}}/auth/me
```

**Authorization:**
- Type: `Bearer Token`
- Token: `{{token}}`

**Kết quả mong đợi (200):**
```json
{
    "user": { "id": 1, "name": "Nguyen Van A", "role": "customer", ... }
}
```

---

### Bước 4: Test Cập Nhật Thông Tin (API #5)

```
PUT {{base_url}}/auth/profile
```

**Authorization:** Bearer Token `{{token}}`

**Body (raw JSON):**
```json
{
    "name": "Nguyen Van B",
    "phone": "0987654321"
}
```

---

### Bước 5: Test Đổi Mật Khẩu (API #6)

```
PUT {{base_url}}/auth/change-password
```

**Authorization:** Bearer Token `{{token}}`

**Body (raw JSON):**
```json
{
    "current_password": "123456",
    "password": "654321",
    "password_confirmation": "654321"
}
```

---

### Bước 6: Tạo Tài Khoản Admin

Để test các API Admin, bạn cần tạo 1 tài khoản admin. Có 2 cách:

**Cách 1: Dùng Tinker (khuyên dùng)**
```bash
php artisan tinker
```
Sau đó gõ:
```php
App\Models\User::create(['name'=>'Admin','email'=>'admin@tcine.com','password'=>bcrypt('admin123'),'role'=>'admin']);
```

**Cách 2: Sửa trực tiếp trong phpMyAdmin**
Mở bảng `users` → Đổi cột `role` của user thành `admin`.

Sau đó **Login lại bằng tài khoản admin** để lấy Token mới.

---

## 🎬 Test API Phim (MovieController)

### API #7: Lấy danh sách phim
```
GET {{base_url}}/movies
```
*Không cần Token. Có thể thêm query params: `?status=now_showing&per_page=5`*

### API #8: Phim đang chiếu
```
GET {{base_url}}/movies/now-showing
```

### API #9: Phim sắp chiếu
```
GET {{base_url}}/movies/coming-soon
```

### API #10: Chi tiết phim
```
GET {{base_url}}/movies/1
```

### API #11: Tìm kiếm phim
```
GET {{base_url}}/movies/search?keyword=avengers
```

### API #12: [Admin] Thêm phim mới
```
POST {{base_url}}/admin/movies
```
**Authorization:** Bearer Token `{{token}}` *(phải là admin)*

**Body (raw JSON):**
```json
{
    "title": "Avengers: Endgame",
    "description": "Trận chiến cuối cùng của các siêu anh hùng.",
    "poster": "https://example.com/poster.jpg",
    "banner": "https://example.com/banner.jpg",
    "trailer_url": "https://youtube.com/watch?v=xxx",
    "genre": "Hành động, Phiêu lưu",
    "director": "Anthony Russo",
    "cast_info": "Robert Downey Jr., Chris Evans",
    "duration": 181,
    "age_rating": "T13",
    "rating": 8.4,
    "release_date": "2025-04-26",
    "status": "now_showing"
}
```

### API #13: [Admin] Cập nhật phim
```
PUT {{base_url}}/admin/movies/1
```
**Body:** `{ "title": "Avengers: Endgame (2025)", "rating": 9.0 }`

### API #14: [Admin] Xóa phim
```
DELETE {{base_url}}/admin/movies/1
```

---

## 🏢 Test API Rạp & Phòng Chiếu

### API #15: Danh sách rạp
```
GET {{base_url}}/cinemas
```

### API #18: [Admin] Thêm rạp
```
POST {{base_url}}/admin/cinemas
```
**Body:**
```json
{
    "name": "T-Cine Hà Nội",
    "address": "123 Trần Duy Hưng, Cầu Giấy",
    "city": "Hà Nội",
    "total_screens": 5
}
```

### API #21: [Admin] Thêm phòng chiếu
```
POST {{base_url}}/admin/cinemas/1/rooms
```
**Body:**
```json
{
    "name": "Phòng 1",
    "capacity": 120
}
```

---

## 📅 Test API Suất Chiếu

### API #28: [Admin] Thêm suất chiếu
```
POST {{base_url}}/admin/showtimes
```
**Body:**
```json
{
    "movie_id": 1,
    "room_id": 1,
    "start_time": "2025-06-01 14:00:00",
    "end_time": "2025-06-01 17:01:00",
    "base_price": 75000
}
```

### API #24: Lịch chiếu theo phim
```
GET {{base_url}}/movies/1/showtimes
```
*Có thể thêm: `?date=2025-06-01`*

### API #26: Chi tiết suất chiếu (kèm ghế)
```
GET {{base_url}}/showtimes/1
```

---

## 🎟️ Test API Đặt Vé

### API #31: Tạo đơn đặt vé
```
POST {{base_url}}/bookings
```
**Authorization:** Bearer Token `{{token}}`

**Body:**
```json
{
    "showtime_id": 1,
    "seat_ids": [1, 2, 3],
    "combos": [
        { "combo_id": 1, "quantity": 2 }
    ],
    "promotion_id": null
}
```

### API #32: Lịch sử đặt vé
```
GET {{base_url}}/bookings/my
```

### API #33: Chi tiết đơn
```
GET {{base_url}}/bookings/1
```

### API #34: Hủy đơn
```
PUT {{base_url}}/bookings/1/cancel
```

---

## 🍿 Test API Combo

### API #43: Danh sách combo
```
GET {{base_url}}/combos
```

### API #44: [Admin] Thêm combo
```
POST {{base_url}}/admin/combos
```
**Body:**
```json
{
    "name": "Combo Đôi",
    "description": "1 Bắp lớn + 2 Nước lớn",
    "price": 109000,
    "image": "https://example.com/combo.jpg"
}
```

---

## 🎫 Test API Khuyến Mãi

### API #47: Kiểm tra mã
```
GET {{base_url}}/promotions/check?code=GIAMGIA50
```

### API #49: [Admin] Thêm khuyến mãi
```
POST {{base_url}}/admin/promotions
```
**Body:**
```json
{
    "code": "GIAMGIA50",
    "discount_percent": 50,
    "max_discount": 100000,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 100
}
```

---

## 🖼️ Test API Banner

### API #52: Danh sách banner
```
GET {{base_url}}/banners
```

### API #54: [Admin] Thêm banner
```
POST {{base_url}}/admin/banners
```
**Body:**
```json
{
    "title": "Khuyến mãi mùa hè",
    "image_url": "https://example.com/banner.jpg",
    "link_url": "/events/summer-sale",
    "position": 1,
    "is_active": true
}
```

---

## 📊 Test API Thống Kê

### API #57: Dashboard
```
GET {{base_url}}/admin/dashboard
```

### API #58: Doanh thu
```
GET {{base_url}}/admin/revenue?from=2025-01-01&to=2025-12-31
```

### API #59: Doanh thu theo phim
```
GET {{base_url}}/admin/revenue/by-movie
```

### API #60: Doanh thu theo rạp
```
GET {{base_url}}/admin/revenue/by-cinema
```

### API #61: Thống kê vé
```
GET {{base_url}}/admin/stats/tickets
```

---

## 🔴 Các Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Cách sửa |
|------|-----------|---------|
| `401 Unauthenticated` | Chưa gửi Token hoặc Token hết hạn | Kiểm tra tab Authorization, Login lại lấy Token mới |
| `403 Forbidden` | User không phải Admin | Đăng nhập bằng tài khoản admin |
| `404 Not Found` | ID không tồn tại | Kiểm tra lại ID trong URL |
| `422 Validation Error` | Dữ liệu gửi lên sai format | Đọc `errors` trong response để biết trường nào sai |
| `500 Server Error` | Lỗi code phía server | Kiểm tra Terminal đang chạy `php artisan serve` |

---

## 💡 Thứ Tự Test Khuyến Nghị

1. ✅ **Đăng ký** → Lấy Token
2. ✅ **Đăng nhập** → Lấy Token
3. ✅ Tạo tài khoản **Admin** (Tinker) → Login Admin → Lấy Token Admin
4. ✅ [Admin] Thêm **Rạp** → Thêm **Phòng chiếu**
5. ✅ [Admin] Thêm **Phim**
6. ✅ [Admin] Thêm **Suất chiếu**
7. ✅ [Admin] Thêm **Combo**
8. ✅ [Admin] Thêm **Khuyến mãi**
9. ✅ [Customer] Xem danh sách phim, lịch chiếu, chi tiết suất chiếu
10. ✅ [Customer] **Đặt vé** (chọn ghế + combo)
11. ✅ [Customer] Xem lịch sử đặt vé
12. ✅ [Admin] Xem Dashboard, Thống kê doanh thu
