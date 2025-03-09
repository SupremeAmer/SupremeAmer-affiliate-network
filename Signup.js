const paystackApiKey = '1648268657';
const paystackApiSecret'pk_test_a9c647c1648268657ce81292e29cdd91253ab47a';

const paymentForm = document.getElementById('payment-form');

paymentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const amount = 800; 
  const email = document.getElementById('email').value;
  const name = document.getElementById('name').value;

  const paymentIntent = await createPaymentIntent(amount, email, name);

  window.location.href = paymentIntent.data.authorization_url;
});

const callbackEndpoint = '/paystack/callback';

app.post(callbackEndpoint, async (req, res) => {
  const event = req.body;

  if (event.event === 'charge.success') {
    await updateRegistrationStatus(event.data.reference);
  }

  res.send('Callback received');
});

async function createPaymentIntent(amount, email, name) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${paystackApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      email,
      name,
    }),
  });

  return await response.json();
}

async function updateRegistrationStatus(reference) {
  // Update user's registration status in your database
}
