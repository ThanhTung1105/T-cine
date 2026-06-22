<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cinema;
use App\Models\Room;
use Illuminate\Http\Request;

class CinemaController extends Controller
{
    /**
     * API #18: [Admin] Thêm rạp mới
     * POST /api/admin/cinemas
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'total_screens' => 'nullable|integer',
        ]);

        $cinema = Cinema::create($request->all());

        return response()->json([
            'message' => 'Thêm rạp thành công',
            'data' => $cinema,
        ], 201);
    }

    /**
     * API #19: [Admin] Cập nhật rạp
     * PUT /api/admin/cinemas/{id}
     */
    public function update(Request $request, $id)
    {
        $cinema = Cinema::findOrFail($id);
        $cinema->update($request->all());

        return response()->json([
            'message' => 'Cập nhật rạp thành công',
            'data' => $cinema->fresh(),
        ]);
    }

    /**
     * API #20: [Admin] Xóa rạp
     * DELETE /api/admin/cinemas/{id}
     */
    public function destroy($id)
    {
        $cinema = Cinema::findOrFail($id);
        $cinema->delete();

        return response()->json(['message' => 'Xóa rạp thành công']);
    }

    /**
     * API #21: [Admin] Thêm phòng chiếu
     * POST /api/admin/cinemas/{id}/rooms
     */
    public function storeRoom(Request $request, $id)
    {
        $cinema = Cinema::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'projection_format_ids' => 'nullable|array',
            'projection_format_ids.*' => 'exists:projection_formats,id',
        ], [
            'projection_format_ids.array' => 'Định dạng chiếu phải là danh sách.',
            'projection_format_ids.*.exists' => 'Một hoặc nhiều định dạng chiếu không hợp lệ.',
        ]);

        $room = $cinema->rooms()->create($request->only(['name', 'capacity']));

        if ($request->has('projection_format_ids')) {
            $room->projectionFormats()->sync($request->projection_format_ids);
        }

        $room->load('projectionFormats');

        return response()->json([
            'message' => 'Thêm phòng chiếu thành công',
            'data' => $room,
        ], 201);
    }

    /**
     * API #22: [Admin] Cập nhật phòng chiếu
     * PUT /api/admin/cinemas/{id}/rooms/{roomId}
     */
    public function updateRoom(Request $request, $id, $roomId)
    {
        $room = Room::where('cinema_id', $id)->findOrFail($roomId);

        $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'capacity' => 'sometimes|required|integer|min:1',
            'projection_format_ids' => 'nullable|array',
            'projection_format_ids.*' => 'exists:projection_formats,id',
        ], [
            'projection_format_ids.array' => 'Định dạng chiếu phải là danh sách.',
            'projection_format_ids.*.exists' => 'Một hoặc nhiều định dạng chiếu không hợp lệ.',
        ]);

        $room->update($request->only(['name', 'capacity']));

        if ($request->has('projection_format_ids')) {
            $room->projectionFormats()->sync($request->projection_format_ids);
        }

        $room->load('projectionFormats');

        return response()->json([
            'message' => 'Cập nhật phòng chiếu thành công',
            'data' => $room,
        ]);
    }

    /**
     * API #23: [Admin] Xóa phòng chiếu
     * DELETE /api/admin/cinemas/{id}/rooms/{roomId}
     */
    public function destroyRoom($id, $roomId)
    {
        $room = Room::where('cinema_id', $id)->findOrFail($roomId);
        $room->delete();

        return response()->json(['message' => 'Xóa phòng chiếu thành công']);
    }
}
