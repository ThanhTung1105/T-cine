<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_projection_format', function (Blueprint $table) {
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('projection_format_id')->constrained('projection_formats')->onDelete('cascade');
            $table->primary(['room_id', 'projection_format_id']);
        });

        // Cấu hình mặc định: Ghép tất cả phòng chiếu hiện tại với tất cả định dạng để tránh lỗi trống định dạng
        $rooms = DB::table('rooms')->get();
        $formats = DB::table('projection_formats')->get();
        $inserts = [];
        foreach ($rooms as $room) {
            foreach ($formats as $format) {
                $inserts[] = [
                    'room_id' => $room->id,
                    'projection_format_id' => $format->id
                ];
            }
        }
        if (!empty($inserts)) {
            DB::table('room_projection_format')->insert($inserts);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_projection_format');
    }
};
