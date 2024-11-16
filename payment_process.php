<?php
require_once('paystack_config.php');

if ($_POST) {
  $full_name = $_POST['full_name'];
  $email = $_POST['email'];
  $phone = $_POST['phone'];
  $username = $_POST['username'];
  $password = $_POST['password'];
  $confirm_password = $_POST['confirm_password'];
  $amount = $_POST['amount'];

  // Paystack payment initialization
  $paystack = new Paystack_Payment_Gateway();
  $paystack->set_amount($amount);
  $paystack->set_email($email);
  $paystack->set_customer_name($full_name);
  $paystack->set_customer_phone($phone);

  // Redirect to Paystack payment page
  $payment_url = $paystack->initialize_payment();
  header('Location: ' . $payment_url);
  exit;
} else {
  echo "Invalid request!";
}
?>
