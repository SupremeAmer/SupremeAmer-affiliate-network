let username = document.getElementById('username');
let email = document.getElementById('email');
let password = document.getElementById('password');
let confirmPassword = document.getElementById('confirmPassword');
let submitButton = document.getElementById('submit');

submitButton.addEventListener('click', (e) => {
  e.preventDefault();
  let errors = validateForm();
  if (Object.keys(errors).length === 0) {
    // Handle form submission here
    console.log('Form submitted:', username.value, email.value, password.value, confirmPassword.value);
    submitButton.disabled = true;
    submitButton.innerHTML = 'Loading...';
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 30000);
  } else {
    displayErrors(errors);
  }
});

function validateForm() {
  let errors = {};
  if (!username.value) {
    errors.username = 'Username is required';
  }
  if (!email.value) {
    errors.email = 'Email is required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.value)) {
    errors.email = 'Invalid email address';
  }
  if (!password.value) {
    errors.password = 'Password is required';
  } else if (password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  if (!confirmPassword.value) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

function displayErrors(errors) {
  for (let id in errors) {
    let errorElement = document.getElementById(`${id}Error`);
    errorElement.innerHTML = errors[id];
  }
}
