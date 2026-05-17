<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_percent',
        'max_discount',
        'valid_from',
        'valid_to',
        'usage_limit',
        'used_count',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
