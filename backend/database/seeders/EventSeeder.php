<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'title' => 'T-CINE MEMBER DAY - Giảm 50% vé xem phim',
                'description' => 'Ưu đãi đặc biệt dành cho thành viên T-CINE vào mỗi thứ 4 hàng tuần.',
                'content' => '<h2>T-CINE MEMBER DAY</h2>
                    <p><strong>Giảm ngay 50%</strong> giá vé xem phim cho tất cả thành viên T-CINE vào mỗi <strong>Thứ 4</strong> hàng tuần!</p>
                    <h3>Điều kiện áp dụng:</h3>
                    <ul>
                        <li>Áp dụng cho thành viên đã đăng ký tài khoản T-CINE</li>
                        <li>Giảm tối đa 50.000đ/vé</li>
                        <li>Mỗi thành viên được mua tối đa 2 vé/ngày</li>
                        <li>Áp dụng tại tất cả các rạp T-CINE trên toàn quốc</li>
                    </ul>
                    <h3>Thời gian:</h3>
                    <p>Từ 01/05/2026 đến 31/12/2026, vào mỗi Thứ 4 hàng tuần.</p>',
                'image' => 'events/member-day.jpg',
                'category' => 'promotion',
                'start_date' => '2026-05-01',
                'end_date' => '2026-12-31',
                'is_active' => true,
            ],
            [
                'title' => 'Combo Sinh Nhật - Quà tặng MIỄN PHÍ',
                'description' => 'Đến T-CINE vào tháng sinh nhật, nhận ngay combo bắp nước miễn phí!',
                'content' => '<h2>Quà Sinh Nhật MIỄN PHÍ Từ T-CINE</h2>
                    <p>T-CINE gửi tặng bạn <strong>01 Combo Bắp Nước</strong> hoàn toàn miễn phí vào tháng sinh nhật của bạn!</p>
                    <h3>Cách nhận quà:</h3>
                    <ul>
                        <li>Đăng nhập tài khoản T-CINE đã xác minh ngày sinh</li>
                        <li>Mua vé xem phim trong tháng sinh nhật</li>
                        <li>Combo sẽ được tặng kèm tự động khi đặt vé online</li>
                    </ul>
                    <h3>Lưu ý:</h3>
                    <p>Mỗi thành viên chỉ được nhận 1 lần/năm. Không áp dụng đồng thời với ưu đãi khác.</p>',
                'image' => 'events/birthday-combo.jpg',
                'category' => 'promotion',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'is_active' => true,
            ],
            [
                'title' => 'Mùa Hè Rực Rỡ - Giảm 30% mọi suất chiếu',
                'description' => 'Chào hè 2026! Giảm 30% tất cả suất chiếu trong tháng 6.',
                'content' => '<h2>Mùa Hè Rực Rỡ Cùng T-CINE</h2>
                    <p>Hè đến rồi! T-CINE dành tặng bạn ưu đãi <strong>giảm 30%</strong> giá vé cho mọi suất chiếu trong suốt tháng 6/2026.</p>
                    <h3>Chi tiết chương trình:</h3>
                    <ul>
                        <li>Thời gian: 01/06/2026 - 30/06/2026</li>
                        <li>Áp dụng cho tất cả các phim đang chiếu</li>
                        <li>Giảm giá tự động khi đặt vé online tại website</li>
                        <li>Áp dụng tại tất cả rạp T-CINE</li>
                    </ul>',
                'image' => 'events/summer-sale.jpg',
                'category' => 'promotion',
                'start_date' => '2026-06-01',
                'end_date' => '2026-06-30',
                'is_active' => true,
            ],
            [
                'title' => 'Đêm Phim Kinh Dị - Halloween Special',
                'description' => 'Sự kiện đặc biệt mùa Halloween với hàng loạt phim kinh dị hot nhất!',
                'content' => '<h2>Đêm Phim Kinh Dị - Halloween 2026</h2>
                    <p>T-CINE mang đến đêm phim kinh dị đặc biệt nhân dịp <strong>Halloween 2026</strong>!</p>
                    <h3>Hoạt động:</h3>
                    <ul>
                        <li>Marathon phim kinh dị từ 20h - 2h sáng</li>
                        <li>Hóa trang đến rạp - nhận vé miễn phí</li>
                        <li>Photo booth chủ đề Halloween</li>
                        <li>Quà tặng bất ngờ cho khán giả</li>
                    </ul>
                    <p><em>Số lượng vé có hạn - Đặt ngay!</em></p>',
                'image' => 'events/halloween.jpg',
                'category' => 'news',
                'start_date' => '2026-10-29',
                'end_date' => '2026-10-31',
                'is_active' => true,
            ],
            [
                'title' => 'Ưu Đãi Học Sinh Sinh Viên - Giảm 40%',
                'description' => 'Xuất trình thẻ HSSV để nhận ưu đãi giảm 40% giá vé.',
                'content' => '<h2>Ưu Đãi Dành Cho Học Sinh Sinh Viên</h2>
                    <p>T-CINE ưu đãi <strong>giảm 40%</strong> giá vé cho tất cả học sinh, sinh viên khi xuất trình thẻ HSSV.</p>
                    <h3>Điều kiện:</h3>
                    <ul>
                        <li>Xuất trình thẻ HSSV còn hiệu lực tại quầy vé</li>
                        <li>Áp dụng cho suất chiếu trước 18h từ Thứ 2 đến Thứ 6</li>
                        <li>Mỗi thẻ HSSV mua tối đa 1 vé/ngày</li>
                    </ul>',
                'image' => 'events/student-discount.jpg',
                'category' => 'promotion',
                'start_date' => '2026-05-01',
                'end_date' => '2026-12-31',
                'is_active' => true,
            ],
            [
                'title' => 'Khai Trương Rạp T-CINE Đà Nẵng',
                'description' => 'Sự kiện khai trương chi nhánh mới tại Đà Nẵng với nhiều ưu đãi hấp dẫn.',
                'content' => '<h2>Grand Opening - T-CINE Đà Nẵng</h2>
                    <p>T-CINE chính thức khai trương chi nhánh tại <strong>Đà Nẵng</strong> vào ngày 15/07/2026!</p>
                    <h3>Ưu đãi khai trương:</h3>
                    <ul>
                        <li>Mua 1 tặng 1 cho 100 khách hàng đầu tiên</li>
                        <li>Miễn phí bắp nước cho mọi vé trong tuần khai trương</li>
                        <li>Rút thăm trúng thưởng iPhone, Airpods</li>
                    </ul>',
                'image' => 'events/grand-opening.jpg',
                'category' => 'news',
                'start_date' => '2026-07-15',
                'end_date' => '2026-07-22',
                'is_active' => true,
            ],
            [
                'title' => 'Thẻ Thành Viên VIP - Đặc quyền cao cấp',
                'description' => 'Nâng cấp thẻ VIP để nhận nhiều đặc quyền premium tại T-CINE.',
                'content' => '<h2>Chương Trình Thẻ Thành Viên VIP</h2>
                    <p>Nâng cấp trải nghiệm xem phim của bạn với <strong>Thẻ VIP T-CINE</strong>!</p>
                    <h3>Đặc quyền VIP:</h3>
                    <ul>
                        <li>Giảm 20% mọi vé xem phim</li>
                        <li>Ưu tiên chọn ghế - ghế VIP luôn sẵn sàng</li>
                        <li>Phòng chờ VIP riêng biệt</li>
                        <li>Tích điểm x2 trên mỗi giao dịch</li>
                        <li>Quà sinh nhật đặc biệt</li>
                    </ul>
                    <p>Phí thường niên: <strong>499.000đ/năm</strong></p>',
                'image' => 'events/vip-member.jpg',
                'category' => 'promotion',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'is_active' => true,
            ],
            [
                'title' => 'Flash Sale Cuối Tuần - Chỉ 49K/vé',
                'description' => 'Mỗi cuối tuần, T-CINE sale sốc chỉ 49K cho 200 vé đầu tiên!',
                'content' => '<h2>Flash Sale Cuối Tuần - Chỉ 49.000đ/vé!</h2>
                    <p>Mỗi <strong>Thứ 7 & Chủ Nhật</strong>, T-CINE tung ra 200 vé giá sốc chỉ <strong>49.000đ</strong>!</p>
                    <h3>Cách tham gia:</h3>
                    <ul>
                        <li>Flash sale bắt đầu lúc 10:00 sáng mỗi Thứ 7</li>
                        <li>Đặt vé trực tuyến tại website T-CINE</li>
                        <li>Số lượng có hạn - chỉ 200 vé/tuần</li>
                        <li>Áp dụng cho tất cả phim đang chiếu</li>
                    </ul>
                    <p><em>Nhanh tay kẻo lỡ!</em></p>',
                'image' => 'events/flash-sale.jpg',
                'category' => 'promotion',
                'start_date' => '2026-05-01',
                'end_date' => '2026-08-31',
                'is_active' => true,
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}
