// navbar.js

// Select all dropdown links
const dropdownLinks = document.querySelectorAll('.dropdown-link');

dropdownLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    // Only toggle dropdown on mobile (screen ≤ 768px)
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parentDropdown = this.parentElement;

      // Toggle active class on clicked dropdown
      parentDropdown.classList.toggle('active');

      // Close other dropdowns
      dropdownLinks.forEach(otherLink => {
        const otherDropdown = otherLink.parentElement;
        if (otherDropdown !== parentDropdown) {
          otherDropdown.classList.remove('active');
        }
      });
    }
  });
});

// Optional: adjust arrow animation dynamically
window.addEventListener('resize', () => {
  dropdownLinks.forEach(link => {
    const parentDropdown = link.parentElement;
    const arrow = link.querySelector('.arrow');

    if (window.innerWidth > 768) {
      // Reset arrow rotation on desktop
      if (arrow) arrow.style.transform = '';
      parentDropdown.classList.remove('active');
    }
  });
});
