<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload file ảnh (poster, banner, combo...)
     * POST /api/admin/upload
     *
     * @param Request $request
     * - file: file ảnh (required, max 5MB)
     * - folder: thư mục lưu trữ (movies, combos, banners) - mặc định: movies
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'folder' => 'nullable|string|in:movies,combos,banners',
        ]);

        $folder = $request->get('folder', 'movies');
        $file = $request->file('file');

        // Tạo tên file duy nhất
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
            . '-' . Str::random(8)
            . '.' . $file->getClientOriginalExtension();

        // Lưu vào storage/app/public/{folder}/
        $path = $file->storeAs($folder, $filename, 'public');

        // Trả về URL đầy đủ
        $url = asset('storage/' . $path);

        return response()->json([
            'message' => 'Upload thành công',
            'data' => [
                'url' => $url,
                'path' => $path,
                'filename' => $filename,
            ],
        ]);
    }
}
