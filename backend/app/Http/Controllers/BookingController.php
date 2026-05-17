<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Ticket;
use App\Models\BookingCombo;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * API #31: Tạo đơn đặt vé (chọn ghế + combo)
     * POST /api/bookings
     */
    public function store(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|exists:showtimes,id',
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'exists:seats,id',
            'combos' => 'nullable|array',
            'combos.*.combo_id' => 'exists:combos,id',
            'combos.*.quantity' => 'integer|min:1',
            'promotion_id' => 'nullable|exists:promotions,id',
        ]);

        $user = $request->user();

        // Kiểm tra ghế đã được đặt chưa
        $bookedSeatIds = Booking::where('showtime_id', $request->showtime_id)
            ->whereIn('status', ['pending', 'paid'])
            ->with('tickets')
            ->get()
            ->pluck('tickets')
            ->flatten()
            ->pluck('seat_id')
            ->toArray();

        $conflictSeats = array_intersect($request->seat_ids, $bookedSeatIds);
        if (!empty($conflictSeats)) {
            return response()->json([
                'message' => 'Một số ghế đã được đặt, vui lòng chọn ghế khác.',
                'conflict_seats' => $conflictSeats,
            ], 422);
        }

        // Tính tổng tiền vé
        $showtime = \App\Models\Showtime::findOrFail($request->showtime_id);
        $seats = Seat::whereIn('id', $request->seat_ids)->get();
        $totalTicketAmount = 0;
        $ticketsData = [];

        foreach ($seats as $seat) {
            $price = $showtime->base_price;
            if ($seat->type === 'vip') {
                $price *= 1.3; // VIP +30%
            } elseif ($seat->type === 'couple') {
                $price *= 1.5; // Couple +50%
            }

            $ticketsData[] = [
                'seat_id' => $seat->id,
                'seat_label' => $seat->row . $seat->column_num,
                'seat_type' => $seat->type,
                'price' => $price,
            ];
            $totalTicketAmount += $price;
        }

        // Tính tổng tiền combo
        $totalComboAmount = 0;
        $combosData = [];
        if ($request->has('combos') && !empty($request->combos)) {
            foreach ($request->combos as $comboItem) {
                $combo = \App\Models\Combo::findOrFail($comboItem['combo_id']);
                $combosData[] = [
                    'combo_id' => $combo->id,
                    'quantity' => $comboItem['quantity'],
                    'unit_price' => $combo->price,
                ];
                $totalComboAmount += $combo->price * $comboItem['quantity'];
            }
        }

        // Tính giảm giá
        $discountAmount = 0;
        if ($request->promotion_id) {
            $promotion = \App\Models\Promotion::find($request->promotion_id);
            if ($promotion && $promotion->used_count < ($promotion->usage_limit ?? PHP_INT_MAX)
                && now()->between($promotion->valid_from, $promotion->valid_to)) {
                $discountAmount = ($totalTicketAmount + $totalComboAmount) * $promotion->discount_percent / 100;
                if ($promotion->max_discount) {
                    $discountAmount = min($discountAmount, $promotion->max_discount);
                }
                $promotion->increment('used_count');
            }
        }

        $totalAmount = $totalTicketAmount + $totalComboAmount;
        $finalAmount = $totalAmount - $discountAmount;

        // Tạo booking
        $booking = Booking::create([
            'booking_code' => 'TC' . strtoupper(Str::random(8)),
            'user_id' => $user->id,
            'showtime_id' => $request->showtime_id,
            'promotion_id' => $request->promotion_id,
            'total_amount' => $totalAmount,
            'discount_amount' => $discountAmount,
            'final_amount' => $finalAmount,
            'status' => 'pending',
        ]);

        // Tạo tickets
        foreach ($ticketsData as $ticketData) {
            $booking->tickets()->create($ticketData);
        }

        // Tạo booking combos
        foreach ($combosData as $comboData) {
            $booking->bookingCombos()->create($comboData);
        }

        $booking->load(['tickets', 'bookingCombos.combo', 'showtime.movie', 'showtime.room.cinema']);

        return response()->json([
            'message' => 'Đặt vé thành công',
            'data' => $booking,
        ], 201);
    }

    /**
     * API #32: Lấy lịch sử đặt vé của user
     * GET /api/bookings/my
     */
    public function myBookings(Request $request)
    {
        $bookings = Booking::where('user_id', $request->user()->id)
            ->with(['showtime.movie', 'showtime.room.cinema', 'tickets', 'bookingCombos.combo', 'payment'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json($bookings);
    }

    /**
     * API #33: Chi tiết đơn đặt vé
     * GET /api/bookings/{id}
     */
    public function show($id, Request $request)
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with(['showtime.movie', 'showtime.room.cinema', 'tickets', 'bookingCombos.combo', 'payment'])
            ->firstOrFail();

        return response()->json(['data' => $booking]);
    }

    /**
     * API #34: Hủy đơn đặt vé
     * PUT /api/bookings/{id}/cancel
     */
    public function cancel($id, Request $request)
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Chỉ có thể hủy đơn đang chờ thanh toán.',
            ], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Hủy đơn đặt vé thành công',
            'data' => $booking->fresh(),
        ]);
    }
}
