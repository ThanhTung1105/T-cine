<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * API #37: Lấy thông tin cá nhân
     * GET /api/user/profile
     */
    public function profile(Request $request)
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }

    /**
     * API #38: Cập nhật thông tin cá nhân
     * PUT /api/user/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($request->only(['name', 'phone']));

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'data' => $user->fresh(),
        ]);
    }
}
