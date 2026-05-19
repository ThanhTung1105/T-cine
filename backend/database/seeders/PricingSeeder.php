<?php

namespace Database\Seeders;

use App\Models\Pricing;
use Illuminate\Database\Seeder;

class PricingSeeder extends Seeder
{
    /**
     * Seed 9 dòng giá vé mặc định (3 loại ghế × 3 loại ngày).
     * Dùng updateOrCreate để chạy seeder nhiều lần không bị trùng.
     */
    public function run(): void
    {
        $matrix = [
            'normal' => ['weekday' => 70000,  'weekend' => 90000,  'holiday' => 110000],
            'vip'    => ['weekday' => 100000, 'weekend' => 130000, 'holiday' => 160000],
            'couple' => ['weekday' => 160000, 'weekend' => 200000, 'holiday' => 250000],
        ];

        foreach ($matrix as $seatType => $byDay) {
            foreach ($byDay as $dayType => $price) {
                Pricing::updateOrCreate(
                    ['seat_type' => $seatType, 'day_type' => $dayType],
                    ['price' => $price, 'is_active' => true],
                );
            }
        }
    }
}
