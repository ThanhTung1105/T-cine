<?php

namespace App\Http\Controllers;

use App\Models\Showtime;
use App\Models\Pricing;
use Illuminate\Http\Request;

class ShowtimeController extends Controller
{
    /**
     * API #24: Lấy lịch chiếu theo phim
     * GET /api/movies/{movieId}/showtimes
     */
    public function byMovie($movieId, Request $request)
    {
        $query = Showtime::with(['room.cinema', 'projectionFormat'])
            ->where('movie_id', $movieId);

        if ($request->has('date')) {
            $query->whereDate('start_time', $request->date);
        } else {
            $query->where('start_time', '>=', now());
        }

        $showtimes = $query->orderBy('start_time')->get();

        // Nhóm theo rạp để hiển thị cho Frontend
        $grouped = $showtimes->groupBy(function ($showtime) {
            return $showtime->room->cinema->id;
        })->map(function ($showtimes, $cinemaId) {
            $cinema = $showtimes->first()->room->cinema;
            return [
                'cinema' => $cinema,
                'showtimes' => $showtimes->map(function ($st) {
                    return [
                        'id'                => $st->id,
                        'start_time'        => $st->start_time,
                        'end_time'          => $st->end_time,
                        'projection_format' => $st->projectionFormat ? $st->projectionFormat->name : null,
                        // Giá tham khảo cho FE hiển thị "từ X VND" — luôn dùng giá ghế thường
                        'from_price'        => Pricing::resolve('normal', $st->start_time, $st->projection_format_id),
                        'room'              => $st->room->only(['id', 'name']),
                    ];
                })->values(),
            ];
        })->values();

        return response()->json(['data' => $grouped]);
    }

    /**
     * API #26: Chi tiết suất chiếu (kèm trạng thái ghế)
     * GET /api/showtimes/{id}
     */
    public function show($id)
    {
        // Tự động hủy các đơn hàng chờ thanh toán đã quá 5 phút
        \App\Models\Booking::where('status', 'pending')
            ->where('created_at', '<', now()->subMinutes(5))
            ->update(['status' => 'cancelled']);

        $showtime = Showtime::with(['movie', 'room.cinema', 'room.seats', 'projectionFormat'])
            ->findOrFail($id);

        // Lấy danh sách seat_id đã được đặt trong suất chiếu này
        $bookedSeatIds = $showtime->bookings()
            ->whereIn('status', ['pending', 'paid'])
            ->with('tickets')
            ->get()
            ->pluck('tickets')
            ->flatten()
            ->pluck('seat_id')
            ->toArray();

        // Tính day_type 1 lần, lookup giá theo loại ghế từ bảng pricings
        $dayType = Pricing::classifyDayType($showtime->start_time);
        $showtimeFormatId = $showtime->projection_format_id;
        $priceByType = [
            'normal' => Pricing::resolve('normal', $showtime->start_time, $showtimeFormatId),
            'vip'    => Pricing::resolve('vip',    $showtime->start_time, $showtimeFormatId),
            'couple' => Pricing::resolve('couple', $showtime->start_time, $showtimeFormatId),
        ];

        // Gắn trạng thái + giá cho từng ghế
        $seats = $showtime->room->seats->map(function ($seat) use ($bookedSeatIds, $priceByType) {
            return [
                'id'         => $seat->id,
                'row'        => $seat->row,
                'column_num' => $seat->column_num,
                'type'       => $seat->type,
                'status'     => $seat->status,
                'is_booked'  => in_array($seat->id, $bookedSeatIds),
                'price'      => $priceByType[$seat->type] ?? 0,
            ];
        });

        return response()->json([
            'data' => [
                'showtime' => array_merge(
                    $showtime->only(['id', 'start_time', 'end_time']),
                    [
                        'projection_format' => $showtime->projectionFormat ? $showtime->projectionFormat->name : null,
                        'day_type' => $dayType
                    ],
                ),
                'movie'        => $showtime->movie,
                'room'         => $showtime->room->only(['id', 'name', 'capacity']),
                'cinema'       => $showtime->room->cinema,
                'seats'        => $seats,
                'prices'       => $priceByType,
            ],
        ]);
    }
}
