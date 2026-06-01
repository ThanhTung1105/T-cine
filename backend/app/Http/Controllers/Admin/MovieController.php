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
            'is_featured' => 'nullable|boolean',
        ]);

        $isFeatured = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
        if ($isFeatured) {
            $featuredCount = Movie::where('is_featured', true)->count();
            if ($featuredCount >= 4) {
                return response()->json([
                    'message' => 'Chỉ được hiển thị tối đa 4 phim nổi bật trên trang chủ. Vui lòng bỏ chọn phim khác trước.',
                ], 422);
            }
        }

        $data = $request->all();
        $data['slug'] = Str::slug($request->title) . '-' . Str::random(5);
        $data['is_featured'] = $isFeatured;

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
            'is_featured' => 'nullable|boolean',
        ]);

        $data = $request->all();
        if ($request->has('title') && $request->title !== $movie->title) {
            $data['slug'] = Str::slug($request->title) . '-' . Str::random(5);
        }

        if ($request->has('is_featured')) {
            $isFeatured = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
            if ($isFeatured) {
                $featuredCount = Movie::where('is_featured', true)->where('id', '!=', $id)->count();
                if ($featuredCount >= 4) {
                    return response()->json([
                        'message' => 'Chỉ được hiển thị tối đa 4 phim nổi bật trên trang chủ. Vui lòng bỏ chọn phim khác trước.',
                    ], 422);
                }
            }
            $data['is_featured'] = $isFeatured;
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
