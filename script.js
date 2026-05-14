// Wait for the HTML document to fully load before running the script
document.addEventListener("DOMContentLoaded", function() {
    
    // Select all links in the navigation menu that start with a hash (#)
    const smoothScrollLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    // Loop through each link
    smoothScrollLinks.forEach(link => {
        // Add a click event listener to each link
        link.addEventListener('click', function(e) {
            // Prevent the default instant jump to the section
            e.preventDefault();

            // Get the target section's ID from the link's href attribute
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            // If the element exists on the page, smoothly scroll to it
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
