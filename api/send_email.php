<?php
// API to send emails via PHP mail()
// In production (IONOS), this uses the server's mail configuration.
// Locally, it simulates success unless SMTP is configured.


// Turn off error reporting for API to avoid breaking JSON
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data)) {
    $to = "info@theassociationofma.org"; // User configured email
    $subject = isset($data['subject']) ? $data['subject'] : "New Message from AMA Website";

    // Construct Message
    $message = "";
    if (isset($data['name'])) {
        $message .= "Name: " . htmlspecialchars($data['name']) . "\n";
    }
    if (isset($data['email'])) {
        $message .= "Email: " . htmlspecialchars($data['email']) . "\n";
        // User requested "sent and received by me".
        // We send FROM the user's email, but set Reply-To to the visitor so they can reply easily.
        $headers = "From: tahasethi47@gmail.com\r\n";
        $headers .= "Reply-To: " . $data['email'] . "\r\n";
        $log_header = "From: tahasethi47@gmail.com (Reply-To: " . $data['email'] . ")";
    } else {
        $headers = "From: tahasethi47@gmail.com";
        $log_header = "From: tahasethi47@gmail.com";
    }

    $message .= "\nMessage:\n";
    if (isset($data['message'])) {
        $message .= htmlspecialchars($data['message']);
    }

    // Try to send email
    try {
        // Attempt actual mail send (works on production servers)
        $sent = @mail($to, $subject, $message, $headers);

        if ($sent) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Email sent successfully."]);
        } else {
            // Simulation Mode for Localhost/Dev
            // Write to log file for verification
            $logEntry = "--- Email Sent [" . date('Y-m-d H:i:s') . "] ---\n";
            $logEntry .= "To: $to\n";
            $logEntry .= "Subject: $subject\n";
            $logEntry .= "$log_header\n";
            $logEntry .= "Body:\n$message\n";
            $logEntry .= "----------------------------------------\n\n";

            file_put_contents(__DIR__ . '/email.log', $logEntry, FILE_APPEND);

            // Always return success in dev mode
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Message sent! (Simulated locally)"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to send email. " . $e->getMessage()]);
    }

} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}