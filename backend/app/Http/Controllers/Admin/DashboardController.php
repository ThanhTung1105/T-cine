<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Movie;
use App\Models\User;
use App\Models\Cinema;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * API #57: Thống kê tổng quan (Dashboard)
     */
    public function index()
    {
        return response()->json([
            'data' => [
                'total_movies' => Movie::count(),
                'total_users' => User::where('role', 'customer')->count(),
                'total_cinemas' => Cinema::count(),
                'total_bookings' => Booking::count(),
                'total_revenue' => Booking::where('status', 'paid')->sum('final_amount'),
                'pending_bookings' => Booking::where('status', 'pending')->count(),
                'recent_bookings' => Booking::with(['user', 'showtime.movie'])
                    ->orderBy('created_at', 'desc')->limit(5)->get(),
            ],
        ]);
    }

    /**
     * API #58: Thống kê doanh thu
     */
    public function revenue(Request $request)
    {
        $query = Booking::where('status', 'paid');

        if ($request->filled('from')) $query->whereDate('created_at', '>=', $request->from);
        if ($request->filled('to')) $query->whereDate('created_at', '<=', $request->to);

        $daily = (clone $query)->select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(final_amount) as revenue'),
            DB::raw('COUNT(*) as count')
        )->groupBy('date')->orderBy('date')->get();

        return response()->json(['data' => $daily]);
    }

    /**
     * API #59: Doanh thu theo phim
     */
    public function revenueByMovie(Request $request)
    {
        $query = Booking::where('bookings.status', 'paid')
            ->join('showtimes', 'bookings.showtime_id', '=', 'showtimes.id')
            ->join('movies', 'showtimes.movie_id', '=', 'movies.id');

        if ($request->filled('from')) $query->whereDate('bookings.created_at', '>=', $request->from);
        if ($request->filled('to')) $query->whereDate('bookings.created_at', '<=', $request->to);

        $data = $query->select(
            'movies.id', 'movies.title',
            DB::raw('SUM(bookings.final_amount) as revenue'),
            DB::raw('COUNT(bookings.id) as booking_count')
        )->groupBy('movies.id', 'movies.title')
            ->orderByDesc('revenue')->get();

        return response()->json(['data' => $data]);
    }

    /**
     * API #60: Doanh thu theo rạp
     */
    public function revenueByCinema(Request $request)
    {
        $query = Booking::where('bookings.status', 'paid')
            ->join('showtimes', 'bookings.showtime_id', '=', 'showtimes.id')
            ->join('rooms', 'showtimes.room_id', '=', 'rooms.id')
            ->join('cinemas', 'rooms.cinema_id', '=', 'cinemas.id');

        if ($request->filled('from')) $query->whereDate('bookings.created_at', '>=', $request->from);
        if ($request->filled('to')) $query->whereDate('bookings.created_at', '<=', $request->to);

        $data = $query->select(
            'cinemas.id', 'cinemas.name',
            DB::raw('SUM(bookings.final_amount) as revenue'),
            DB::raw('COUNT(bookings.id) as booking_count')
        )->groupBy('cinemas.id', 'cinemas.name')
            ->orderByDesc('revenue')->get();

        return response()->json(['data' => $data]);
    }

    /**
     * API #61: Thống kê số lượng vé
     */
    public function ticketStats(Request $request)
    {
        $query = Ticket::join('bookings', 'tickets.booking_id', '=', 'bookings.id')
            ->where('bookings.status', 'paid');

        if ($request->filled('from')) $query->whereDate('bookings.created_at', '>=', $request->from);
        if ($request->filled('to')) $query->whereDate('bookings.created_at', '<=', $request->to);

        return response()->json([
            'data' => [
                'total_tickets' => (clone $query)->count(),
                'by_type' => (clone $query)->select('tickets.seat_type', DB::raw('COUNT(*) as count'))
                    ->groupBy('tickets.seat_type')->get(),
            ],
        ]);
    }
}
