document.addEventListener('DOMContentLoaded', () => {
  const dropdownLinks = document.querySelectorAll('.dropdown-link');
  const navToggle = document.querySelector('.nav-toggle');

  // 1️⃣ Navbar Dropdown Toggle (Mobile & Tablet)
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const parentDropdown = this.parentElement;
        parentDropdown.classList.toggle('active');

        // Close other dropdowns
        dropdownLinks.forEach(otherLink => {
          const otherDropdown = otherLink.parentElement;
          if (otherDropdown !== parentDropdown) otherDropdown.classList.remove('active');
        });
      }
    });
  });

  // Reset dropdowns on resize
  window.addEventListener('resize', () => {
    dropdownLinks.forEach(link => {
      const parentDropdown = link.parentElement;
      if (window.innerWidth > 1024) {
        parentDropdown.classList.remove('active');
      }
    });
  });

  // 2️⃣ Hamburger toggle
  if (navToggle) {
    navToggle.addEventListener('change', () => {
      document.body.classList.toggle('nav-open', navToggle.checked);
    });
  }

  // 3️⃣ Scroll to top on page load
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  });

  // 4️⃣ Scroll fade-in animations
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animateElements.forEach(el => observer.observe(el));

  // 5️⃣ Hope Script Fade-In after image loads
  const hopeScript = document.querySelector('.hope-script');
  const hopeImage = document.querySelector('.hope-banner img');

  function showHopeScript() {
    if (!hopeScript) return;
    hopeScript.classList.add('visible');
  }

  if (hopeImage && hopeImage.complete) {
    showHopeScript();
  } else if (hopeImage) {
    hopeImage.addEventListener('load', showHopeScript);
  }
});
