<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sau khi tách bảng giá ra `pricings`, cột `showtimes.base_price` không còn ý nghĩa.
     * Drop để loại bỏ dữ liệu lặp & sai source-of-truth.
     */
    public function up(): void
    {
        Schema::table('showtimes', function (Blueprint $table) {
            $table->dropColumn('base_price');
        });
    }

    public function down(): void
    {
        Schema::table('showtimes', function (Blueprint $table) {
            $table->decimal('base_price', 10, 2)->default(0);
        });
    }
};
