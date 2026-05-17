<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use Illuminate\Http\Request;

class ComboController extends Controller
{
    /**
     * API #44: [Admin] Thêm combo
     * POST /api/admin/combos
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:255',
        ]);

        $combo = Combo::create($request->all());

        return response()->json([
            'message' => 'Thêm combo thành công',
            'data' => $combo,
        ], 201);
    }

    /**
     * API #45: [Admin] Cập nhật combo
     * PUT /api/admin/combos/{id}
     */
    public function update(Request $request, $id)
    {
        $combo = Combo::findOrFail($id);
        $combo->update($request->all());

        return response()->json([
            'message' => 'Cập nhật combo thành công',
            'data' => $combo->fresh(),
        ]);
    }

    /**
     * API #46: [Admin] Xóa combo
     * DELETE /api/admin/combos/{id}
     */
    public function destroy($id)
    {
        $combo = Combo::findOrFail($id);
        $combo->delete();

        return response()->json(['message' => 'Xóa combo thành công']);
    }
}
