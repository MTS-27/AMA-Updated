<?php
// Simple API to save posts to JSON file
// WARNING: This is a basic implementation. For production, add proper authentication.

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data)) {
    // Basic password check (client-side sends 'password' field)
    // In a real app, use sessions or tokens.
    // Default password is 'admin123'
    if (isset($data['password']) && $data['password'] === 'admin123') {
        
        // Remove password before saving
        unset($data['password']);

        // Path to JSON file
        $file = '../assets/data/posts.json';

        // Write to file
        if (file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT))) {
            http_response_code(200);
            echo json_encode(array("message" => "Posts were saved successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to save posts. Write permission denied."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Unauthorized. Invalid password."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to save posts. Data is incomplete."));
}
?>
