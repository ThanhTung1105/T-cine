<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * API: Xác nhận thanh toán (MÔ PHỎNG)
     * POST /api/bookings/{id}/confirm-payment
     *
     * Dự án chỉ MÔ PHỎNG cổng thanh toán (VNPay, MoMo, ZaloPay), không gọi API thật.
     * Endpoint này được FE gọi sau khi user bấm "Mô phỏng thanh toán thành công".
     */
    public function confirm($id, Request $request)
    {
        $request->validate([
            'method' => 'required|in:vnpay,momo,zalopay,counter',
        ]);

        $booking = Booking::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Đơn này không ở trạng thái chờ thanh toán.',
            ], 422);
        }

        $methodKey = $request->input('method');

        // Tạo payment record (giả lập giao dịch thành công)
        $payment = Payment::create([
            'booking_id'       => $booking->id,
            'method'           => $methodKey,
            'transaction_code' => strtoupper($methodKey) . '-' . strtoupper(Str::random(10)),
            'amount'           => $booking->final_amount,
            'status'           => 'success',
            'paid_at'          => now(),
        ]);

        // Cập nhật trạng thái đơn
        $booking->update(['status' => 'paid']);

        $booking->load([
            'tickets',
            'bookingCombos.combo',
            'showtime.movie',
            'showtime.room.cinema',
            'payment',
            'promotion',
        ]);

        return response()->json([
            'message' => 'Thanh toán mô phỏng thành công',
            'data'    => $booking,
            'payment' => $payment,
        ]);
    }
}
