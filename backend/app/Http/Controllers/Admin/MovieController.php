<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MovieController extends Controller
{
    /**
     * API #12: [Admin] Thêm phim mới
     * POST /api/admin/movies
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'poster' => 'nullable|string|max:255',
            'banner' => 'nullable|string|max:255',
            'trailer_url' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:100',
            'director' => 'nullable|string|max:100',
            'cast_info' => 'nullable|string|max:255',
            'duration' => 'nullable|integer',
            'age_rating' => 'nullable|string|max:10',
            'rating' => 'nullable|numeric|min:0|max:10',
            'release_date' => 'nullable|date',
            'status' => 'required|in:now_showing,coming_soon,ended',
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->title) . '-' . Str::random(5);

        $movie = Movie::create($data);

        return response()->json([
            'message' => 'Thêm phim thành công',
            'data' => $movie,
        ], 201);
    }

    /**
     * API #13: [Admin] Cập nhật phim
     * PUT /api/admin/movies/{id}
     */
    public function update(Request $request, $id)
    {
        $movie = Movie::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:now_showing,coming_soon,ended',
            'rating' => 'nullable|numeric|min:0|max:10',
        ]);

        $data = $request->all();
        if ($request->has('title') && $request->title !== $movie->title) {
            $data['slug'] = Str::slug($request->title) . '-' . Str::random(5);
        }

        $movie->update($data);

        return response()->json([
            'message' => 'Cập nhật phim thành công',
            'data' => $movie->fresh(),
        ]);
    }

    /**
     * API #14: [Admin] Xóa phim
     * DELETE /api/admin/movies/{id}
     */
    public function destroy($id)
    {
        $movie = Movie::findOrFail($id);
        $movie->delete();

        return response()->json([
            'message' => 'Xóa phim thành công',
        ]);
    }
}
