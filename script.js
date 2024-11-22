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

// Add security measures
function validateInput(input) {
    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9]/g;
    if (invalidChars.test(input)) {
        return false;
    }
    return true;
}

function sanitizeInput(input) {
    // Remove any HTML tags
    const sanitizedInput = input.replace(/<\/?[^>]+(>|$)/g, "");
    return sanitizedInput;
}

// Add error handling
function handleError(error) {
    console.error(error);
    // Display error message to user
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "An error occurred. Please try again.";
    document.body.appendChild(errorMessage);
}

// Example usage
try {
    const userInput = prompt("Enter your name:");
    if (!validateInput(userInput)) {
        throw new Error("Invalid input");
    }
    const sanitizedInput = sanitizeInput(userInput);
    console.log(sanitizedInput);
} catch (error) {
    handleError(error);
}
```

￼Enter
