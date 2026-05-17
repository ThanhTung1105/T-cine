# Kế Hoạch Xây Dựng API Xác Thực (Authentication)

Để xây dựng hệ thống đăng nhập/đăng ký bằng API cho ứng dụng React (Frontend), chúng ta sẽ sử dụng công cụ chuẩn nhất của Laravel hiện nay là **Laravel Sanctum**. Công cụ này giúp tạo ra các *Token* bảo mật cho từng User khi đăng nhập.

## ⚠️ Cần Bạn Phê Duyệt

Dưới đây là các bước mình sẽ thực hiện. Bạn xem qua và nếu đồng ý hãy phản hồi "Duyệt" nhé:

### 1. Cài đặt API và Sanctum cho Laravel 11
Trong bản Laravel 11 mới nhất, file route API không có sẵn mặc định. Mình sẽ:
- Chạy lệnh `php artisan install:api` để cài đặt **Laravel Sanctum** và tự động tạo ra file `routes/api.php`.

### 2. Xây Dựng AuthController
Mình sẽ tạo file `app/Http/Controllers/AuthController.php` chứa 3 tính năng chính:

- **Đăng Ký (`register`):**
  - Nhận vào: `name`, `email`, `password`, `phone`.
  - Validate (kiểm tra) dữ liệu đầu vào.
  - Băm mật khẩu (Hash) và lưu vào Database.
  - Tự động gán quyền (`role` = 'customer').
  - Trả về thông tin User kèm *Access Token*.

- **Đăng Nhập (`login`):**
  - Nhận vào: `email`, `password`.
  - So khớp mật khẩu với cơ sở dữ liệu.
  - Trả về thông tin User kèm *Access Token*.

- **Đăng Xuất (`logout`):**
  - Thu hồi (xóa) Token hiện tại của User đó để khóa phiên đăng nhập.

### 3. Cấu hình Routes (API Endpoints)
Mình sẽ định nghĩa các link API trong `routes/api.php` để Frontend React sau này có thể gọi tới:
- `POST /api/register`: Link đăng ký.
- `POST /api/login`: Link đăng nhập.
- `POST /api/logout`: Link đăng xuất (yêu cầu gửi kèm Token để xác thực).

---
*Ghi chú: Việc xác thực này sẽ dùng Bearer Token chuẩn mực để ghép nối hoàn hảo với trạng thái Zustand bên Frontend React của bạn.*
