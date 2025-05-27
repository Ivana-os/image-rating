<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Check that required data exists
if (!isset($data['index']) || !isset($data['ratings']) || !is_array($data['ratings'])) {
    http_response_code(400);
    echo "Invalid data";
    exit;
}

$index = $data['index'];
$ratings = $data['ratings'];
$time = date('Y-m-d H:i:s');

// CSV file path
$csvFile = __DIR__ . '/ratings.csv';

// Prepare CSV header based on keys in "ratings"
$headers = array_merge(['index', 'time'], array_keys($ratings));

// Prepare CSV row
$folder = array_merge([$index, $time], array_values($ratings));

// If file doesn't exist, write the header first
if (!file_exists($csvFile)) {
    $fp = fopen($csvFile, 'w');
    fputcsv($fp, $headers);
    fclose($fp);
}

// Append the new rating row
$fp = fopen($csvFile, 'a');
fputcsv($fp, $folder);
fclose($fp);

echo 'Rating saved to CSV';
