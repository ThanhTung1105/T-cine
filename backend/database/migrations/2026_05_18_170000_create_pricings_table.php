<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bảng giá vé tập trung — toàn hệ thống dùng chung 9 dòng:
     * (seat_type × day_type). Showtime không còn `base_price` riêng nữa.
     */
    public function up(): void
    {
        Schema::create('pricings', function (Blueprint $table) {
            $table->id();
            $table->enum('seat_type', ['normal', 'vip', 'couple']);
            $table->enum('day_type', ['weekday', 'weekend', 'holiday']);
            $table->decimal('price', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['seat_type', 'day_type'], 'pricings_seat_day_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricings');
    }
};
