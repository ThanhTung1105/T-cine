<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectionFormat extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'surcharge',
    ];

    protected $casts = [
        'surcharge' => 'integer',
    ];

    public function showtimes()
    {
        return $this->hasMany(Showtime::class, 'projection_format_id');
    }
}
