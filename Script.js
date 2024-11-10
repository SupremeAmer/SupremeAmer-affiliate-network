// Add event listener to button
document.querySelector('.cta button').addEventListener('click', function() {
  // Redirect to
// Add event listener to button
document.querySelector('.cta button').addEventListener('click', function() {
  // Redirect to registration page
  window.location.href = 'register.html';
});

// Add event listener to navigation links
document.querySelectorAll('nav ul li a').forEach(function(link) {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    // Scroll to corresponding section
    var sectionId = link.getAttribute('href');
    var section = document.querySelector(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
  });
});

// Initialize background video
var video = document.querySelector('.background video');
video.play();

// Handle video playback errors
video.addEventListener('error', function(event) {
  console.error('Error playing background video:', event);
});

// Add loading animation
document.body.classList.add('loading');

// Remove loading animation after 2 seconds
setTimeout(function() {
  document.body.classList.remove('loading');
}, 2000)
