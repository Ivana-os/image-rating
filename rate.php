<?PHP

error_reporting(E_ALL);
ini_set('display_errors', 1);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['index']) || !isset($data['ratings'])) {
    http_response_code(400);
    echo "Invalid data";
    exit;
}

$index = $data['index'];
$ratings = $data['ratings'];
$time = date('Y-m-d H:i:s');

// Putanja do CSV datoteke
$file = 'ratings.csv';


// Ako datoteka ne postoji, upiši zaglavlje
if (!file_exists($file)) {
  $header = ['index', 'time', 'folder1', 'folder2', 'folder3', 'folder4', 'folder6', 'folder7', 'folder8', 'folder9'];
  $fp = fopen($file, 'w');
  fputcsv($fp, $header);
  fclose($fp);
}
// Build row
$row = [
    $index,
    $time,
    $ratings['folder1'] ?? '',
    $ratings['folder2'] ?? '',
    $ratings['folder3'] ?? '',
    $ratings['folder4'] ?? '',
    $ratings['folder6'] ?? '',
    $ratings['folder7'] ?? '',
    $ratings['folder8'] ?? '',
    $ratings['folder9'] ?? ''
];

$csvFile = __DIR__ . '/ratings.csv';
$file = fopen($csvFile, 'a');
if (!$file) {
    http_response_code(500);
    echo "Error opening CSV file!";
    exit;
}
fputcsv($file, $row);
fclose($file);

echo 'Rating saved to CSV';
exit;
?>