<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$driver = DB::connection()->getDriverName();
echo "Database Driver: " . $driver . "\n\n";

$tables = [];
if ($driver === 'sqlite') {
    $results = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    foreach ($results as $row) {
        $tables[] = $row->name;
    }
} elseif ($driver === 'mysql') {
    $results = DB::select('SHOW TABLES');
    $key = 'Tables_in_' . DB::connection()->getDatabaseName();
    foreach ($results as $row) {
        $tables[] = $row->$key;
    }
} else {
    // Generic fallback
    $results = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = ?", [DB::connection()->getDatabaseName()]);
    foreach ($results as $row) {
        $tables[] = $row->table_name ?? $row->TABLE_NAME;
    }
}

echo "All Tables:\n";
foreach ($tables as $t) {
    echo " - " . $t . "\n";
}
