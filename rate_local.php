<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Read JSON input from fetch()
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['index']) || !isset($data['ratings'])) {
    http_response_code(400);
    echo "Invalid data";
    exit;
}

$index = $data['index'];
$ratings = $data['ratings'];
$time = date('Y-m-d H:i:s');

// Set path to CSV file
$filePath = __DIR__ . '/ratings.csv';

// If file doesn't exist, write header
if (!file_exists($filePath)) {
    $header = ['index', 'time', 'folder1', 'folder2', 'folder3'];
    $fp = fopen($filePath, 'w');
    fputcsv($fp, $header);
    fclose($fp);
}

// Write the data row
$row = [
    $index,
    $time,
    $ratings['folder1'] ?? '',
    $ratings['folder2'] ?? '',
    $ratings['folder3'] ?? ''
];

$fp = fopen($filePath, 'a');
fputcsv($fp, $row);
fclose($fp);

echo 'Rating saved to CSV';
