# Kế hoạch triển khai: Hệ thống Chatbot AI tư vấn phim (T-cine AI Assistant)

Tài liệu này đề xuất kế hoạch xây dựng tính năng **Chatbot AI tư vấn phim thông minh (T-cine AI Assistant)** tích hợp **Gemini API (model `gemini-1.5-flash`)**. Chatbot sẽ đóng vai trò là một trợ lý ảo am hiểu sâu sắc về rạp phim T-cine, có khả năng tư vấn phim đang/sắp chiếu, rạp chiếu, giá vé, khuyến mãi và hỗ trợ khách hàng đặt vé trực tuyến nhanh chóng với giao diện Premium UX hiện đại.

Theo định hướng tối ưu hóa bộ nhớ và tài nguyên hệ thống, **lịch sử trò chuyện sẽ được quản lý hoàn toàn ở Frontend State trong suốt một phiên làm việc** (khi reload trang hoặc đăng xuất sẽ tự động làm mới cuộc trò chuyện). Hệ thống **không lưu trữ tin nhắn vào Database**, giúp giảm tải dung lượng lưu trữ tối đa. Tính năng này được thiết kế dành riêng cho khách hàng ở giao diện Client và **hỗ trợ cho cả người dùng chưa đăng nhập lẫn đã đăng nhập**.

## User Review Required

> [!IMPORTANT]
> **Các cải tiến thiết kế tối ưu theo phản hồi từ người dùng:**
> 1. **Không lưu trữ Database**: Loại bỏ hoàn toàn bảng `chatbot_messages` và migration. Lịch sử chat được lưu trữ tạm thời trong React State ở Frontend và tự động xóa sạch khi tải lại trang (reload) hoặc đăng xuất, giúp bảo vệ dữ liệu và tối ưu hóa tài nguyên server.
> 2. **Hỗ trợ mọi khách hàng**: Chatbot hoạt động công khai. Cả khách vãng lai (chưa đăng nhập) và thành viên (đã đăng nhập) đều có thể trò chuyện tự do với trợ lý ảo T-cine AI.
> 3. **Duy trì ngữ cảnh hội thoại (Context Retention)**: Mặc dù không lưu DB, AI vẫn hiểu được các câu hỏi liên tiếp của người dùng trong một phiên nhờ việc Frontend tự động tích lũy lịch sử chat tạm thời vào mảng `history` và gửi kèm lên Backend ở mỗi request.
> 4. **Tự động cập nhật ngữ cảnh thực tế (RAG Context)**: Khi có tin nhắn gửi lên, Backend sẽ truy vấn nhanh thông tin phim đang/sắp chiếu, danh sách rạp và khuyến mãi từ DB của T-cine để làm giàu dữ liệu prompt gửi đến Gemini API.

## Proposed Changes

---

### Backend (Laravel)

#### [NEW] [ChatbotController.php](file:///d:/doan/backend/app/Http/Controllers/ChatbotController.php)
- Xây dựng Controller xử lý kết nối Gemini API:
  - `sendMessage(Request $request)`:
    - Validate dữ liệu gửi lên: `message` (bắt buộc, chuỗi văn bản) và `history` (mảng lưu lịch sử chat tạm thời dạng `[ { role: 'user'|'model', message: '...' } ]`).
    - **Truy vấn Dữ liệu Thực tế (Context RAG)**:
      * Lấy danh sách phim đang chiếu (`status = 'now-showing'`).
      * Lấy danh sách phim sắp chiếu (`status = 'coming-soon'`).
      * Lấy danh sách các cụm rạp (`Cinema::all(['name', 'address', 'city'])`).
      * Lấy danh sách khuyến mãi đang chạy (`Promotion::where('valid_from', '<=', $now)
            ->where('valid_to', '>=', $now)
            ->whereColumn('used_count', '<', 'usage_limit')
            ->get(['code', 'discount_percent', 'max_discount'])`).
    - **Định dạng Lịch sử & Prompt gửi Gemini API**:
      * Chuyển đổi mảng `history` từ client gửi lên thành cấu trúc chuẩn của Gemini API: `[ { "role": "user"|"model", "parts": [ { "text": "..." } ] } ]`.
      * Thêm tin nhắn mới của người dùng vào cuối danh sách `contents`.
      * Cấu hình tham số `systemInstruction` để định nghĩa cá tính cho AI: đóng vai là "Trợ lý ảo T-cine AI Assistant" thông minh, lịch sự, nhiệt tình; am hiểu rạp phim T-cine dựa trên JSON ngữ cảnh được cung cấp; trả lời bằng tiếng Việt tự nhiên kèm emoji sinh động; cấu trúc markdown dễ đọc.
    - **Gọi Gemini API (`gemini-1.5-flash`)**:
      * Sử dụng Laravel HTTP Client (`Http::withHeaders(...)`) gọi trực tiếp đến Google API:
        `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}`.
    - **Trả phản hồi**: Nhận văn bản từ Gemini API và trả về trực tiếp cho Frontend hiển thị mà không ghi nhận bất kỳ dữ liệu nào vào database.

#### [MODIFY] [api.php](file:///d:/doan/backend/routes/api.php)
- Import `ChatbotController`.
- Đăng ký API công khai (không qua middleware `auth:sanctum`):
  - `POST /chatbot/message` -> `ChatbotController@sendMessage`
  *(Do quản lý lịch sử tại client nên ta lược bỏ hoàn toàn 2 routes `GET /chatbot/history` và `DELETE /chatbot/history`)*.

