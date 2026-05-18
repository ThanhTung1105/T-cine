<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->unique(['cinema_id', 'name'], 'rooms_cinema_id_name_unique');
        });

        Schema::table('seats', function (Blueprint $table) {
            $table->unique(['room_id', 'row', 'column_num'], 'seats_room_row_col_unique');
        });

        Schema::table('booking_combos', function (Blueprint $table) {
            $table->unique(['booking_id', 'combo_id'], 'booking_combos_booking_combo_unique');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->index(['category', 'is_active', 'start_date'], 'events_category_active_start_idx');
        });

        $this->addCheck('promotions', 'promotions_discount_percent_check', 'discount_percent >= 1 AND discount_percent <= 100');
        $this->addCheck('promotions', 'promotions_valid_date_check', 'valid_to >= valid_from');
        $this->addCheck('promotions', 'promotions_used_count_check', 'used_count >= 0');
        $this->addCheck('promotions', 'promotions_usage_limit_check', '(usage_limit IS NULL OR usage_limit >= 1)');
        $this->addCheck('promotions', 'promotions_usage_bounds_check', '(usage_limit IS NULL OR used_count <= usage_limit)');

        $this->addCheck('events', 'events_category_check', "category IN ('promotion', 'member', 'news')");
        $this->addCheck('events', 'events_date_range_check', '(start_date IS NULL OR end_date IS NULL OR end_date >= start_date)');

        $this->addCheck('showtimes', 'showtimes_time_range_check', 'end_time > start_time');
    }

    public function down(): void
    {
        $this->dropCheck('showtimes', 'showtimes_time_range_check');

        $this->dropCheck('events', 'events_date_range_check');
        $this->dropCheck('events', 'events_category_check');

        $this->dropCheck('promotions', 'promotions_usage_bounds_check');
        $this->dropCheck('promotions', 'promotions_usage_limit_check');
        $this->dropCheck('promotions', 'promotions_used_count_check');
        $this->dropCheck('promotions', 'promotions_valid_date_check');
        $this->dropCheck('promotions', 'promotions_discount_percent_check');

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_category_active_start_idx');
        });

        Schema::table('booking_combos', function (Blueprint $table) {
            $table->dropUnique('booking_combos_booking_combo_unique');
        });

        Schema::table('seats', function (Blueprint $table) {
            $table->dropUnique('seats_room_row_col_unique');
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropUnique('rooms_cinema_id_name_unique');
        });
    }

    private function addCheck(string $table, string $constraint, string $expression): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `{$table}` ADD CONSTRAINT `{$constraint}` CHECK ({$expression})");
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$constraint} CHECK ({$expression})");
        }
    }

    private function dropCheck(string $table, string $constraint): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `{$table}` DROP CHECK `{$constraint}`");
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE {$table} DROP CONSTRAINT IF EXISTS {$constraint}");
        }
    }
};
