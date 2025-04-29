<?php
// Payment processing script
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the submitted data
    $telegram = $_POST['telegram'];
    $paymentMethod = $_POST['payment'];
    $amount = $_POST['amount'];

    // Validate Telegram username
    if (empty($telegram)) {
        die("Error: Telegram username is required.");
    }

    // Process payment based on the selected method
    if ($paymentMethod == "telegramstar") {
        // Simulate TelegramStar payment verification
        // Replace the following with actual TelegramStar API integration
        $paymentSuccessful = true; // Assume payment is successful for demo purposes

        if ($paymentSuccessful) {
            header("Location: home.html");
            exit();
        } else {
            die("Error: TelegramStar payment failed. Please try again.");
        }
    } elseif ($paymentMethod == "paystack") {
        // Paystack payment verification
        $paystackSecretKey = "your_paystack_secret_key"; // Replace with your actual Paystack secret key
        $paystackUrl = "https://api.paystack.co/transaction/verify/";

        // Simulate transaction reference (replace with actual reference)
        $transactionReference = "txn_" . time();

        // Paystack API call
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $paystackUrl . $transactionReference);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $paystackSecretKey,
            "Content-Type: application/json"
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        $responseData = json_decode($response, true);

        if (isset($responseData['status']) && $responseData['status'] == true) {
            // Payment successful
            header("Location: home.html");
            exit();
        } else {
            die("Error: Paystack payment failed. Please try again.");
        }
    } else {
        die("Error: Invalid payment method selected.");
    }
} else {
    die("Error: Invalid request method.");
}
?>
