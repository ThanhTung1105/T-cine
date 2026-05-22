# Hướng Dẫn & Tài Liệu: Phạm Vi Đọc Dữ Liệu Của Chatbot AI (T-cine AI)

Tài liệu này xác định chi tiết phạm vi truy cập dữ liệu của **Trợ lý ảo T-cine AI Assistant** đối với **24 bảng** trong hệ thống cơ sở dữ liệu (MySQL) của rạp phim T-cine. 

Mục tiêu là đảm bảo AI cung cấp thông tin chính xác, nhanh chóng và **tuyệt đối an toàn về bảo mật dữ liệu khách hàng & hệ thống**.

---

## 1. Phân Loại Toàn Bộ 24 Bảng Dữ Liệu

### NHÓM 1: Bảng Dữ Liệu AI ĐƯỢC PHÉP ĐỌC (Công khai & Nghiệp vụ) ✅
Đây là các bảng chứa thông tin nghiệp vụ rạp chiếu phim công cộng. AI cần truy cập các dữ liệu này để trả lời câu hỏi của khách hàng một cách chính xác nhất.

| Tên Bảng | Vai Trò & Thuộc Tính AI Đọc | Lý Do Sử Dụng |
| :--- | :--- | :--- |
| `movies` | Chi tiết phim: Tên phim, thể loại, thời lượng, đạo diễn, đánh giá, trạng thái (`now_showing`, `coming_soon`). | Tư vấn cho khách hàng về danh sách phim đang chiếu và sắp chiếu. |
| `cinemas` | Chi tiết cụm rạp: Tên cụm rạp, địa chỉ, thành phố. | Hướng dẫn khách hàng tìm rạp chiếu phim gần nhất. |
| `pricings` | Bảng giá vé: Giá theo loại ghế (Thường, VIP, Đôi) và loại ngày (Ngày thường, Cuối tuần, Ngày lễ). | Trả lời chính xác thắc mắc về giá vé của rạp. |
| `promotions` | Mã giảm giá, phần trăm giảm giá, ngày hết hạn. | Giới thiệu các mã khuyến mãi có hiệu lực để khách đặt vé. |
| `events` | Sự kiện, tin tức rạp chiếu, bài viết ưu đãi. | Cung cấp thông tin về các chương trình đồng giá, sự kiện hot. |
| `combos` | Danh sách bắp nước: Tên combo bắp nước, giá tiền, mô tả combo. | Tư vấn giá bắp nước và các gói combo đi kèm khi xem phim. |
| `showtimes` | Lịch chiếu phim: Giờ bắt đầu, ngày chiếu, phòng chiếu. | Trả lời khách hàng về giờ chiếu cụ thể của từng phim tại các rạp. |
| `rooms` | Thông tin phòng chiếu (Tên phòng, sức chứa). | Kết hợp với Suất chiếu để AI chỉ rõ phim chiếu ở phòng nào. |
| `seats` | Cấu trúc các loại ghế (Thường, VIP, Đôi). | AI đọc để hiểu các cấu trúc ghế ngồi của rạp. (Không nạp danh sách ghế chi tiết để tránh nặng tải). |
| `banners` | Banner quảng cáo trang chủ. | Hỗ trợ AI biết thêm các thông tin khuyến mãi nổi bật đang trượt trên banner (tùy chọn). |

---

### NHÓM 2: Bảng Dữ Liệu AI TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỌC (Riêng tư & Bảo mật) ❌
Đây là các bảng chứa thông tin nhạy cảm của khách hàng, tài chính, giao dịch và token bảo mật. **AI tuyệt đối không được truy cập trực tiếp các bảng này** để ngăn chặn nguy cơ rò rỉ dữ liệu hoặc bị tấn công qua Prompt Injection.

| Tên Bảng | Loại Dữ Liệu Nhạy Cảm | Nguy Cơ Nếu Để AI Đọc |
| :--- | :--- | :--- |
| `users` | Thông tin cá nhân, email, số điện thoại, mật khẩu băm, vai trò của khách hàng và admin. | **Cực kỳ nguy hiểm**: Lộ thông tin cá nhân khách hàng, tài khoản quản trị viên. |
| `password_reset_tokens` | Mã token dùng để khôi phục mật khẩu tài khoản. | Kẻ xấu có thể lợi dụng AI để chiếm đoạt tài khoản người dùng khác. |
| `personal_access_tokens` | Các token đăng nhập API hệ thống (Laravel Sanctum). | Rò rỉ mã token truy cập hệ thống bất hợp pháp. |
| `payments` | Mã giao dịch, số tiền thanh toán, trạng thái thanh toán, cổng thanh toán. | Tiết lộ doanh thu nhạy cảm và thông tin tài chính của rạp. |
| `bookings` | Chi tiết lịch sử giao dịch đặt vé của từng tài khoản khách hàng. | Vi phạm quyền riêng tư nghiêm trọng khi tiết lộ ai đã đặt vé gì, khi nào, bao nhiêu tiền. |
| `booking_combos` | Số lượng bắp nước cụ thể đã được đặt theo từng đơn hàng. | Lộ thông tin đơn hàng cá nhân của khách hàng. |
| `tickets` | Vị trí ghế ngồi cụ thể đã được đặt trên từng vé của khách hàng. | Lộ sơ đồ vị trí ngồi cụ thể của từng cá nhân. |

