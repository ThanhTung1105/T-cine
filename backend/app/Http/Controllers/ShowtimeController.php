<?php

namespace App\Http\Controllers;

use App\Models\Showtime;
use Illuminate\Http\Request;

class ShowtimeController extends Controller
{
    /**
     * API #24: Lấy lịch chiếu theo phim
     * GET /api/movies/{movieId}/showtimes
     */
    public function byMovie($movieId, Request $request)
    {
        $query = Showtime::with(['room.cinema'])
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
                        'id' => $st->id,
                        'start_time' => $st->start_time,
                        'end_time' => $st->end_time,
                        'base_price' => $st->base_price,
                        'room' => $st->room->only(['id', 'name']),
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
        $showtime = Showtime::with(['movie', 'room.cinema', 'room.seats'])
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

        // Gắn trạng thái cho từng ghế
        $seats = $showtime->room->seats->map(function ($seat) use ($bookedSeatIds) {
            return [
                'id' => $seat->id,
                'row' => $seat->row,
                'column_num' => $seat->column_num,
                'type' => $seat->type,
                'status' => $seat->status,
                'is_booked' => in_array($seat->id, $bookedSeatIds),
            ];
        });

        return response()->json([
            'data' => [
                'showtime' => $showtime->only(['id', 'start_time', 'end_time', 'base_price']),
                'movie' => $showtime->movie,
                'room' => $showtime->room->only(['id', 'name', 'capacity']),
                'cinema' => $showtime->room->cinema,
                'seats' => $seats,
            ],
        ]);
    }
}
