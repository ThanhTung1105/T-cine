<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pricing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PricingController extends Controller
{
    /**
     * GET /api/admin/pricings
     * Trả về toàn bộ bảng giá hiện tại + dạng matrix tiện cho FE.
     */
    public function index()
    {
        $rows = Pricing::orderBy('seat_type')->orderBy('day_type')->get();

        return response()->json([
            'data'   => $rows,
            'matrix' => Pricing::asMatrix(),
        ]);
    }

    /**
     * PUT /api/admin/pricings
     * Body: { items: [ { seat_type, day_type, price, is_active }, ... ] }
     * Upsert hàng loạt 9 cell trong matrix giá.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'items'              => 'required|array|min:1|max:9',
            'items.*.seat_type'  => 'required|in:normal,vip,couple',
            'items.*.day_type'   => 'required|in:weekday,weekend,holiday',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.is_active'  => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->input('items') as $item) {
                Pricing::updateOrCreate(
                    [
                        'seat_type' => $item['seat_type'],
                        'day_type'  => $item['day_type'],
                    ],
                    [
                        'price'     => $item['price'],
                        'is_active' => $item['is_active'] ?? true,
                    ],
                );
            }
        });

        return response()->json([
            'message' => 'Cập nhật bảng giá vé thành công',
            'data'    => Pricing::orderBy('seat_type')->orderBy('day_type')->get(),
            'matrix'  => Pricing::asMatrix(),
        ]);
    }

    /**
     * GET /api/admin/holidays
     * Lấy danh sách ngày lễ.
     */
    public function getHolidays()
    {
        $holidays = \App\Models\Holiday::orderBy('date', 'asc')->get();
        return response()->json([
            'data' => $holidays,
        ]);
    }

    /**
     * POST /api/admin/holidays
     * Thêm ngày lễ mới.
     */
    public function saveHoliday(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'name' => 'nullable|string|max:255',
        ], [
            'date.unique' => 'Ngày này đã được cấu hình là ngày lễ rồi.',
        ]);

        $holiday = \App\Models\Holiday::create($data);

        return response()->json([
            'message' => 'Thêm ngày lễ thành công',
            'data'    => $holiday,
        ], 201);
    }

    /**
     * DELETE /api/admin/holidays/{id}
     * Xóa ngày lễ.
     */
    public function deleteHoliday($id)
    {
        $holiday = \App\Models\Holiday::findOrFail($id);
        $holiday->delete();

        return response()->json([
            'message' => 'Xóa ngày lễ thành công',
        ]);
    }
}