---

### NHÓM 3: Bảng Kỹ Thuật & Vận Hành (AI Không Cần Đọc) ⚙️
Các bảng này chứa thông tin cấu trúc lập trình và hàng đợi vận hành của framework Laravel. Chúng không có giá trị nghiệp vụ tư vấn khách hàng, nạp vào sẽ gây lãng phí chi phí API (Token) và gây nhiễu cho AI.

*   `sessions`: Quản lý các phiên làm việc của người dùng trên trình duyệt.
*   `cache` & `cache_locks`: Quản lý bộ nhớ đệm tạm thời của hệ thống.
*   `jobs`, `job_batches`, `failed_jobs`: Quản lý hàng đợi tác vụ chạy nền (Queue).
*   `migrations`: Nhật ký thay đổi cấu trúc bảng cơ sở dữ liệu.

---

## 2. Giải Pháp Triển Khai Kỹ Thuật Trong Backend (Laravel)

Để đảm bảo quy tắc trên được thực thi triệt để, trong file `ChatbotController.php`, ta **chỉ import các Model an toàn** và **chỉ select các trường thông tin cần thiết**. 

Dưới đây là sơ đồ luồng dữ liệu ngữ cảnh (Context RAG) được truyền tải cho AI:

```mermaid
graph TD
    subgraph Database T-cine (MySQL)
        movies[movies table]
        cinemas[cinemas table]
        pricings[pricings table]
        promotions[promotions table]
        events[events table]
        combos[combos table]
        showtimes[showtimes table]
        
        users[users table]
        payments[payments table]
        bookings[bookings table]
    end

    subgraph ChatbotController
        fetch[Truy vấn dữ liệu an toàn & Chuyển JSON]
        prompt[Lắp ráp prompt & systemInstruction]
    end

    subgraph Google Gemini API
        gemini[Mô hình AI phản hồi]
    end

    movies -->|✅ Đọc| fetch
    cinemas -->|✅ Đọc| fetch
    pricings -->|✅ Đọc| fetch
    promotions -->|✅ Đọc| fetch
    events -->|✅ Đọc| fetch
    combos -->|✅ Đọc| fetch
    showtimes -->|✅ Đọc| fetch

    users -.->|❌ BỊ CHẶN TUYỆT ĐỐI| ChatbotController
    payments -.->|❌ BỊ CHẶN TUYỆT ĐỐI| ChatbotController
    bookings -.->|❌ BỊ CHẶN TUYỆT ĐỐI| ChatbotController

    fetch --> prompt
    prompt -->|Gửi Context + Lịch sử Chat| gemini
    gemini -->|Trả câu trả lời an toàn| client[Ứng dụng Frontend]
```

### Cách thức tích hợp Suất chiếu & Combo Bắp nước:
1. **Combo Bắp Nước (`combos`)**:
   ```php
   // Lấy danh sách bắp nước và giá để AI nắm bắt được thực đơn concessions
   $combos = Combo::all(['name', 'description', 'price']);
   ```
2. **Suất Chiếu (`showtimes`)**:
   ```php
   // Truy vấn lịch chiếu từ đầu ngày hôm qua (để hiển thị cả dữ liệu test)
   $now = Carbon::now();
   $showtimes = Showtime::with(['movie', 'room.cinema'])
       ->where('start_time', '>=', $now->copy()->subDays(1)->startOfDay())
       ->get()
       ->map(function ($s) {
           return [
               'movie' => $s->movie->title,
               'cinema' => $s->room->cinema->name,
               'room' => $s->room->name,
               'start_time' => Carbon::parse($s->start_time)->format('H:i d/m/Y'),
           ];
       });
   ```

---

## 3. Quy Tắc Ứng Xử Của AI Về Tính Riêng Tư & Bảo Mật

*   **Tuyệt đối bảo mật**: AI không được trả lời bất kỳ câu hỏi nào liên quan đến thông tin cá nhân khách hàng, mật khẩu, đơn hàng của người khác, hoặc thông tin doanh thu của rạp.
*   **Từ chối khéo léo**: Khi nhận câu hỏi vi phạm bảo mật (Ví dụ: *"Cho tôi biết số điện thoại của admin"* hoặc *"Vé số #123 là của ai?"*), AI sẽ trả lời theo mẫu:
    > *"Xin lỗi, vì lý do bảo mật thông tin khách hàng, em không thể cung cấp dữ liệu này. Nếu anh/chị cần hỗ trợ kiểm tra thông tin đặt vé cá nhân, xin vui lòng đăng nhập vào tài khoản và truy cập phần **Lịch sử đặt vé** hoặc liên hệ trực tiếp tổng đài chăm sóc khách hàng của T-cine nhé! 🍿"*
