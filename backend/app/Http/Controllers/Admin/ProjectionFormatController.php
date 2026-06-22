<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProjectionFormat;
use App\Models\Showtime;
use Illuminate\Http\Request;

class ProjectionFormatController extends Controller
{
    /**
     * Lấy danh sách tất cả định dạng
     * GET /api/admin/projection-formats
     */
    public function index()
    {
        $formats = ProjectionFormat::orderBy('created_at', 'desc')->get();
        return response()->json($formats);
    }

    /**
     * Thêm định dạng mới
     * POST /api/admin/projection-formats
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:projection_formats,name',
        ], [
            'name.required' => 'Tên định dạng không được để trống.',
            'name.unique' => 'Tên định dạng này đã tồn tại trong hệ thống.',
        ]);

        $format = ProjectionFormat::create($data);

        return response()->json([
            'message' => 'Thêm định dạng phòng chiếu thành công',
            'data' => $format
        ], 201);
    }

    /**
     * Cập nhật định dạng
     * PUT /api/admin/projection-formats/{id}
     */
    public function update(Request $request, $id)
    {
        $format = ProjectionFormat::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:projection_formats,name,' . $id,
        ], [
            'name.required' => 'Tên định dạng không được để trống.',
            'name.unique' => 'Tên định dạng này đã tồn tại trong hệ thống.',
        ]);

        $format->update($data);

        return response()->json([
            'message' => 'Cập nhật định dạng phòng chiếu thành công',
            'data' => $format
        ]);
    }

    /**
     * Xóa định dạng
     * DELETE /api/admin/projection-formats/{id}
     */
    public function destroy($id)
    {
        $format = ProjectionFormat::findOrFail($id);

        // Kiểm tra xem có suất chiếu nào đang sử dụng định dạng này không
        $inUse = Showtime::where('projection_format_id', $id)->exists();
        if ($inUse) {
            return response()->json([
                'message' => 'Không thể xóa định dạng này vì đang có lịch chiếu sử dụng.'
            ], 400);
        }

        $format->delete();

        return response()->json([
            'message' => 'Xóa định dạng phòng chiếu thành công'
        ]);
    }

    /**
     * Cập nhật hàng loạt phụ thu định dạng chiếu
     * PUT /api/admin/projection-formats/surcharges
     */
    public function bulkUpdateSurcharges(Request $request)
    {
        $request->validate([
            'formats' => 'required|array',
            'formats.*.id' => 'required|exists:projection_formats,id',
            'formats.*.surcharge' => 'required|integer|min:0',
        ], [
            'formats.required' => 'Danh sách cập nhật phụ thu không được để trống.',
            'formats.*.id.exists' => 'Một hoặc nhiều định dạng không tồn tại.',
            'formats.*.surcharge.integer' => 'Số tiền phụ thu phải là số nguyên.',
            'formats.*.surcharge.min' => 'Số tiền phụ thu không được nhỏ hơn 0.',
        ]);

        \DB::transaction(function () use ($request) {
            foreach ($request->formats as $item) {
                ProjectionFormat::where('id', $item['id'])->update([
                    'surcharge' => $item['surcharge']
                ]);
            }
        });

        return response()->json([
            'message' => 'Cập nhật phụ thu định dạng chiếu thành công.',
            'data' => ProjectionFormat::orderBy('created_at', 'desc')->get()
        ]);
    }
}
