<?php
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Mail config
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'your-email@gmail.com';         // ← your Gmail
    $mail->Password   = 'your-app-password';            // ← App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('your-email@gmail.com', 'Image Rating App');
    $mail->addAddress('your-email@gmail.com');          // ← where to send
    $mail->Subject = 'Final Rating Results (CSV)';
    $mail->Body    = 'Attached is the final ratings.csv file.';
    $mail->addAttachment('ratings.csv');

    $mail->send();
    echo '✅ CSV file sent to your email.';
} catch (Exception $e) {
    echo "❌ Error sending email: {$mail->ErrorInfo}";
}
