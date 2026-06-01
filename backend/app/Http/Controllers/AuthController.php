<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * API #1: Đăng ký tài khoản mới
     * POST /api/register
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * API #2: Đăng nhập
     * POST /api/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không chính xác.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * API #3: Đăng xuất
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công',
        ]);
    }

    /**
     * API #4: Lấy thông tin user đang đăng nhập
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * API #5: Cập nhật thông tin cá nhân
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|regex:/^[0-9]{10,11}$/',
        ], [
            'name.required' => 'Họ và tên không được để trống.',
            'phone.regex' => 'Số điện thoại phải từ 10 đến 11 số.',
        ]);

        $user->update($request->only(['name', 'phone']));

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * API #6: Đổi mật khẩu
     * PUT /api/auth/change-password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'current_password.required' => 'Mật khẩu hiện tại không được để trống.',
            'password.required' => 'Mật khẩu mới không được để trống.',
            'password.min' => 'Mật khẩu mới phải từ 6 ký tự trở lên.',
            'password.confirmed' => 'Mật khẩu xác nhận không khớp.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không chính xác.'],
            ]);
        }

        if ($request->current_password === $request->password) {
            throw ValidationException::withMessages([
                'password' => ['Mật khẩu mới không được giống mật khẩu hiện tại.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Đổi mật khẩu thành công',
        ]);
    }
}
