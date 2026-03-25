
// Main initialization file
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded successfully!');
    
    // Initialize all modules
    // (Functions from other files will run automatically)
    
    // Add any additional initialization code here
});


document.querySelectorAll('.responsibilities-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        toggle.setAttribute('aria-expanded', !isExpanded);
        toggle.classList.toggle('active');
        content.classList.toggle('expanded');
    });
});