<?php

namespace App\Http\Controllers;

use App\Models\Combo;
use Illuminate\Http\Request;

class ComboController extends Controller
{
    /**
     * API #43: Lấy danh sách combo
     * GET /api/combos
     */
    public function index()
    {
        $combos = Combo::all();

        return response()->json(['data' => $combos]);
    }
}
