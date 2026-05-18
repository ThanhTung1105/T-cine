<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers Public
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\CinemaController;
use App\Http\Controllers\ShowtimeController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ComboController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PaymentController;

// Controllers Admin
use App\Http\Controllers\Admin\MovieController as AdminMovieController;
use App\Http\Controllers\Admin\CinemaController as AdminCinemaController;
use App\Http\Controllers\Admin\ShowtimeController as AdminShowtimeController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ComboController as AdminComboController;
use App\Http\Controllers\Admin\PromotionController as AdminPromotionController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UploadController;

/*
|--------------------------------------------------------------------------
| ===== ROUTES CÔNG KHAI (Không cần đăng nhập) =====
|--------------------------------------------------------------------------
*/

// --- Auth ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Phim ---
Route::get('/movies', [MovieController::class, 'index']);
Route::get('/movies/now-showing', [MovieController::class, 'nowShowing']);
Route::get('/movies/coming-soon', [MovieController::class, 'comingSoon']);
Route::get('/movies/search', [MovieController::class, 'search']);
Route::get('/movies/{id}', [MovieController::class, 'show']);
Route::get('/movies/{movieId}/showtimes', [ShowtimeController::class, 'byMovie']);

// --- Rạp ---
Route::get('/cinemas', [CinemaController::class, 'index']);
Route::get('/cinemas/{id}', [CinemaController::class, 'show']);
Route::get('/cinemas/{id}/rooms', [CinemaController::class, 'rooms']);
Route::get('/cinemas/{cinemaId}/showtimes', [CinemaController::class, 'showtimes']);

// --- Suất chiếu ---
Route::get('/showtimes/{id}', [ShowtimeController::class, 'show']);

// --- Combo ---
Route::get('/combos', [ComboController::class, 'index']);

// --- Banner ---
Route::get('/banners', [BannerController::class, 'index']);

// --- Khuyến mãi ---
Route::get('/promotions/check', [PromotionController::class, 'check']);

// --- Sự kiện / Ưu đãi ---
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

/*
|--------------------------------------------------------------------------
| ===== ROUTES YÊU CẦU ĐĂNG NHẬP (auth:sanctum) =====
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // --- Auth ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // --- User Profile ---
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // --- Đặt vé ---
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/my', [BookingController::class, 'myBookings']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // --- Thanh toán (mô phỏng) ---
    Route::post('/bookings/{id}/confirm-payment', [PaymentController::class, 'confirm']);

    /*
    |--------------------------------------------------------------------------
    | ===== ROUTES ADMIN (Cần đăng nhập + role = admin) =====
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {

        // Dashboard & Thống kê
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/revenue', [DashboardController::class, 'revenue']);
        Route::get('/revenue/by-movie', [DashboardController::class, 'revenueByMovie']);
        Route::get('/revenue/by-cinema', [DashboardController::class, 'revenueByCinema']);
        Route::get('/stats/tickets', [DashboardController::class, 'ticketStats']);

        // Upload ảnh
        Route::post('/upload', [UploadController::class, 'store']);

        // Quản lý Phim
        Route::post('/movies', [AdminMovieController::class, 'store']);
        Route::put('/movies/{id}', [AdminMovieController::class, 'update']);
        Route::delete('/movies/{id}', [AdminMovieController::class, 'destroy']);

        // Quản lý Rạp & Phòng chiếu
        Route::post('/cinemas', [AdminCinemaController::class, 'store']);
        Route::put('/cinemas/{id}', [AdminCinemaController::class, 'update']);
        Route::delete('/cinemas/{id}', [AdminCinemaController::class, 'destroy']);
        Route::post('/cinemas/{id}/rooms', [AdminCinemaController::class, 'storeRoom']);
        Route::put('/cinemas/{id}/rooms/{roomId}', [AdminCinemaController::class, 'updateRoom']);
        Route::delete('/cinemas/{id}/rooms/{roomId}', [AdminCinemaController::class, 'destroyRoom']);

        // Quản lý Suất chiếu
        Route::get('/showtimes', [AdminShowtimeController::class, 'index']);
        Route::post('/showtimes', [AdminShowtimeController::class, 'store']);
        Route::put('/showtimes/{id}', [AdminShowtimeController::class, 'update']);
        Route::delete('/showtimes/{id}', [AdminShowtimeController::class, 'destroy']);

        // Quản lý Đơn hàng
        Route::get('/bookings', [AdminBookingController::class, 'index']);
        Route::put('/bookings/{id}/status', [AdminBookingController::class, 'updateStatus']);

        // Quản lý Người dùng
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        // Quản lý Combo
        Route::post('/combos', [AdminComboController::class, 'store']);
        Route::put('/combos/{id}', [AdminComboController::class, 'update']);
        Route::delete('/combos/{id}', [AdminComboController::class, 'destroy']);

        // Quản lý Khuyến mãi
        Route::get('/promotions', [AdminPromotionController::class, 'index']);
        Route::post('/promotions', [AdminPromotionController::class, 'store']);
        Route::put('/promotions/{id}', [AdminPromotionController::class, 'update']);
        Route::delete('/promotions/{id}', [AdminPromotionController::class, 'destroy']);

        // Quản lý Banner
        Route::get('/banners', [AdminBannerController::class, 'index']);
        Route::post('/banners', [AdminBannerController::class, 'store']);
        Route::put('/banners/{id}', [AdminBannerController::class, 'update']);
        Route::delete('/banners/{id}', [AdminBannerController::class, 'destroy']);

        // Quản lý Sự kiện / Ưu đãi
        Route::get('/events', [AdminEventController::class, 'index']);
        Route::post('/events', [AdminEventController::class, 'store']);
        Route::put('/events/{id}', [AdminEventController::class, 'update']);
        Route::delete('/events/{id}', [AdminEventController::class, 'destroy']);
    });
});
