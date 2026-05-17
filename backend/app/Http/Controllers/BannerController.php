<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * API #52: Lấy danh sách banner đang hiển thị
     * GET /api/banners
     */
    public function index()
    {
        $banners = Banner::where('is_active', true)
            ->orderBy('position')
            ->get();

        return response()->json(['data' => $banners]);
    }
}
