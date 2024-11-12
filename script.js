<!-- register.html -->
<form id="register-form">
  <label>Name:</label>
  <input type="text" id="name" name="name"><br><br>
  <label>Email:</label>
  <input type="email" id="email" name="email"><br><br>
  <label>Password:</label>
  <input type="password" id="password" name="password"><br><br>
  <label>Confirm Password:</label>
  <input type="password" id="confirm-password" name="confirm-password"><br><br>
  <button id="register-btn">Register</button>
</form>

<!-- JavaScript code to handle form submission -->
<script>
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const userData = {
      name,
      email,
      password
    };

    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert('Registration successful');
        window.location.href = '/login';
      } else {
        alert('Registration failed');
      }
    })
    .catch((error) => {
      console.error(error);
    });
  });
</script>
