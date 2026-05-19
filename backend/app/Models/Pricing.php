<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pricing extends Model
{
    use HasFactory;

    protected $fillable = [
        'seat_type',
        'day_type',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Xác định day_type của một thời điểm cho trước.
     *
     * - 'weekend': thứ 7 hoặc chủ nhật
     * - 'holiday': nằm trong danh sách ngày lễ (cấu hình ở config/holidays.php hoặc bổ sung sau)
     * - 'weekday': còn lại
     *
     * Hiện tại chưa có bảng holidays, dùng config tĩnh; có thể mở rộng sau.
     */
    public static function classifyDayType($dateTime): string
    {
        $date = $dateTime instanceof Carbon ? $dateTime : Carbon::parse($dateTime);

        $holidays = (array) config('holidays.dates', []);
        $iso = $date->toDateString();
        if (in_array($iso, $holidays, true)) {
            return 'holiday';
        }

        return $date->isWeekend() ? 'weekend' : 'weekday';
    }

    /**
     * Lấy giá vé theo loại ghế + thời điểm chiếu.
     * Fallback: nếu không có row active → trả về 0.
     */
    public static function resolve(string $seatType, $startTime): float
    {
        $dayType = self::classifyDayType($startTime);

        $row = self::where('seat_type', $seatType)
            ->where('day_type', $dayType)
            ->where('is_active', true)
            ->first();

        if (!$row) {
            // Fallback weekday nếu day_type khác không có
            $row = self::where('seat_type', $seatType)
                ->where('day_type', 'weekday')
                ->where('is_active', true)
                ->first();
        }

        return $row ? (float) $row->price : 0.0;
    }

    /**
     * Trả về toàn bộ bảng giá ở dạng map { seat_type: { day_type: price } }
     * Tiện cho FE hiển thị legend.
     */
    public static function asMatrix(): array
    {
        $rows = self::all();
        $matrix = [];
        foreach ($rows as $r) {
            $matrix[$r->seat_type][$r->day_type] = (float) $r->price;
        }
        return $matrix;
    }
}
