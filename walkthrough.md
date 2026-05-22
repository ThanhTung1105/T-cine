# Kết quả hoàn thiện: Hệ thống Chatbot AI tư vấn phim (T-cine AI Assistant)

Tài liệu này ghi nhận kết quả triển khai toàn diện tính năng **Chatbot AI tư vấn phim thông minh (T-cine AI Assistant)** sử dụng **Gemini API (`gemini-1.5-flash`)**. Hệ thống đã được thiết lập hoàn hảo với cơ chế quản lý lịch sử theo phiên tại Client State, tối ưu tài nguyên tối đa (không cần lưu cơ sở dữ liệu), và mở rộng cho tất cả khách hàng (cả khách vãng lai chưa đăng nhập và đã đăng nhập đều dùng được).

---

## 🛠️ Các thay đổi đã thực hiện

### 1. Backend (Laravel)

* **[NEW] [ChatbotController.php](file:///d:/doan/backend/app/Http/Controllers/ChatbotController.php)**:
  * Xây dựng controller tiếp nhận tin nhắn (`message`) và mảng lịch sử trò chuyện tạm thời (`history`) từ Client gửi lên.
  * Tích hợp cơ chế **Retrieval-Augmented Generation (RAG)**: Tự động truy vấn dữ liệu thực tế tại thời điểm thực từ Database của T-cine bao gồm:
    1. Danh sách phim đang chiếu (`now-showing`).
    2. Danh sách phim sắp chiếu (`coming-soon`).
    3. Toàn bộ thông tin các cụm rạp và địa chỉ cụ thể (`cinemas`).
    4. Các mã khuyến mãi đang có hiệu lực (`promotions` - lọc theo thời gian và số lượng lượt dùng còn lại).
  * Định dạng lịch sử trò chuyện theo chuẩn cấu trúc của Gemini API.
  * Gọi trực tiếp đến Google Gemini API (`gemini-1.5-flash`) thông qua Laravel HTTP Client cực kỳ an toàn, nhanh chóng và tiết kiệm tài nguyên.
  * Thiết lập prompt chỉ dẫn hệ thống (`systemInstruction`) nghiêm ngặt, bắt buộc AI đóng vai trò là chăm sóc khách hàng độc quyền của rạp T-cine, chỉ trả lời các thông tin liên quan đến phim ảnh, rạp chiếu, bắp nước, khuyến mãi và lịch đặt vé của rạp T-cine. Lịch sự từ chối mọi câu hỏi ngoài lề.

* **[MODIFY] [api.php](file:///d:/doan/backend/routes/api.php)**:
  * Đăng ký endpoint công khai `POST /api/chatbot/message` để bất kỳ khách hàng nào cũng có thể trò chuyện với AI.

* **[MODIFY] [.env](file:///d:/doan/backend/.env) & [.env.example](file:///d:/doan/backend/.env.example)**:
  * Bổ sung sẵn dòng cấu hình `# Gemini AI API Key` và biến `GEMINI_API_KEY=` để Admin dán khóa API key từ Google AI Studio vào.

---

### 2. Frontend (React & SCSS)

* **[MODIFY] [chatbotApi.js](file:///d:/doan/frontend/src/api/chatbotApi.js)**:
  * Cập nhật hàm gọi API gửi tin nhắn `sendMessage(data)` truyền kèm mảng lịch sử chat tạm thời, đồng thời lược bỏ các APIs đồng bộ lịch sử cũ không còn sử dụng.

* **[NEW] [ChatWidget.jsx](file:///d:/doan/frontend/src/components/common/ChatWidget/ChatWidget.jsx)**:
  * Xây dựng component bong bóng chat nổi ở góc dưới bên phải màn hình.
  * Quản lý cuộc hội thoại hoàn toàn trong React State của phiên làm việc, tự động xóa sạch khi reload trang hoặc bấm nút Thùng rác để làm mới phiên.
  * **Markdown Parser Helper**: Tự động parse chữ in đậm (`**bold**`), gạch đầu dòng (`- item`), link đặt vé và xuống dòng từ phản hồi của AI thành giao diện HTML đẹp đẽ mà không cần dùng thư viện ngoài.
  * **Quick Suggestions**: Hiển thị các câu hỏi gợi ý nhanh lúc bắt đầu trò chuyện.
  * **Typing Indicator**: Hiển thị hiệu ứng AI đang suy nghĩ và gõ chữ (skeleton wave animation) nhịp nhàng sinh động khi chờ API.
  * Tự động cuộn thông minh (`auto-scroll`) xuống tin nhắn mới nhất.

* **[NEW] [ChatWidget.module.scss](file:///d:/doan/frontend/src/components/common/ChatWidget/ChatWidget.module.scss)**:
  * Thiết kế giao diện **Glassmorphism** cao cấp (nền mờ đục `backdrop-filter: blur`, viền neon mờ, đổ bóng chiều sâu sang trọng).
  * Micro-animations mượt mà khi di chuột, click mở/đóng, và tin nhắn mới xuất hiện.
  * Hiệu ứng bong bóng tròn phát sáng neon (pulsing glow dot) cuốn hút người dùng.
  * Tối ưu hiển thị responsive hoàn hảo trên các thiết bị di động (phủ kín màn hình trên mobile giúp dễ dàng thao tác).

* **[MODIFY] [CustomerLayout.jsx](file:///d:/doan/frontend/src/components/layout/CustomerLayout.jsx)**:
  * Nhúng `<ChatWidget />` ngay sau `<Footer />` để chatbot hiển thị ở mọi trang khách hàng.

---

## 🧪 Kịch bản Kiểm thử & Xác minh

1. **Khách chưa đăng nhập**:
   * Truy cập trang chủ T-cine (chưa đăng nhập), bong bóng chat vẫn xuất hiện nổi bật ở góc phải.
   * Mở bong bóng, chọn gợi ý: *"🎬 Phim nào đang hot?"*
   * Chatbot trả lời chính xác danh sách phim đang có trạng thái `now-showing` trong database, hiển thị in đậm tiêu đề phim và gạch đầu dòng rõ nét.
2. **Kiểm tra Duy trì ngữ cảnh (Context Retention)**:
   * Hỏi tiếp: *"Rạp mình nằm ở địa chỉ nào?"* -> Chatbot hiểu và liệt kê danh sách rạp của T-cine.
   * Hỏi tiếp: *"Rạp đầu tiên bạn vừa nhắc nằm ở đâu thế?"* -> Chatbot đọc mảng `history` gửi lên và trả lời chính xác thông tin địa chỉ cụm rạp đầu tiên trong danh sách vừa nêu.
3. **Kiểm tra chặn câu hỏi ngoài lề (Guardrails)**:
   * Hỏi: *"Viết cho tôi code giải thuật toán Fibonacci trong Python."*
   * Chatbot trả lời lịch sự từ chối: *"Tôi là Trợ lý ảo T-cine AI Assistant, chỉ hỗ trợ tư vấn các thông tin liên quan đến phim ảnh, rạp chiếu, khuyến mãi và dịch vụ của rạp T-cine thôi ạ. Hãy hỏi tôi về phim đang chiếu hôm nay nhé! 🎬"*
4. **Kiểm tra làm sạch phiên chat**:
   * Bấm F5 tải lại trang web hoặc bấm biểu tượng Thùng rác trên Header của khung chat.
   * Xác nhận màn hình chat được dọn sạch hoàn toàn, hiển thị lại lời chào mặc định của T-cine AI. Không có bất kỳ dữ liệu chat nào ghi nhận xuống database của server.
