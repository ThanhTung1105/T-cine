<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'poster',
        'banner',
        'trailer_url',
        'genre',
        'director',
        'cast_info',
        'duration',
        'age_rating',
        'rating',
        'release_date',
        'status',
    ];

    public function showtimes()
    {
        return $this->hasMany(Showtime::class);
    }
}
