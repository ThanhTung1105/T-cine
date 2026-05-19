<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Danh sách thư mục lưu ảnh được hỗ trợ.
     *
     * Mỗi loại ảnh được lưu vào thư mục riêng dưới storage/app/public/
     * Truy cập public qua URL: http://{APP_URL}/storage/{folder}/{filename}
     *
     *   movies      → Poster phim
     *   banners     → Banner trang chủ
     *   events      → Ảnh sự kiện / khuyến mãi đặc biệt
     *   combos      → Combo bắp nước
     *   cinemas     → Logo / ảnh rạp (mở rộng tương lai)
     *   promotions  → Ảnh khuyến mãi (mở rộng tương lai)
     *   avatars     → Avatar người dùng (mở rộng tương lai)
     */
    public const ALLOWED_FOLDERS = [
        'movies',
        'banners',
        'events',
        'combos',
        'cinemas',
        'promotions',
        'avatars',
    ];

    /**
     * Upload file ảnh.
     * POST /api/admin/upload
     *
     * @param Request $request
     * - file:   file ảnh (required, max 10MB, jpeg/png/jpg/gif/webp)
     * - folder: loại ảnh — xem danh sách ALLOWED_FOLDERS (mặc định: 'movies')
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'file'   => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'folder' => 'nullable|string|in:' . implode(',', self::ALLOWED_FOLDERS),
        ], [
            'folder.in'   => 'Thư mục không hợp lệ. Chỉ chấp nhận: ' . implode(', ', self::ALLOWED_FOLDERS),
            'file.max'    => 'Ảnh vượt quá 10MB. Vui lòng nén lại hoặc giảm chất lượng.',
            'file.mimes'  => 'Định dạng ảnh không hợp lệ. Chỉ chấp nhận: JPEG, PNG, JPG, GIF, WEBP.',
            'file.image'  => 'File tải lên không phải là ảnh hợp lệ.',
        ]);

        $folder = $request->get('folder', 'movies');
        $file   = $request->file('file');

        // Tạo tên file duy nhất, slug từ tên gốc + 8 ký tự random
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
            . '-' . Str::random(8)
            . '.' . $file->getClientOriginalExtension();

        // Đảm bảo thư mục đích tồn tại (idempotent)
        if (!Storage::disk('public')->exists($folder)) {
            Storage::disk('public')->makeDirectory($folder);
        }

        // Lưu vào storage/app/public/{folder}/{filename}
        $path = $file->storeAs($folder, $filename, 'public');

        // URL public đầy đủ (cần symlink: php artisan storage:link)
        $url = asset('storage/' . $path);

        return response()->json([
            'message' => 'Upload thành công',
            'data'    => [
                'url'      => $url,
                'path'     => $path,
                'folder'   => $folder,
                'filename' => $filename,
                'size'     => $file->getSize(),
                'mime'     => $file->getMimeType(),
            ],
        ]);
    }
}
