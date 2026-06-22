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
        // 1. Tạo bảng projection_formats
        Schema::create('projection_formats', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // 2. Seed dữ liệu định dạng mặc định
        $now = now();
        DB::table('projection_formats')->insert([
            ['name' => '2D Vietsub', 'created_at' => $now, 'updated_at' => $now],
            ['name' => '2D Lồng Tiếng', 'created_at' => $now, 'updated_at' => $now],
            ['name' => '3D Vietsub', 'created_at' => $now, 'updated_at' => $now],
            ['name' => '3D Lồng Tiếng', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 3. Thêm cột projection_format_id vào showtimes (không null, default 1)
        Schema::table('showtimes', function (Blueprint $table) {
            $table->foreignId('projection_format_id')->default(1)->constrained('projection_formats')->onDelete('restrict');
        });

        // 4. Di chuyển dữ liệu cũ từ cột projection_format sang projection_format_id
        if (Schema::hasColumn('showtimes', 'projection_format')) {
            $showtimes = DB::table('showtimes')->get();
            foreach ($showtimes as $showtime) {
                $formatId = DB::table('projection_formats')
                    ->where('name', $showtime->projection_format)
                    ->value('id');

                if ($formatId) {
                    DB::table('showtimes')
                        ->where('id', $showtime->id)
                        ->update(['projection_format_id' => $formatId]);
                }
            }

            // 5. Xóa cột projection_format cũ ở showtimes
            Schema::table('showtimes', function (Blueprint $table) {
                $table->dropColumn('projection_format');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Thêm lại cột projection_format cũ
        Schema::table('showtimes', function (Blueprint $table) {
            $table->string('projection_format')->default('2D Vietsub');
        });

        // 2. Chuyển đổi ngược dữ liệu
        $showtimes = DB::table('showtimes')->get();
        foreach ($showtimes as $showtime) {
            $formatName = DB::table('projection_formats')
                ->where('id', $showtime->projection_format_id)
                ->value('name');

            if (!$formatName) {
                $formatName = '2D Vietsub';
            }

            DB::table('showtimes')
                ->where('id', $showtime->id)
                ->update(['projection_format' => $formatName]);
        }

        // 3. Xóa khóa ngoại và cột projection_format_id
        Schema::table('showtimes', function (Blueprint $table) {
            $table->dropForeign(['projection_format_id']);
            $table->dropColumn('projection_format_id');
        });

        // 4. Xóa bảng projection_formats
        Schema::dropIfExists('projection_formats');
    }
};
