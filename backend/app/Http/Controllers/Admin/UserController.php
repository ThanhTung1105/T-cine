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
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Xóa người dùng thành công']);
    }
}
