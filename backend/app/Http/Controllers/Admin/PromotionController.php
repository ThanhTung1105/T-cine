<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    /**
     * API #48: [Admin] Lấy danh sách khuyến mãi
     * GET /api/admin/promotions
     */
    public function index(Request $request)
    {
        $promotions = Promotion::orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($promotions);
    }

    /**
     * API #49: [Admin] Thêm khuyến mãi
     * POST /api/admin/promotions
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:50|unique:promotions',
            'discount_percent' => 'required|integer|min:1|max:100',
            'max_discount' => 'nullable|numeric|min:0',
            'valid_from' => 'required|date',
            'valid_to' => 'required|date|after:valid_from',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        $data = $request->all();
        $data['used_count'] = 0;

        $promotion = Promotion::create($data);

        return response()->json([
            'message' => 'Thêm khuyến mãi thành công',
            'data' => $promotion,
        ], 201);
    }

    /**
     * API #50: [Admin] Cập nhật khuyến mãi
     * PUT /api/admin/promotions/{id}
     */
    public function update(Request $request, $id)
    {
        $promotion = Promotion::findOrFail($id);

        $request->validate([
            'code' => 'sometimes|string|max:50|unique:promotions,code,' . $id,
            'discount_percent' => 'sometimes|integer|min:1|max:100',
            'valid_to' => 'sometimes|date',
        ]);

        $promotion->update($request->all());

        return response()->json([
            'message' => 'Cập nhật khuyến mãi thành công',
            'data' => $promotion->fresh(),
        ]);
    }

    /**
     * API #51: [Admin] Xóa khuyến mãi
     * DELETE /api/admin/promotions/{id}
     */
    public function destroy($id)
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->delete();

        return response()->json(['message' => 'Xóa khuyến mãi thành công']);
    }
}
