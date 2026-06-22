<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * API #39: [Admin] Lấy danh sách người dùng
     * GET /api/admin/users
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * API #40: [Admin] Chi tiết người dùng
     * GET /api/admin/users/{id}
     */
    public function show($id)
    {
        $user = User::with('bookings.showtime.movie')->findOrFail($id);

        return response()->json(['data' => $user]);
    }

    /**
     * API #41: [Admin] Cập nhật người dùng
     * PUT /api/admin/users/{id}
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        // 1. Chỉ tài khoản admin global (admin@tcine.com) mới được sửa đổi tài khoản của chính nó
        if ($user->email === 'admin@tcine.com' && $currentUser->email !== 'admin@tcine.com') {
            return response()->json([
                'message' => 'Bạn không có quyền chỉnh sửa tài khoản admin global.'
            ], 403);
        }

        // 2. Chỉ tài khoản admin global mới có quyền thay đổi vai trò (phân quyền)
        if ($request->has('role') && $request->role !== $user->role) {
            if ($currentUser->email !== 'admin@tcine.com') {
                return response()->json([
                    'message' => 'Chỉ tài khoản admin global mới có quyền phân quyền cho tài khoản khác.'
                ], 403);
            }
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:admin,customer',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($request->only(['name', 'role', 'phone']));

        return response()->json([
            'message' => 'Cập nhật người dùng thành công',
            'data' => $user->fresh(),
        ]);
    }

    /**
     * API #42: [Admin] Xóa người dùng
     * DELETE /api/admin/users/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        // 1. Không được phép xóa tài khoản admin global
        if ($user->email === 'admin@tcine.com') {
            return response()->json([
                'message' => 'Không thể xóa tài khoản admin global.'
            ], 403);
        }

        // 2. Chỉ tài khoản admin global mới được phép xóa tài khoản admin khác
        if ($user->role === 'admin' && $currentUser->email !== 'admin@tcine.com') {
            return response()->json([
                'message' => 'Chỉ tài khoản admin global mới có quyền xóa tài khoản quản trị viên khác.'
            ], 403);
        }


        $user->delete();

        return response()->json(['message' => 'Xóa người dùng thành công']);
    }

}
