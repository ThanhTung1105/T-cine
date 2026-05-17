<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    /**
     * API #47: Kiểm tra mã khuyến mãi
     * GET /api/promotions/check
     */
    public function check(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $promotion = Promotion::where('code', $request->code)->first();

        if (!$promotion) {
            return response()->json(['message' => 'Mã khuyến mãi không tồn tại.'], 404);
        }

        if (now()->lt($promotion->valid_from) || now()->gt($promotion->valid_to)) {
            return response()->json(['message' => 'Mã khuyến mãi đã hết hạn.'], 422);
        }

        if ($promotion->usage_limit && $promotion->used_count >= $promotion->usage_limit) {
            return response()->json(['message' => 'Mã khuyến mãi đã hết lượt sử dụng.'], 422);
        }

        return response()->json([
            'message' => 'Mã khuyến mãi hợp lệ',
            'data' => $promotion,
        ]);
    }
}
