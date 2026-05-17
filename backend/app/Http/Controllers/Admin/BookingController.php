<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * API #35: [Admin] Lấy tất cả đơn đặt vé
     * GET /api/admin/bookings
     */
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'showtime.movie', 'showtime.room.cinema', 'tickets', 'payment']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($bookings);
    }

    /**
     * API #36: [Admin] Cập nhật trạng thái đơn
     * PUT /api/admin/bookings/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        $booking->update(['status' => $request->status]);

        // Nếu chuyển sang paid, tự tạo payment record
        if ($request->status === 'paid' && !$booking->payment) {
            $booking->payment()->create([
                'method' => 'counter',
                'amount' => $booking->final_amount,
                'status' => 'success',
                'paid_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $booking->fresh()->load('payment'),
        ]);
    }
}
