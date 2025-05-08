<?php
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['index']) || !isset($data['ratings'])) {
  http_response_code(400);
  echo "Invalid data";
  exit;
}

$index = $data['index'];
$ratings = $data['ratings'];
$time = date('Y-m-d H:i:s'); // Vrijeme u formatu "2025-05-08 17:10:02"

// Putanja do CSV datoteke
$file = 'ratings.csv';

// Ako datoteka ne postoji, upiši zaglavlje
if (!file_exists($file)) {
  $header = ['index', 'time', 'folder1', 'folder2', 'folder3', 'folder4'];
  $fp = fopen($file, 'w');
  fputcsv($fp, $header);
  fclose($fp);
}

// Zapiši red
$row = [$index, $time];
for ($i = 1; $i <= 4; $i++) {
  $row[] = $ratings["folder$i"];
}

$fp = fopen($file, 'a');
fputcsv($fp, $row);
fclose($fp);

echo "Ratings saved with time";
