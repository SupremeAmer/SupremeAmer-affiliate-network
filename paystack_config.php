<?php
define('PAYSTACK_SECRET_KEY', 'YOUR_SECRET_KEY');
define('PAYSTACK_PUBLIC_KEY', 'YOUR_PUBLIC_KEY');

class Paystack_Payment_Gateway {
  private $secret_key;
  private $public_key;
  private $amount;
  private $email;
  private $customer_name;
  private $customer_phone;

  public function __construct() {
    $this->secret_key = PAYSTACK_SECRET_KEY;
    $this->public_key = PAYSTACK_PUBLIC_KEY;
  }

  public function set_amount($amount) {
    $this->amount = $amount;
  }

  public function set_email($email) {
    $this->email = $email;
  }

  public function set_customer_name($name) {
    $this->customer_name = $name;
  }

  public function set_customer_phone($phone) {
    $this->customer_phone = $phone;
  }

  public function initialize_payment() {
    // Paystack API call
    $url = '(link unavailable)';
    $data = array(
      'amount' => $this->amount * 100, // Convert to kobo
      'email' => $this->email,
      'name' => $this->customer_name,
      'phone' => $this->customer_phone
    );

    $headers = array(
      'Authorization: Bearer ' . $this->secret_key,
      'Content-Type: application/json'
    );

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    curl_close($ch);

    $response_data = json_decode($response, true);
    return $response_data['data']['authorization_url'];
  }
}
?>
