<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;

$events = Event::all();
foreach ($events as $event) {
    echo "Event ID: " . $event->id . "\n";
    echo "  Title: " . $event->title . "\n";
    echo "  Is Active: " . ($event->is_active ? 'YES' : 'NO') . "\n";
    echo "  Start Date: " . ($event->start_date ? $event->start_date->toDateString() : 'NULL') . "\n";
    echo "  End Date: " . ($event->end_date ? $event->end_date->toDateString() : 'NULL') . "\n\n";
}
