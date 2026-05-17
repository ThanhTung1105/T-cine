<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Banner::orderBy('position')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'image_url' => 'required|string|max:255',
            'link_url' => 'nullable|string|max:255',
            'position' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);
        $banner = Banner::create($request->all());
        return response()->json(['message' => 'Thêm banner thành công', 'data' => $banner], 201);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->update($request->all());
        return response()->json(['message' => 'Cập nhật banner thành công', 'data' => $banner->fresh()]);
    }

    public function destroy($id)
    {
        Banner::findOrFail($id)->delete();
        return response()->json(['message' => 'Xóa banner thành công']);
    }
}
