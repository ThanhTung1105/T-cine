<?php

namespace App\Http\Controllers;

use App\Models\Pricing;

class PricingController extends Controller
{
    /**
     * GET /api/pricings/active
     * Trả về bảng giá đang áp dụng dạng matrix:
     *   { normal: { weekday, weekend, holiday }, vip: {...}, couple: {...} }
     * Public — FE customer dùng để hiển thị legend giá theo loại ghế / loại ngày.
     */
    public function active()
    {
        return response()->json([
            'data' => Pricing::asMatrix(),
        ]);
    }
}
