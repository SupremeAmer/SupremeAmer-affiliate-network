<?php
// Capture Telegram authentication data from the request
$telegramData = $_GET['telegram_auth_data'] ?? null;

if (!$telegramData) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request: Missing Telegram data']);
    exit;
}

// Parse the authentication data
$telegramData = json_decode($telegramData, true);

// Validate the Telegram data (you can add more security checks here)
if (!isset($telegramData['id'], $telegramData['username'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid Telegram data']);
    exit;
}

// Assume you have a database connection set up
// Example: $db = new PDO('mysql:host=localhost;dbname=your_database', 'username', 'password');

// Save or update user data in the database
try {
    $db->prepare("INSERT INTO users (telegram_id, username) VALUES (:id, :username)
                  ON DUPLICATE KEY UPDATE username = :username")
       ->execute([
           ':id' => $telegramData['id'],
           ':username' => $telegramData['username'],
       ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// Generate a session token (e.g., JWT or a custom token)
$sessionToken = bin2hex(random_bytes(16)); // Example token generation

// Save the session token (e.g., in the database or a cache)
try {
    $db->prepare("INSERT INTO sessions (telegram_id, session_token) VALUES (:id, :token)")
       ->execute([
           ':id' => $telegramData['id'],
           ':token' => $sessionToken,
       ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// Return the session token to the user
echo json_encode(['session_token' => $sessionToken]);
git clone https://github.com/SupremeAmer/SupremeAmer-affiliate-network.git
