document.addEventListener('DOMContentLoaded', () => {
  const dropdownButtons = document.querySelectorAll('.dropdown-button'); 
  const navToggle = document.querySelector('.nav-toggle');
  const hamburgerLabel = document.querySelector('.hamburger'); 
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  // Re-added for pages that have the quote (e.g., index.html)
  const hopeScript = document.querySelector('.hope-script'); 
  const hopeImage = document.querySelector('.hope-banner img'); 
  const desktopBreakpoint = 1024; 

  // ==============================
  // Navbar Dropdown Toggle (Mobile & Tablet)
  // ==============================
  dropdownButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      // Prevent button from submitting a form if accidentally placed inside one
      e.preventDefault(); 
      
      const parentDropdown = this.parentElement;
      const isCurrentlyActive = parentDropdown.classList.contains('active');

      // Close all dropdowns
      dropdownButtons.forEach(otherButton => {
        const otherDropdown = otherButton.parentElement;
        otherDropdown.classList.remove('active');
        otherButton.setAttribute('aria-expanded', 'false');
      });

      // Toggle the clicked dropdown
      if (!isCurrentlyActive) {
        parentDropdown.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Reset dropdowns and ARIA state on resize to desktop size
  window.addEventListener('resize', () => {
    if (window.innerWidth > desktopBreakpoint) {
      dropdownButtons.forEach(button => {
        button.parentElement.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
      });
      // Ensure mobile menu is closed if resizing from mobile view
      if (navToggle.checked) {
          navToggle.checked = false;
          hamburgerLabel.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ==============================
  // Hamburger toggle for mobile (with ARIA state update)
  // ==============================
  if (navToggle && hamburgerLabel) {
    navToggle.addEventListener('change', () => {
      const isChecked = navToggle.checked;
      hamburgerLabel.setAttribute('aria-expanded', isChecked);
    });
  }

  // ==============================
  // Scroll to top on page load 
  // ==============================
  window.addEventListener('load', () => {
    window.scrollTo(0, 0); 
  });

  // ==============================
  // Scroll fade-in animations
  // ==============================
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  animateElements.forEach(el => observer.observe(el));

  // ==============================
  // Hope Script Fade-In after image loads
  // *** This section now safely checks if hopeScript and hopeImage exist. ***
  // ==============================
  function showHopeScript() {
    // Safety check: only proceed if the quote element is found on the page
    if (!hopeScript) return; 
    hopeScript.classList.add('visible');
  }

  // Safety check: only proceed if the image element is found on the page
  if (hopeImage) { 
    // Check if image is already loaded (from cache)
    if (hopeImage.complete) {
      showHopeScript();
    } else {
      // Wait for the image to load
      hopeImage.addEventListener('load', showHopeScript);
    }
  }
});