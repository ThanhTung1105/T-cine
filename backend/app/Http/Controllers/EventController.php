<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Lấy danh sách sự kiện đang hoạt động
     */
    public function index(Request $request)
    {
        $query = Event::where('is_active', true)
            ->with('promotion')
            ->orderBy('created_at', 'desc');

        if ($request->category) {
            $query->where('category', $request->category);
        }

        return response()->json($query->get());
    }

    /**
     * Lấy chi tiết sự kiện
     */
    public function show($id)
    {
        $event = Event::with('promotion')->findOrFail($id);
        return response()->json($event);
    }
}
