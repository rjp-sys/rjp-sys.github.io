// navbar.js

// Select all dropdown links
const dropdownLinks = document.querySelectorAll('.dropdown-link');

dropdownLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    // Only toggle dropdown on mobile (screen ≤ 768px)
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parentDropdown = this.parentElement;
      parentDropdown.classList.toggle('active');
    }
  });
});

// Optional: close other dropdowns when one is opened (mobile)
dropdownLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      dropdownLinks.forEach(otherLink => {
        const otherDropdown = otherLink.parentElement;
        if (otherDropdown !== this.parentElement) {
          otherDropdown.classList.remove('active');
        }
      });
    }
  });
});