---

### Frontend (React & SCSS)

#### [MODIFY] [chatbotApi.js](file:///d:/doan/frontend/src/api/chatbotApi.js)
- Cập nhật hàm gọi API gửi tin nhắn:
  - `sendMessage: (data) => axiosClient.post('/chatbot/message', data)`
  - Xóa bỏ các hàm `getHistory` và `clearHistory` do việc quản lý lịch sử được thực hiện trực tiếp tại React State.

#### [NEW] [ChatWidget.jsx](file:///d:/doan/frontend/src/components/common/ChatWidget/ChatWidget.jsx)
- Thiết kế component Chat bubble nổi tích hợp ở góc phải màn hình:
  - **Nút nổi (Floating Button)**: Nút tròn nổi bật (`fixed`, `bottom: 30px`, `right: 30px`), màu cam-đỏ thương hiệu phối xanh cyan công nghệ tương lai, có hiệu ứng phát sáng nhẹ (glow animation) để thu hút sự chú ý.
  - **Cửa sổ Chat (Chat Window)**: Mở rộng mượt mà khi bấm nút nổi.
    - **Header**: Tên trợ lý ảo ("T-cine AI Assistant"), trạng thái trực tuyến (chấm xanh lá), nút Xóa cuộc hội thoại (icon Thùng rác để làm trống state chat), nút Đóng cửa sổ.
    - **Message Area**: Hiển thị danh sách tin nhắn từ state.
      - Phân chia bong bóng chat rõ ràng: User (bên phải, màu gradient đỏ cam), AI (bên trái, màu xám tối glassmorphism).
      - **Markdown Parser Helper**: Tự động parse định dạng chữ in đậm `**text**`, gạch đầu dòng `-`, ngắt dòng `\n` giúp nội dung trực quan, dễ đọc.
      - **Typing Indicator**: Hiển thị hoạt họa 3 dấu chấm nhấp nháy khi chờ API phản hồi.
      - **Auto-scroll**: Tự động cuộn xuống tin nhắn mới nhất.
    - **Quick Suggestions (Gợi ý câu hỏi)**: Các câu hỏi gợi ý nhanh: "🎬 Phim nào đang hot?", "📍 Địa chỉ cụm rạp?", "🎁 Khuyến mãi hôm nay?", "🍿 Giá bắp nước?". Click vào chip sẽ tự động gửi đi.
    - **Input Form**: Ô nhập tin nhắn hỗ trợ bấm Enter để gửi nhanh.

#### [NEW] [ChatWidget.module.scss](file:///d:/doan/frontend/src/components/common/ChatWidget/ChatWidget.module.scss)
- Tạo giao diện Premium & Futuristic:
  - Sử dụng **Glassmorphism** (`backdrop-filter: blur(12px)`, viền mờ `rgba(255, 255, 255, 0.08)` trên nền tối `rgba(20, 20, 25, 0.85)`).
  - Hoạt họa mượt mà cho các hành động Hover, click mở/đóng, và tin nhắn mới xuất hiện.
  - Tối ưu hiển thị responsive hoàn hảo trên điện thoại di động (chiếm trọn chiều rộng màn hình để dễ thao tác).

#### [MODIFY] [CustomerLayout.jsx](file:///d:/doan/frontend/src/components/layout/CustomerLayout.jsx)
- Import và nhúng `<ChatWidget />` ngay sau `<Footer />` để chatbot hiển thị ở mọi trang client dành cho khách hàng.

---

## Verification Plan

### Kiểm thử Thủ công

1. **Cấu hình & Kết nối**:
   - Thêm `GEMINI_API_KEY` vào file `.env` ở backend.
   - Kiểm tra API route hoạt động tốt thông qua POSTMAN hoặc gọi trực tiếp từ client.

2. **Kiểm tra trạng thái Chưa Đăng nhập & Đã Đăng nhập**:
   - Cả khi chưa đăng nhập và đã đăng nhập, bong bóng chat đều hiển thị ở góc màn hình.
   - Thử gửi tin nhắn tư vấn ở cả 2 trạng thái. Đảm bảo AI phản hồi mượt mà và chính xác ngữ cảnh T-cine.

3. **Kiểm tra Duy trì ngữ cảnh & Reload trang**:
   - Chat with AI: "Phim hành động nào đang chiếu ở T-cine?" -> AI liệt kê danh sách phim.
   - Chat tiếp: "Rạp nào chiếu bộ phim đầu tiên bạn vừa nhắc?" -> AI phải hiểu "bộ phim đầu tiên" là gì dựa vào mảng `history` gửi lên và trả lời đúng tên rạp đang có suất chiếu phim đó.
   - F5 reload lại trang web. Mở lại chatbot và xác nhận giao diện hiển thị sạch sẽ từ đầu với tin nhắn chào mừng, không còn lịch sử cũ (đáp ứng đúng 100% yêu cầu).

4. **Kiểm tra Nút reset cuộc trò chuyện**:
   - Chat một vài câu, bấm vào biểu tượng Thùng rác trên Header của cửa sổ chat.
   - Xác nhận cửa sổ chat xóa sạch toàn bộ tin nhắn và hiển thị lại lời chào mặc định.
