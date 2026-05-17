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
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'base_price' => 'required|numeric|min:0',
        ]);

        $showtime = Showtime::create($request->all());
        $showtime->load(['movie', 'room.cinema']);

        return response()->json([
            'message' => 'Thêm suất chiếu thành công',
            'data' => $showtime,
        ], 201);
    }

    /**
     * API #29: [Admin] Cập nhật suất chiếu
     * PUT /api/admin/showtimes/{id}
     */
    public function update(Request $request, $id)
    {
        $showtime = Showtime::findOrFail($id);

        $request->validate([
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'base_price' => 'sometimes|numeric|min:0',
        ]);

        $showtime->update($request->all());

        return response()->json([
            'message' => 'Cập nhật suất chiếu thành công',
            'data' => $showtime->fresh()->load(['movie', 'room.cinema']),
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
