<?php

namespace App\Http\Controllers;

use App\Models\Cinema;
use App\Models\Room;
use Illuminate\Http\Request;

class CinemaController extends Controller
{
    /**
     * API #15: Lấy danh sách rạp
     * GET /api/cinemas
     */
    public function index()
    {
        $cinemas = Cinema::withCount('rooms')->get();

        return response()->json(['data' => $cinemas]);
    }

    /**
     * API #16: Lấy chi tiết rạp (kèm phòng chiếu)
     * GET /api/cinemas/{id}
     */
    public function show($id)
    {
        $cinema = Cinema::with('rooms.seats')->findOrFail($id);

        return response()->json(['data' => $cinema]);
    }

    /**
     * API #17: Lấy danh sách phòng chiếu của rạp
     * GET /api/cinemas/{id}/rooms
     */
    public function rooms($id)
    {
        $cinema = Cinema::findOrFail($id);
        $rooms = $cinema->rooms()->withCount('seats')->get();

        return response()->json(['data' => $rooms]);
    }

    /**
     * API #25: Lấy lịch chiếu theo rạp
     * GET /api/cinemas/{cinemaId}/showtimes
     */
    public function showtimes($cinemaId, Request $request)
    {
        $cinema = Cinema::findOrFail($cinemaId);

        $query = $cinema->rooms()
            ->with(['showtimes' => function ($q) use ($request) {
                $q->with('movie');
                if ($request->has('date')) {
                    $q->whereDate('start_time', $request->date);
                } else {
                    $q->where('start_time', '>=', now());
                }
                $q->orderBy('start_time');
            }]);

        $rooms = $query->get();

        return response()->json(['data' => $rooms]);
    }
}
