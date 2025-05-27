<?php
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['index']) || !isset($data['ratings'])) {
    http_response_code(400);
    echo "Invalid data";
    exit;
}

$index = $data['index'];
$ratings = $data['ratings'];
$time = date('Y-m-d H:i:s');

// Connect to MySQL (XAMPP default: user = root, no password)
$pdo = new PDO("mysql:host=localhost;dbname=ratingsdb;charset=utf8mb4", "root", "");

// Insert into DB
$stmt = $pdo->prepare("
    INSERT INTO ratings (image_index, time, folder1_rating, folder2_rating, folder3_rating)
    VALUES (?, ?, ?, ?, ?)
");

$stmt->execute([
    $index,
    $time,
    $ratings['folder1'],
    $ratings['folder2'],
    $ratings['folder3']
]);

echo 'Rating saved to database';
