<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeatController extends Controller
{
    /**
     * GET /api/admin/cinemas/{cinemaId}/rooms/{roomId}/seats
     * Lấy toàn bộ ghế của phòng
     */
    public function index($cinemaId, $roomId)
    {
        $room = Room::where('cinema_id', $cinemaId)->findOrFail($roomId);

        $seats = $room->seats()
            ->orderBy('row')
            ->orderBy('column_num')
            ->get();

        return response()->json([
            'data' => [
                'room'  => $room,
                'seats' => $seats,
            ],
        ]);
    }

    /**
     * POST /api/admin/cinemas/{cinemaId}/rooms/{roomId}/seats/generate
     * Tạo sơ đồ ghế. Admin nhập số hàng × số ghế/hàng.
     * Điều kiện: tổng ghế (rows × columns) KHÔNG được vượt `room.capacity` (sức chứa tối đa).
     * KHÔNG đụng tới room.capacity — đó là thuộc tính cố định khi tạo phòng.
     *
     * Body params:
     *  - rows: int (1..26)
     *  - columns: int (1..30) — số ghế mỗi hàng
     *  - vip_rows: array of letters (vd: ["D","E","F"])
     *  - couple_rows: array of letters (vd: ["H"])
     *  - clear_existing: bool (mặc định true — xoá ghế cũ rồi tạo lại)
     */
    public function generate(Request $request, $cinemaId, $roomId)
    {
        $request->validate([
            'rows'           => 'required|integer|min:1|max:26',
            'columns'        => 'required|integer|min:1|max:30',
            'vip_rows'       => 'nullable|array',
            'vip_rows.*'     => 'string|size:1',
            'couple_rows'    => 'nullable|array',
            'couple_rows.*'  => 'string|size:1',
            'clear_existing' => 'nullable|boolean',
        ]);

        $room = Room::where('cinema_id', $cinemaId)->findOrFail($roomId);

        $capacity = (int) $room->capacity;
        if ($capacity <= 0) {
            return response()->json([
                'message' => 'Phòng chưa có sức chứa (capacity). Vui lòng cập nhật sức chứa phòng trước khi tạo sơ đồ ghế.',
            ], 422);
        }

        $rows    = (int) $request->input('rows');
        $columns = (int) $request->input('columns');

        $vipRows    = collect($request->input('vip_rows', []))->map(fn ($r) => strtoupper($r))->all();
        $coupleRows = collect($request->input('couple_rows', []))->map(fn ($r) => strtoupper($r))->all();
        $clearExist = $request->boolean('clear_existing', true);

        // Số hàng ghế đôi nằm trong phạm vi sơ đồ
        $coupleRowsInRange = collect($coupleRows)
            ->filter(fn ($r) => ord($r) - 65 < $rows)
            ->count();

        // Mỗi ghế đôi rộng = 2 ghế thường → 1 hàng đôi chỉ chứa floor(columns / 2) ghế.
        $seatsPerCoupleRow = intdiv($columns, 2);

        // Tổng số ghế thực tế tạo
        $total = ($rows - $coupleRowsInRange) * $columns + $coupleRowsInRange * $seatsPerCoupleRow;

        // Tổng chỗ ngồi (ghế đôi = 2 chỗ)
        $effectiveSeats = ($rows - $coupleRowsInRange) * $columns + $coupleRowsInRange * $seatsPerCoupleRow * 2;

        if ($effectiveSeats > $capacity) {
            return response()->json([
                'message' => "Sức chứa dùng ({$effectiveSeats} chỗ) vượt quá sức chứa phòng ({$capacity}). Hãy giảm số hàng/cột, bớt hàng ghế đôi, hoặc tăng sức chứa phòng.",
            ], 422);
        }

        DB::transaction(function () use ($room, $rows, $columns, $seatsPerCoupleRow, $vipRows, $coupleRows, $clearExist) {
            if ($clearExist) {
                $room->seats()->delete();
            }

            $bulk = [];
            $now  = now();

            for ($i = 0; $i < $rows; $i++) {
                $rowLabel = chr(65 + $i);
                $isCouple = in_array($rowLabel, $coupleRows, true);
                $isVip    = !$isCouple && in_array($rowLabel, $vipRows, true);
                $type     = $isCouple ? 'couple' : ($isVip ? 'vip' : 'normal');

                // Hàng đôi chỉ có floor(columns/2) ghế (mỗi ghế rộng = 2 ghế thường)
                $seatsInThisRow = $isCouple ? $seatsPerCoupleRow : $columns;
                if ($seatsInThisRow <= 0) {
                    continue;
                }

                for ($c = 1; $c <= $seatsInThisRow; $c++) {
                    $bulk[] = [
                        'room_id'    => $room->id,
                        'row'        => $rowLabel,
                        'column_num' => $c,
                        'type'       => $type,
                        'status'     => 'active',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            // KHÔNG cập nhật capacity — capacity là sức chứa tối đa cố định.
            foreach (array_chunk($bulk, 200) as $chunk) {
                Seat::insert($chunk);
            }
        });

        $seats = $room->seats()->orderBy('row')->orderBy('column_num')->get();

        // Lưu ý nếu columns lẻ và có hàng đôi → mất chỗ vì làm tròn xuống
        $note = '';
        if ($coupleRowsInRange > 0 && $columns % 2 === 1) {
            $lost = $coupleRowsInRange;
            $note = " (Lưu ý: chọn {$columns} cột lẻ kèm hàng đôi nên mất {$lost} chỗ làm tròn — nên chọn số cột chẵn)";
        }

        return response()->json([
            'message' => "Đã tạo sơ đồ ghế thành công ({$total} ghế / {$effectiveSeats} chỗ / sức chứa {$capacity})" . $note,
            'data'    => [
                'room'  => $room->fresh(),
                'seats' => $seats,
            ],
        ]);
    }

    /**
     * PUT /api/admin/cinemas/{cinemaId}/rooms/{roomId}/seats/{seatId}
     * Cập nhật 1 ghế (đổi loại / trạng thái)
     */
    public function update(Request $request, $cinemaId, $roomId, $seatId)
    {
        $request->validate([
            'type'   => 'nullable|in:normal,vip,couple',
            'status' => 'nullable|in:active,broken',
        ]);

        $room = Room::where('cinema_id', $cinemaId)->findOrFail($roomId);
        $seat = $room->seats()->findOrFail($seatId);

        $seat->update($request->only(['type', 'status']));

        return response()->json([
            'message' => 'Cập nhật ghế thành công',
            'data'    => $seat->fresh(),
        ]);
    }

    /**
     * DELETE /api/admin/cinemas/{cinemaId}/rooms/{roomId}/seats
     * Xoá toàn bộ ghế của phòng (reset sơ đồ).
     * KHÔNG đụng tới capacity vì đó là thuộc tính cố định của phòng.
     */
    public function destroyAll($cinemaId, $roomId)
    {
        $room = Room::where('cinema_id', $cinemaId)->findOrFail($roomId);
        $room->seats()->delete();

        return response()->json([
            'message' => 'Đã xoá toàn bộ ghế của phòng',
        ]);
    }
}
