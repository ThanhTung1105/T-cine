<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('poster', 255)->nullable();
            $table->string('banner', 255)->nullable();
            $table->string('trailer_url', 255)->nullable();
            $table->string('genre', 100)->nullable();
            $table->string('director', 100)->nullable();
            $table->string('cast_info', 255)->nullable();
            $table->integer('duration')->nullable();
            $table->string('age_rating', 10)->nullable();
            $table->decimal('rating', 3, 1)->nullable();
            $table->date('release_date')->nullable();
            $table->enum('status', ['now_showing', 'coming_soon', 'ended'])->default('coming_soon');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
