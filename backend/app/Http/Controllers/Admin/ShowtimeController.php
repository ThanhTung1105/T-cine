<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Showtime;
use Illuminate\Http\Request;

class ShowtimeController extends Controller
{
    /**
     * API #27: [Admin] Lấy tất cả suất chiếu
     * GET /api/admin/showtimes
     */
    public function index(Request $request)
    {
        $query = Showtime::with(['movie', 'room.cinema']);

        if ($request->has('movie_id')) {
            $query->where('movie_id', $request->movie_id);
        }
        if ($request->has('date')) {
            $query->whereDate('start_time', $request->date);
        }

        $showtimes = $query->orderBy('start_time', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($showtimes);
    }

    /**
     * API #28: [Admin] Thêm suất chiếu
     * POST /api/admin/showtimes
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'movie_id'   => 'required|exists:movies,id',
            'room_id'    => 'required|exists:rooms,id',
            'start_time' => 'required|date',
            'end_time'   => 'sometimes|date|after:start_time',
        ]);

        // Tự động lấy duration từ Movie và tính end_time theo đúng múi giờ local/UTC+7 của hệ thống
        $movie = \App\Models\Movie::findOrFail($data['movie_id']);
        $duration = $movie->duration ?: 120;
        $startTime = new \DateTime($data['start_time']);
        $endTime = clone $startTime;
        $endTime->modify("+{$duration} minutes");
        $data['end_time'] = $endTime->format('Y-m-d H:i:s');

        // Kiểm tra trùng lịch chiếu (Overlapping check)
        $overlap = Showtime::with('movie')
            ->where('room_id', $data['room_id'])
            ->where(function ($query) use ($data) {
                $query->where('start_time', '<', $data['end_time'])
                      ->where('end_time', '>', $data['start_time']);
            })
            ->first();

        if ($overlap) {
            $movieTitle = $overlap->movie ? $overlap->movie->title : 'Phim khác';
            $overlapStart = date('H:i d/m/Y', strtotime($overlap->start_time));
            $overlapEnd = date('H:i d/m/Y', strtotime($overlap->end_time));
            return response()->json([
                'message' => 'Lịch chiếu bị trùng!',
                'errors' => [
                    'start_time' => ["Phòng này đã có lịch chiếu phim \"{$movieTitle}\" từ {$overlapStart} đến {$overlapEnd}."]
                ]
            ], 422);
        }

        $showtime = Showtime::create($data);
        $showtime->load(['movie', 'room.cinema']);

        return response()->json([
            'message' => 'Thêm suất chiếu thành công',
            'data'    => $showtime,
        ], 201);
    }

    /**
     * API #29: [Admin] Cập nhật suất chiếu
     * PUT /api/admin/showtimes/{id}
     */
    public function update(Request $request, $id)
    {
        $showtime = Showtime::findOrFail($id);

        $data = $request->validate([
            'movie_id'   => 'sometimes|exists:movies,id',
            'room_id'    => 'sometimes|exists:rooms,id',
            'start_time' => 'sometimes|date',
            'end_time'   => 'sometimes|date|after:start_time',
        ]);

        $movieId = $data['movie_id'] ?? $showtime->movie_id;
        $roomId = $data['room_id'] ?? $showtime->room_id;
        $startTimeStr = $data['start_time'] ?? $showtime->start_time;

        // Tự động lấy duration từ Movie và cập nhật lại end_time chính xác theo thời lượng thực tế
        $movie = \App\Models\Movie::findOrFail($movieId);
        $duration = $movie->duration ?: 120;
        $startTime = new \DateTime($startTimeStr);
        $endTime = clone $startTime;
        $endTime->modify("+{$duration} minutes");
        
        $data['end_time'] = $endTime->format('Y-m-d H:i:s');
        $endTimeStr = $data['end_time'];

        // Kiểm tra trùng lịch chiếu, loại trừ chính nó
        $overlap = Showtime::with('movie')
            ->where('room_id', $roomId)
            ->where('id', '!=', $id)
            ->where(function ($query) use ($startTimeStr, $endTimeStr) {
                $query->where('start_time', '<', $endTimeStr)
                      ->where('end_time', '>', $startTimeStr);
            })
            ->first();

        if ($overlap) {
            $movieTitle = $overlap->movie ? $overlap->movie->title : 'Phim khác';
            $overlapStart = date('H:i d/m/Y', strtotime($overlap->start_time));
            $overlapEnd = date('H:i d/m/Y', strtotime($overlap->end_time));
            return response()->json([
                'message' => 'Lịch chiếu bị trùng!',
                'errors' => [
                    'start_time' => ["Phòng này đã có lịch chiếu phim \"{$movieTitle}\" từ {$overlapStart} đến {$overlapEnd}."]
                ]
            ], 422);
        }

        $showtime->update($data);

        return response()->json([
            'message' => 'Cập nhật suất chiếu thành công',
            'data'    => $showtime->fresh()->load(['movie', 'room.cinema']),
        ]);
    }

    /**
     * API #30: [Admin] Xóa suất chiếu
     * DELETE /api/admin/showtimes/{id}
     */
    public function destroy($id)
    {
        $showtime = Showtime::findOrFail($id);
        $showtime->delete();

        return response()->json(['message' => 'Xóa suất chiếu thành công']);
    }
}
