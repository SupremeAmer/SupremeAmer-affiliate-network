// Add event listeners to navigation links
document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("header nav a");
    navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            // Add logic to handle navigation link clicks
        });
    });
});

function register() {
    alert("Registration successful!");
}
