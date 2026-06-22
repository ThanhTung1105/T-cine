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
     * POST /api/admin/cinemas/{cinemaId}/rooms/{roomId}/seats/bulk-update
     * Cập nhật hàng loạt (loại hoặc trạng thái) cho nhiều ghế.
     */
    public function bulkUpdateSeats(Request $request, $cinemaId, $roomId)
    {
        $request->validate([
            'ids'    => 'required|array',
            'ids.*'  => 'integer',
            'type'   => 'nullable|in:normal,vip',
            'status' => 'nullable|in:active,broken',
        ]);

        $room = Room::where('cinema_id', $cinemaId)->findOrFail($roomId);
        $ids = $request->input('ids');
        $type = $request->input('type');
        $status = $request->input('status');

        $result = DB::transaction(function () use ($room, $ids, $type, $status) {
            // Check if any of these seats has tickets
            $hasTickets = DB::table('tickets')
                ->whereIn('seat_id', $ids)
                ->exists();

            if ($hasTickets) {
                return [
                    'success' => false,
                    'message' => 'Không thể thay đổi loại hoặc trạng thái vì một số ghế đã có vé đặt.',
                    'code' => 422
                ];
            }

            // Find matching seats
            $seats = $room->seats()->whereIn('id', $ids)->get();

            foreach ($seats as $seat) {
                // If we are changing type, we must make sure the seat is not a couple seat.
                // Couple seats cannot be directly converted to normal/vip using bulk update (they must be split first).
                if ($type !== null) {
                    if ($seat->type === 'couple') {
                        return [
                            'success' => false,
                            'message' => 'Không thể trực tiếp đổi loại ghế đôi. Vui lòng tách ghế trước.',
                            'code' => 422
                        ];
                    }
                    if ($seat->status === 'broken') {
                        return [
                            'success' => false,
                            'message' => 'Không thể thay đổi loại của ghế đang bị hỏng. Vui lòng đặt hoạt động lại trước.',
                            'code' => 422
                        ];
                    }
                    $seat->type = $type;
                }
                
                if ($status !== null) {
                    $seat->status = $status;
                }

                $seat->save();
            }

            // Check capacity limit
            $capacity = (int) $room->capacity;
            $seatsList = $room->seats()->get();
            $effectiveSeats = $seatsList->whereIn('type', ['normal', 'vip'])->count()
                + ($seatsList->where('type', 'couple')->count() * 2);

            if ($effectiveSeats > $capacity) {
                return [
                    'success' => false,
                    'message' => "Tổng chỗ ngồi ({$effectiveSeats} chỗ) vượt quá sức chứa phòng ({$capacity}).",
                    'code' => 422
                ];
            }

            return ['success' => true];
        });

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], $result['code']);
        }

        $seats = $room->seats()->orderBy('row')->orderBy('column_num')->get();

        return response()->json([
            'message' => 'Cập nhật ghế hàng loạt thành công',
            'data'    => [
                'seats' => $seats,
            ],
        ]);
    }

    /**
     * POST /api/admin/cinemas/{cinemaId}/rooms/{roomId}/seats/merge
     * Ghép 2 ghế đơn liền kề cùng hàng thành 1 ghế đôi.
     */
    public function mergeSeats(Request $request, $cinemaId, $roomId)
    {
        $request->validate([
            'seat_ids'   => 'required|array|size:2',
            'seat_ids.*' => 'integer',
        ]);

        $room = Room::where('cinema_id', $cinemaId)->findOrFail($roomId);
        $seatIds = $request->input('seat_ids');

        $result = DB::transaction(function () use ($room, $seatIds) {
            $seats = $room->seats()->whereIn('id', $seatIds)->get();

            if ($seats->count() !== 2) {
                return [
                    'success' => false,
                    'message' => 'Vui lòng chọn chính xác 2 ghế của phòng này.',
                    'code' => 422
                ];
            }

            $seat1 = $seats->first();
            $seat2 = $seats->last();

            // 1. Must be in the same row
            if ($seat1->row !== $seat2->row) {
                return [
                    'success' => false,
                    'message' => 'Hai ghế được chọn phải nằm cùng một hàng.',
                    'code' => 422
                ];
            }

            // 2. Must be single seats (normal or vip)
            if ($seat1->type === 'couple' || $seat2->type === 'couple') {
                return [
                    'success' => false,
                    'message' => 'Chỉ có thể ghép hai ghế đơn thường hoặc VIP.',
                    'code' => 422
                ];
            }

            // 2.5. Must not be broken
            if ($seat1->status === 'broken' || $seat2->status === 'broken') {
                return [
                    'success' => false,
                    'message' => 'Không thể ghép ghế đang bị hỏng. Vui lòng đặt hoạt động lại trước.',
                    'code' => 422
                ];
            }

            // 3. Columns must be adjacent
            if (abs($seat1->column_num - $seat2->column_num) !== 1) {
                return [
                    'success' => false,
                    'message' => 'Hai ghế được chọn phải liền kề nhau.',
                    'code' => 422
                ];
            }

            // 4. Must not have any tickets
            $hasTickets = DB::table('tickets')
                ->whereIn('seat_id', $seatIds)
                ->exists();

            if ($hasTickets) {
                return [
                    'success' => false,
                    'message' => 'Không thể ghép ghế vì ghế được chọn đã có vé đặt.',
                    'code' => 422
                ];
            }

            // Sort so we know which is left (smaller column) and which is right (larger column)
            $leftSeat = $seat1->column_num < $seat2->column_num ? $seat1 : $seat2;
            $rightSeat = $seat1->column_num > $seat2->column_num ? $seat1 : $seat2;

            // Delete the right seat
            $rightSeat->delete();

            // Update the left seat to couple
            $leftSeat->type = 'couple';
            $leftSeat->save();

            // Check capacity limit
            $capacity = (int) $room->capacity;
            $seatsList = $room->seats()->get();
            $effectiveSeats = $seatsList->whereIn('type', ['normal', 'vip'])->count()
                + ($seatsList->where('type', 'couple')->count() * 2);

            if ($effectiveSeats > $capacity) {
                return [
                    'success' => false,
                    'message' => "Tổng chỗ ngồi ({$effectiveSeats} chỗ) vượt quá sức chứa phòng ({$capacity}).",
                    'code' => 422
                ];
            }

            return ['success' => true];
        });

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], $result['code']);
        }

        $seats = $room->seats()->orderBy('row')->orderBy('column_num')->get();

        return response()->json([
            'message' => 'Ghép ghế đôi thành công',
            'data'    => [
                'seats' => $seats,
            ],
        ]);
    }

    /**
     * POST /api/admin/cinemas/{cinemaId}/rooms/{roomId}/seats/split
     * Tách 1 ghế đôi thành 2 ghế đơn.
     */
    public function splitSeat(Request $request, $cinemaId, $roomId)
    {
        $request->validate([
            'seat_id' => 'required|integer',
        ]);

        $room = Room::where('cinema_id', $cinemaId)->findOrFail($roomId);
        $seatId = $request->input('seat_id');

        $result = DB::transaction(function () use ($room, $seatId) {
            $seat = $room->seats()->findOrFail($seatId);

            if ($seat->type !== 'couple') {
                return [
                    'success' => false,
                    'message' => 'Ghế được chọn không phải là ghế đôi.',
                    'code' => 422
                ];
            }

            // 1.5. Must not be broken
            if ($seat->status === 'broken') {
                return [
                    'success' => false,
                    'message' => 'Không thể tách ghế đôi đang bị hỏng. Vui lòng đặt hoạt động lại trước.',
                    'code' => 422
                ];
            }

            // Check if the seat has tickets
            if ($seat->tickets()->exists()) {
                return [
                    'success' => false,
                    'message' => 'Không thể tách ghế đôi vì ghế này đã có vé đặt.',
                    'code' => 422
                ];
            }

            // Create the adjacent seat (column_num + 1)
            $adjacentCol = $seat->column_num + 1;
            $adjacentExists = $room->seats()
                ->where('row', $seat->row)
                ->where('column_num', $adjacentCol)
                ->exists();

            if (!$adjacentExists) {
                $room->seats()->create([
                    'row'        => $seat->row,
                    'column_num' => $adjacentCol,
                    'type'       => 'normal',
                    'status'     => 'active',
                ]);
            }

            // Update current seat to normal
            $seat->type = 'normal';
            $seat->save();

            // Check capacity limit
            $capacity = (int) $room->capacity;
            $seatsList = $room->seats()->get();
            $effectiveSeats = $seatsList->whereIn('type', ['normal', 'vip'])->count()
                + ($seatsList->where('type', 'couple')->count() * 2);

            if ($effectiveSeats > $capacity) {
                return [
                    'success' => false,
                    'message' => "Tổng chỗ ngồi ({$effectiveSeats} chỗ) vượt quá sức chứa phòng ({$capacity}).",
                    'code' => 422
                ];
            }

            return ['success' => true];
        });

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], $result['code']);
        }

        $seats = $room->seats()->orderBy('row')->orderBy('column_num')->get();

        return response()->json([
            'message' => 'Tách ghế thành công',
            'data'    => [
                'seats' => $seats,
            ],
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
