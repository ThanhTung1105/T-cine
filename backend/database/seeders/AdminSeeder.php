<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Tạo tài khoản Admin mặc định.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@tcine.com'],
            [
                'name' => 'Admin T-CINE',
                'password' => Hash::make('admin123'),
                'phone' => '0900000000',
                'role' => 'admin',
            ]
        );

        $this->command->info('✅ Tài khoản Admin đã tạo:');
        $this->command->info('   Email: admin@tcine.com');
        $this->command->info('   Mật khẩu: admin123');
    }
}
