<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Movie;
use App\Models\Cinema;
use App\Models\Promotion;
use App\Models\Event;
use App\Models\Pricing;
use App\Models\Combo;
use App\Models\Showtime;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    /**
     * Gửi tin nhắn đến chatbot AI Gemini và nhận phản hồi.
     * Cả khách hàng đã đăng nhập và chưa đăng nhập đều có thể sử dụng.
     * Lịch sử chat được lưu ở client và gửi kèm trong request.
     */
    public function sendMessage(Request $request)
    {
        // 1. Validate request
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array',
            'history.*.role' => 'required|string|in:user,model',
            'history.*.message' => 'required|string',
        ]);

        $userMessage = $request->input('message');
        $chatHistory = $request->input('history', []);

        // 2. Kiểm tra API Key của Gemini
        $apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
        if (empty($apiKey)) {
            Log::error('Gemini API Key is not configured in .env file.');
            return response()->json([
                'reply' => "Xin chào! Hiện tại hệ thống Trợ lý ảo T-cine AI đang trong quá trình cấu hình. Vui lòng quay lại sau ít phút hoặc liên hệ Hotline để được hỗ trợ đặt vé nhanh nhất nhé! 🍿"
            ]);
        }

        try {
            // 3. Lấy dữ liệu thực tế từ Database để làm ngữ cảnh (RAG Context)
            $now = Carbon::now();

            // Lấy danh sách phim đang chiếu
            $moviesShowing = Movie::where('status', 'now_showing')
                ->get(['title', 'genre', 'duration', 'release_date', 'rating']);

            // Lấy danh sách phim sắp chiếu
            $moviesComing = Movie::where('status', 'coming_soon')
                ->get(['title', 'genre', 'duration', 'release_date']);

            // Lấy danh sách cụm rạp
            $cinemas = Cinema::all(['name', 'address', 'city']);

            // Lấy danh sách khuyến mãi (bao gồm ngày hiệu lực để AI tự kiểm tra và tư vấn chính xác)
            $promotions = Promotion::all(['code', 'discount_percent', 'max_discount', 'valid_from', 'valid_to', 'usage_limit', 'used_count']);

            // Lấy danh sách tin tức & chương trình ưu đãi đang hiển thị
            $activeEvents = Event::where('is_active', true)
                ->get(['title', 'description', 'start_date', 'end_date']);

            // Lấy ma trận bảng giá vé hiện tại
            $pricingMatrix = Pricing::asMatrix();

            // Lấy danh sách các gói combo bắp nước
            $combos = Combo::all(['name', 'description', 'price']);

            // Lấy danh sách suất chiếu từ đầu ngày hôm qua (để hỗ trợ dữ liệu test)
            $showtimes = Showtime::with(['movie', 'room.cinema'])
                ->where('start_time', '>=', $now->copy()->subDays(1)->startOfDay())
                ->get()
                ->map(function ($s) {
                    return [
                        'movie' => $s->movie ? $s->movie->title : 'Chưa rõ',
                        'cinema' => ($s->room && $s->room->cinema) ? $s->room->cinema->name : 'Chưa rõ',
                        'room' => $s->room ? $s->room->name : 'Chưa rõ',
                        'start_time' => Carbon::parse($s->start_time)->format('H:i d/m/Y'),
                    ];
                });

            // 4. Thiết lập System Instruction (Prompt định hướng hành vi của AI)
            $systemInstruction = "Bạn là Trợ lý ảo T-cine AI Assistant, một chatbot tư vấn phim độc quyền của hệ thống rạp phim T-cine.
Nhiệm vụ của bạn là hỗ trợ, tư vấn và giải đáp các thắc mắc của khách hàng về phim ảnh, rạp chiếu, suất chiếu (lịch chiếu), giá vé, bắp nước và các chương trình khuyến mãi của T-cine.

Dưới đây là DỮ LIỆU THỰC TẾ của hệ thống rạp T-cine hiện tại (Hãy sử dụng dữ liệu này để trả lời chính xác, TUYỆT ĐỐI không bịa đặt thông tin khác):

1. DANH SÁCH PHIM ĐANG CHIẾU:
" . json_encode($moviesShowing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

2. DANH SÁCH PHIM SẮP CHIẾU:
" . json_encode($moviesComing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

3. DANH SÁCH CÁC CỤM RẠP T-CINE:
" . json_encode($cinemas, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

4. DANH SÁCH CÁC SUẤT CHIẾU / LỊCH CHIẾU:
" . json_encode($showtimes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

5. DANH SÁCH CÁC GÓI COMBO BẮP NƯỚC:
" . json_encode($combos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

6. DANH SÁCH CÁC MÃ KHUYẾN MÃI (Hãy đối chiếu với ngày hôm nay là " . $now->toDateString() . " để tư vấn xem còn hạn hay đã hết hạn):
" . json_encode($promotions, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

7. DANH SÁCH CÁC CHƯƠNG TRÌNH ƯU ĐÃI & TIN TỨC SỰ KIỆN ĐANG HOẠT ĐỘNG:
" . json_encode($activeEvents, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

8. BẢNG GIÁ VÉ THEO LOẠI GHẾ (NORMAL - THƯỜNG, VIP, COUPLE - ĐÔI) VÀ LOẠI NGÀY (WEEKDAY - NGÀY THƯỜNG, WEEKEND - CUỐI TUẦN, HOLIDAY - NGÀY LỄ):
" . json_encode($pricingMatrix, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

QUY TẮC ỨNG XỬ QUAN TRỌNG:
- Luôn trả lời lịch sự, thân thiện, xưng hô là 'T-cine AI' hoặc 'Em' và gọi khách hàng là 'Anh/Chị' hoặc 'Bạn'. Sử dụng emoji sinh động phù hợp.
- Trả lời bằng tiếng Việt tự nhiên, ngắn gọn, cuốn hút và có cấu trúc rõ ràng. Sử dụng định dạng Markdown (in đậm **, danh sách gạch đầu dòng -, xuống dòng) để thông tin dễ đọc, chuyên nghiệp.
- Khi khách hàng hỏi về phim đang chiếu, hãy giới thiệu phim hấp dẫn, nêu rõ thể loại, thời lượng, đánh giá (nếu có) và hướng dẫn họ bấm nút 'Đặt vé' trên web.
- Luôn hướng dẫn khách hàng đặt vé trực tuyến trên website của T-cine qua 4 bước: (1) Chọn phim, (2) Chọn rạp, ngày & suất chiếu, (3) Chọn ghế & combo, (4) Nhập mã giảm giá và chọn phương thức thanh toán.
- TUYỆT ĐỐI chỉ trả lời các câu hỏi liên quan đến phim ảnh, rạp chiếu, lịch chiếu, khuyến mãi, bắp nước hoặc dịch vụ của rạp T-cine.
- TUYỆT ĐỐI KHÔNG cung cấp, trả lời bất kỳ thông tin nào liên quan đến tài khoản người dùng, email, mật khẩu cá nhân, thông tin thanh toán, giao dịch (payments, bookings, tickets) của bất kỳ khách hàng nào để bảo vệ quyền riêng tư tuyệt đối. Nếu có câu hỏi về vé đã mua của người dùng, hãy lịch sự hướng dẫn họ đăng nhập rồi truy cập 'Lịch sử đặt vé'.
- Nếu khách hàng hỏi bất kỳ câu hỏi nào ngoài lề (như code lập trình, giải toán, thời tiết, tin tức bên ngoài, câu hỏi chung chung không liên quan đến T-cine), hãy lịch sự từ chối và hướng khách hàng quay lại chủ đề rạp phim T-cine.";

            // 5. Chuẩn bị nội dung cuộc hội thoại (lịch sử chat + tin nhắn mới) theo format Gemini
            $contents = [];

            // Duyệt qua lịch sử chat gửi từ Client
            foreach ($chatHistory as $msg) {
                $contents[] = [
                    'role' => $msg['role'],
                    'parts' => [
                        ['text' => $msg['message']]
                    ]
                ];
            }

            // Thêm tin nhắn mới nhất của người dùng vào cuối
            $contents[] = [
                'role' => 'user',
                'parts' => [
                    ['text' => $userMessage]
                ]
            ];

            // 6. Gọi Gemini API (gemini-2.5-flash) bằng Laravel HTTP Client
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => $contents,
                'systemInstruction' => [
                    'parts' => [
                        ['text' => $systemInstruction]
                    ]
                ]
            ]);

            // 7. Xử lý kết quả phản hồi từ Gemini
            if ($response->successful()) {
                $result = $response->json();
                $reply = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

                if (empty($reply)) {
                    $reply = "Xin lỗi, em không thể xử lý câu trả lời ngay lúc này. Anh/Chị vui lòng thử lại nhé!";
                }

                return response()->json([
                    'reply' => $reply
                ]);
            } else {
                Log::error('Gemini API Error: ' . $response->body());
                return response()->json([
                    'reply' => "Oops! Em gặp một chút sự cố khi kết nối với máy chủ AI. Anh/Chị vui lòng thử lại sau giây lát nhé!"
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Chatbot Error: ' . $e->getMessage());
            return response()->json([
                'reply' => "Đã xảy ra lỗi hệ thống khi xử lý câu hỏi của bạn. Vui lòng thử lại sau!"
            ], 500);
        }
    }
}
