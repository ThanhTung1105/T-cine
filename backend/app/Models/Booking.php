<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'user_id',
        'showtime_id',
        'promotion_id',
        'total_amount',
        'discount_amount',
        'final_amount',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function showtime()
    {
        return $this->belongsTo(Showtime::class);
    }

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function bookingCombos()
    {
        return $this->hasMany(BookingCombo::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
