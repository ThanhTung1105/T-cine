<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    /**
     * API #7: Lấy danh sách phim (phân trang, lọc)
     * GET /api/movies
     */
    public function index(Request $request)
    {
        $query = Movie::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('genre')) {
            $query->where('genre', 'like', '%' . $request->genre . '%');
        }

        $movies = $query->orderBy('release_date', 'desc')->paginate($request->get('per_page', 12));

        return response()->json($movies);
    }

    /**
     * API #8: Lấy phim đang chiếu
     * GET /api/movies/now-showing
     */
    public function nowShowing()
    {
        $movies = Movie::where('status', 'now_showing')
            ->orderBy('release_date', 'desc')
            ->get();

        return response()->json(['data' => $movies]);
    }

    /**
     * API #9: Lấy phim sắp chiếu
     * GET /api/movies/coming-soon
     */
    public function comingSoon()
    {
        $movies = Movie::where('status', 'coming_soon')
            ->orderBy('release_date', 'asc')
            ->get();

        return response()->json(['data' => $movies]);
    }

    /**
     * API #10: Lấy chi tiết phim
     * GET /api/movies/{id}
     */
    public function show($id)
    {
        $movie = Movie::with('showtimes.room.cinema')->findOrFail($id);

        return response()->json(['data' => $movie]);
    }

    /**
     * API #11: Tìm kiếm phim theo từ khóa
     * GET /api/movies/search
     */
    public function search(Request $request)
    {
        $keyword = $request->get('keyword', '');

        $movies = Movie::where('title', 'like', "%{$keyword}%")
            ->orWhere('genre', 'like', "%{$keyword}%")
            ->orWhere('director', 'like', "%{$keyword}%")
            ->orWhere('cast_info', 'like', "%{$keyword}%")
            ->orderBy('release_date', 'desc')
            ->limit(20)
            ->get();

        return response()->json(['data' => $movies]);
    }
}
