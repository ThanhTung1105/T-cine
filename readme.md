# 🎬 T-CINE: HỆ THỐNG QUẢN LÝ VÀ ĐẶT VÉ XEM PHIM TRỰC TUYẾN TÍCH HỢP TRỢ LÝ ẢO AI

> Một giải pháp công nghệ toàn diện cho kỷ nguyên rạp chiếu phim số, kết hợp giữa nền tảng đặt vé trực tuyến mượt mà, hệ thống quản trị mạnh mẽ và trợ lý ảo tư vấn thông minh sử dụng mô hình ngôn ngữ lớn (LLM).

---

## 📌 MỤC LỤC
1. [Tổng Quan Dự Án](#-tổng-quan-dự-án)
2. [Các Phân Hệ Chính & Điểm Nhấn Công Nghệ](#-các-phân-hệ-chính--điểm-nhấn-công-nghệ)
3. [Kiến Trúc & Công Nghệ Sử Dụng](#-kiến-trúc--công-nghệ-sử-dụng)
4. [Đặc Trưng Nổi Bật Của Đề Tài](#-đặc-trưng-nổi-bật-của-đề-tài)

---

## 📌 TỔNG QUAN DỰ ÁN

Ngày nay, nhu cầu giải trí thông qua nghệ thuật thứ bảy ngày càng phát triển mạnh mẽ. Tuy nhiên, việc mua vé trực tiếp tại quầy truyền thống thường làm mất nhiều thời gian xếp hàng và khiến khách hàng khó chủ động chọn được vị trí ngồi ưng ý.

Để giải quyết vấn đề này, đề tài **T-CINE — "Hệ thống quản lý và đặt vé xem phim trực tuyến tích hợp Trợ lý ảo AI"** được phát triển nhằm mang đến một giải pháp công nghệ toàn diện. Hệ thống không chỉ cung cấp cho khách hàng một giao diện đặt vé trực quan thời gian thực, mà còn đem lại cho ban quản trị rạp một bảng điều khiển vững chắc để kiểm soát tối ưu mọi hoạt động vận hành, xếp lịch chiếu, định giá vé và quản lý doanh thu điện ảnh.

---

## 🌟 CÁC PHÂN HỆ CHÍNH & ĐIỂM NHẤN CÔNG NGHỆ

### 1. Phân Hệ Khách Hàng (Customer Portal)
* **Luồng đặt vé 3 bước tối giản**: Giao diện chọn rạp $\rightarrow$ ngày chiếu $\rightarrow$ suất chiếu được thiết kế mượt mà, có chỉ số bước trực quan và tự động mở khóa theo dạng slide-down khi hoàn thành bước trước.
* **Sơ đồ chọn ghế tương tác thời gian thực**: Trải nghiệm chọn ghế standard, VIP hoặc ghế đôi (couple) mượt mà trên sơ đồ phòng chiếu. Trạng thái ghế trống, ghế đang chọn, ghế đã được đặt hoặc ghế bảo trì được cập nhật trực quan và chính xác.
* **Cổng thanh toán giả lập thông minh**: Hỗ trợ tích hợp chọn các phương thức thanh toán phổ biến như VNPAY, MoMo, ZaloPay. Giao diện trang thanh toán đi kèm bộ đếm ngược 5 phút bảo vệ vé vô cùng chuyên nghiệp.
* **Hồ sơ thành viên & Lịch sử đặt vé**: Cho phép người dùng theo dõi lịch sử giao dịch chi tiết, trạng thái hóa đơn (Đã thanh toán/Chờ thanh toán/Đã hủy) và tiếp tục thanh toán cho các đơn hàng chưa hết hạn (trong vòng 5 phút từ lúc khởi tạo).

### 2. Phân Hệ Quản Trị (Admin Control Panel)
* **Bảng điều khiển thống kê (Interactive Dashboard) [Thiết Kế Mới]**:
  * Giao diện hiện đại loại bỏ hoàn toàn các cấu phần thừa (như biểu đồ doanh thu theo ngày và đơn đặt vé gần đây).
  * **Top 10 phim theo doanh thu**: Hiển thị dưới dạng bảng rộng toàn màn hình (full-width) giúp ban quản lý có góc nhìn trực quan nhất về hiệu quả chiếu phim.
  * **Xếp hạng doanh thu theo Cụm rạp (Cinema Revenue Leaderboard)**: Trực quan hóa thị phần doanh thu giữa các cụm rạp thông qua các thanh tiến trình (progress bars) màu xanh dương đậm chất điện ảnh.
  * **Tỷ lệ vé bán ra theo Loại ghế (Seat Type Stats)**: Phân tích cơ cấu ghế bán ra (Standard, VIP, Couple) bằng các thanh tỉ lệ màu sắc tương ứng.
  * **Bộ lọc Date-Range thông minh**: Lọc số liệu linh hoạt theo khoảng thời gian (`from` - `to`), tự động bỏ qua các tham số rỗng thông qua cơ chế `$request->filled()` của Laravel để tránh lỗi truy vấn.
* **Quản lý Giá vé & Phụ thu Định dạng (Pricing & Surcharge Matrix)**:
  * Quản lý giá vé tập trung qua ma trận giao thoa 3x3 giữa loại ghế (Thường/VIP/Đôi) và loại ngày chiếu (Ngày thường/Cuối tuần/Ngày Lễ).
  * **Phụ thu theo định dạng chiếu**: Tích hợp cột `surcharge` trong bảng định dạng chiếu (như 2D, 3D, IMAX). Giá vé cuối cùng của khách hàng sẽ tự động cộng thêm phần phụ thu định dạng này một cách linh hoạt.
* **Quy trình kiểm soát thời gian dọn phòng (Showtime Cleaning Buffer)**:
  * Để tránh việc suất chiếu sau đè lên suất chiếu trước, hệ thống quy định thời gian dọn dẹp tối thiểu là **15 phút** (cấu hình qua biến `SHOWTIME_CLEANING_DURATION` trong file `.env`).
  * Backend tự động tính toán thời gian kết thúc của suất chiếu trước (thời lượng phim + 15 phút dọn dẹp) và so sánh với giờ bắt đầu của suất chiếu tiếp theo trên cùng một phòng để đưa ra thông báo cảnh báo chi tiết nếu bị trùng lặp.
  * Frontend trang quản lý suất chiếu hiển thị dòng nhắc nhở màu sắc nổi bật để hỗ trợ Admin điều hành lịch chiếu chính xác.
* **Trình thiết kế sơ đồ ghế tự động (Dynamic Seat Designer)**: Admin chỉ cần nhập bố cục số hàng (1-26, tương ứng A-Z) $\times$ số cột (1-30), hệ thống tự động sinh sơ đồ ghế. Đặc biệt, hàng ghế đôi tự động chia đôi số lượng ghế vật lý để giữ thẳng hàng trên sơ đồ và kiểm soát an toàn sức chứa thực tế.
* **Quản lý Phim & Sự kiện nổi bật**: Quản lý thông tin chi tiết phim (poster, trailer, diễn viên, thể loại) và sự kiện (tin tức, ưu đãi đính kèm voucher). Hệ thống Backend giới hạn tối đa 4 mục nổi bật ngoài trang chủ và tự động kích hoạt cơ chế Smart Autofill ở Frontend để làm đầy giao diện nếu thiếu cấu hình.

### 3. Trợ Lý Ảo AI Tư Vấn Thông Minh (Gemini AI Assistant)
* **Mô hình AI hiện đại**: Tích hợp trực tiếp công nghệ **Gemini 2.5-Flash API** với tốc độ phản hồi cực nhanh và khả năng hiểu ngữ cảnh tự nhiên tốt.
* **Trí tuệ nhân tạo đọc hiểu dữ liệu (RAG Context)**: AI không trả lời lý thuyết chung chung mà trực tiếp truy vấn dữ liệu thời gian thực từ cơ sở dữ liệu (danh sách Phim đang chiếu, Lịch chiếu sắp tới, Menu bắp nước, Mã khuyến mãi, Vị trí rạp còn vé) để tư vấn chính xác nhất cho người dùng.
* **Bộ lọc bảo mật dữ liệu tuyệt đối (Security Sandboxing)**: Thiết lập bộ nguyên tắc phân loại an toàn thông tin nghiêm ngặt đặt tại `backend/thong_tin_AI.md`. Hệ thống chặn hoàn toàn mọi nỗ lực khai thác thông tin cá nhân của người dùng khác, thông tin hóa đơn hoặc doanh thu nội bộ rạp chiếu của AI.

### 4. Cơ Chế Tự Động Giải Phóng Ghế Kẹt (Lazy Cleanup)
* Giải quyết triệt để bài toán giữ chỗ ảo làm kẹt ghế trên hệ thống.
* Cơ chế **Lazy Cleanup** tự động quét và hủy toàn bộ các đơn hàng `pending` đã quá hạn 5 phút mỗi khi có khách truy cập xem lịch chiếu hoặc đặt vé mới. Hệ thống giải phóng ghế ngay lập tức mà không cần cấu hình Cron Job máy chủ phức tạp.

### 5. Hệ Thống Validation 2 Lớp & Trải Nghiệm Premium UX
* **Frontend**: Vô hiệu hóa hoàn toàn các thông báo bong bóng mặc định thô sơ của trình duyệt bằng `noValidate`. Tự động quản lý lỗi qua State, hiển thị cảnh báo viền đỏ `.inputErrorGlobal` kèm chữ đỏ cảnh báo lỗi `.errorTextGlobal` tinh tế dưới từng ô nhập liệu bị trống hoặc sai định dạng.
* **Backend**: Áp dụng quy chế kiểm tra dữ liệu nghiêm ngặt trên Laravel Controller (chốt chặn cuối cùng chống inject, postman request lỗi). Toàn bộ 115+ rule và tên thuộc tính dữ liệu đều được Việt hóa toàn diện tại `lang/vi/validation.php`.
* **Hộp thoại tương tác Premium**: Loại bỏ 100% các hàm `alert` và `window.confirm` cổ điển, nâng cấp hoàn toàn sang hệ thống thông báo Toast (thành công/lỗi) và Confirm Dialog tùy biến tinh xảo.

---

## 💻 CÔNG NGHỆ SỬ DỤNG & KIẾN TRÚC HỆ THỐNG

### 1. Kiến Trúc Frontend (Client-side)
* **Core**: React JS (Vite) — Tốc độ biên dịch cực nhanh, cấu trúc component tái sử dụng cao.
* **Styling**: Vanilla SCSS / SASS — Tổ chức CSS theo cấu trúc module độc lập, tránh ghi đè class, sử dụng biến màu, font và thiết kế responsive thích ứng mọi màn hình.
* **State Management**: Zustand — Bộ quản lý trạng thái mượt mà, lưu trữ dữ liệu người dùng và thông tin đặt vé thông qua Persist Storage.
* **Routing**: React Router DOM — Quản lý định tuyến trang, thiết lập `ProtectedRoute` phân quyền chặt chẽ giữa khách hàng và quản trị viên.

### 2. Kiến Trúc Backend (Server-side)
* **Core**: Laravel Framework (PHP 8.2+) — Hỗ trợ xây dựng RESTful API chuẩn mực, xử lý logic nghiệp vụ và bảo mật dữ liệu an toàn.
* **Authentication**: Laravel Sanctum — Cấp phát Token bảo mật và mã hóa phiên đăng nhập cho người dùng.
* **Database**: MySQL — Thiết kế tối ưu hóa 24 bảng dữ liệu, cấu hình khóa ngoại, các ràng buộc toàn vẹn dữ liệu (Cascade Delete, Null On Delete) giúp duy trì tính ổn định của luồng nghiệp vụ.
* **AI Integration**: Gemini HTTP Client Integration — Giao tiếp trực tiếp bằng API Key an toàn trên máy chủ.


## 💎 ĐẶC TRƯNG NỔI BẬT CỦA ĐỀ TÀI

* **Thiết kế Đậm Chất Điện Ảnh**: Giao diện mang hơi hướng Glassmorphism hiện đại, phối màu chủ đạo đen - neon dạ quang sang trọng, tạo cảm giác vô cùng cao cấp ngay từ cái nhìn đầu tiên.
* **Khả Năng Chịu Lỗi Cao**: Hệ thống xử lý mượt mà các tình huống xung đột giờ chiếu của suất chiếu, kiểm soát không cho phép đặt ghế quá sức chứa phòng, tự động đồng bộ múi giờ cục bộ địa phương (Asia/Ho_Chi_Minh).
* **Tính Thực Tiễn & Sẵn Sàng Thương Mại**: Dự án được xây dựng bám sát quy trình hoạt động của các cụm rạp lớn hiện nay (CGV, Lotte, Galaxy), sẵn sàng tích hợp các dịch vụ thanh toán thật để đưa vào vận hành thương mại.

---

*T-CINE — Nơi công nghệ điện ảnh chạm tới đỉnh cao trải nghiệm số.*
