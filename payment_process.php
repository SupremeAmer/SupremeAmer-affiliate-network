<?php
session_start(); // Start a session for automatic login

// Connect to the database
$dbHost = 'localhost'; // Database host
$dbUser = 'root'; // Database username
$dbPass = ''; // Database password
$dbName = 'telegram_payments'; // Database name

$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Payment processing script
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the submitted data
    $telegram = $_POST['telegram'];
    $amount = $_POST['amount'];

    // Validate Telegram username
    if (empty($telegram)) {
        die("Error: Telegram username is required.");
    }

    // Validate payment amount (must be exactly 20 TelegramStar)
    if ($amount != 20) {
        die("Error: The required payment is exactly 20 TelegramStar.");
    }

    // Check if the user has already paid
    $stmt = $conn->prepare("SELECT * FROM payments WHERE telegram = ?");
    $stmt->bind_param("s", $telegram);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // User has already paid, log them in automatically
        $_SESSION['user'] = $telegram;
        header("Location: home.html");
        exit();
    }

    // Simulate TelegramStar payment verification
    // Replace this block with actual TelegramStar API integration
    $paymentSuccessful = true; // Assume payment is successful for demonstration purposes

    if ($paymentSuccessful) {
        // Record the payment in the database
        $stmt = $conn->prepare("INSERT INTO payments (telegram, amount) VALUES (?, ?)");
        $stmt->bind_param("ss", $telegram, $amount);
        $stmt->execute();

        // Log the user in
        $_SESSION['user'] = $telegram;

        // Redirect to the home page
        header("Location: home.html");
        exit();
    } else {
        die("Error: TelegramStar payment failed. Please try again.");
    }
} else {
    die("Error: Invalid request method.");
}
?>
