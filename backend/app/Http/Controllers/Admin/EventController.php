<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(
            Event::with('promotion')->orderBy('created_at', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'image' => 'nullable|string',
            'category' => 'nullable|string|in:promotion,news',
            'promotion_id' => 'nullable|exists:promotions,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
        ]);

        $isFeatured = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
        if ($isFeatured) {
            $cat = $request->category ?: 'promotion';
            $featuredCount = Event::where('category', $cat)->where('is_featured', true)->count();
            if ($featuredCount >= 4) {
                return response()->json([
                    'message' => 'Chỉ được hiển thị tối đa 4 sự kiện nổi bật ngoài trang chủ cho mỗi danh mục.',
                ], 422);
            }
        }

        $validated['is_featured'] = $isFeatured;
        $event = Event::create($validated);
        return response()->json($event->load('promotion'), 201);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'image' => 'nullable|string',
            'category' => 'nullable|string|in:promotion,news',
            'promotion_id' => 'nullable|exists:promotions,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
        ]);

        if (isset($validated['is_featured'])) {
            $isFeatured = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
            if ($isFeatured) {
                $cat = $request->category ?: $event->category ?: 'promotion';
                $featuredCount = Event::where('category', $cat)
                    ->where('is_featured', true)
                    ->where('id', '!=', $id)
                    ->count();
                if ($featuredCount >= 4) {
                    return response()->json([
                        'message' => 'Chỉ được hiển thị tối đa 4 sự kiện nổi bật ngoài trang chủ cho mỗi danh mục.',
                    ], 422);
                }
            }
            $validated['is_featured'] = $isFeatured;
        }

        $event->update($validated);
        return response()->json($event->fresh()->load('promotion'));
    }

    public function destroy($id)
    {
        Event::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa sự kiện']);
    }
}
