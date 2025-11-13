document.addEventListener('DOMContentLoaded', () => {
    // --- Debounce Utility Function ---
    let debounceTimer;
    const DEBOUNCE_TIME = 50; // Requested debounce time (50ms)
    
    /**
     * Creates a debounced function that delays invocation until after 'delay' milliseconds 
     * have passed since the last time the debounced function was invoked.
     */
    const debounce = (func, delay) => {
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // --- 1. Menu Toggling Logic ---
    const menuTrigger = document.getElementById('menu-trigger'); 
    const menuClose = document.getElementById('menu-close');
    const offCanvasMenu = document.getElementById('off-canvas-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body; // Reference to the body element
    const mainContent = document.querySelector('main'); // Reference for optional transform/scrim

    // --- Accessibility/Style Toggles References ---
    const scaleToggle = document.getElementById('scale-page-toggle');
    const boldToggle = document.getElementById('bold-page-toggle');
    const colorCircles = document.querySelectorAll('.color-circle');
    const navCapsule = document.querySelector('.main-nav-capsule'); // Reference for sticky header
    
    // --- Scale Dropdown & Slider References ---
    const scaleDropdown = document.getElementById('scale-dropdown');
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValueDisplay = document.getElementById('scale-value');
    
    // FINAL UPDATED: Stable zoom levels: 100, 110, 125, 150, and 175.
    const preferredZoomLevels = [100, 110, 125, 150, 175];

    // Function to close the menu (UPDATED for scrim)
    const closeMenu = () => {
        if (offCanvasMenu) {
            offCanvasMenu.classList.remove('active');
            body.classList.remove('menu-open'); // REMOVE SCIM CLASS
            if (menuTrigger) menuTrigger.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
            // If you use content pushing, reset it here:
            // if (mainContent) mainContent.style.transform = 'translateX(0)';
        }
    };

    // Function to open the menu (UPDATED for scrim)
    const openMenu = () => {
        if (offCanvasMenu) {
            offCanvasMenu.classList.add('active');
            body.classList.add('menu-open'); // ADD SCIM CLASS
            if (menuTrigger) menuTrigger.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden';
            // If you use content pushing, set it here:
            // if (mainContent) mainContent.style.transform = 'translateX(300px)'; 
        }
    };

    // --- Menu Event Listeners ---
    if (menuTrigger) {
        menuTrigger.addEventListener('click', openMenu);
    }
    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }
    
    // Close menu when a link inside is clicked
    if (navLinks) {
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                closeMenu();
            }
        });
    }

    // Close menu or scale dropdown when clicking outside
    document.addEventListener('click', (e) => {
        // Close off-canvas menu
        if (offCanvasMenu && menuTrigger && offCanvasMenu.classList.contains('active')) {
            if (!offCanvasMenu.contains(e.target) && !menuTrigger.contains(e.target)) {
                closeMenu();
            }
        }
        // Close scale dropdown
        if (scaleDropdown && scaleToggle && scaleDropdown.classList.contains('visible')) {
            if (!scaleDropdown.contains(e.target) && !scaleToggle.contains(e.target)) {
                scaleDropdown.classList.remove('visible');
                scaleToggle.classList.remove('active');
                scaleToggle.setAttribute('aria-expanded', 'false');
                scaleDropdown.setAttribute('aria-hidden', 'true');
            }
        }
    });
    
    // --- SCALE TOGGLE (A) and SLIDER LOGIC ---
    
    /**
     * Finds the closest preferred zoom level to the current slider value (snapping).
     */
    const snapToNearestPreferredLevel = (currentValue) => {
        // Find the level with the smallest difference to the current slider value
        return preferredZoomLevels.reduce((prev, curr) => {
            return (Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev);
        });
    };

    const applyScale = (value) => {
        const scaleFactor = value / 100;
        
        // Use the 'zoom' property for layout reflow and responsiveness
        body.style.zoom = scaleFactor;
        
        // Update display value
        if (scaleValueDisplay) {
            scaleValueDisplay.textContent = `${value}%`;
        }
    };

    if (scaleToggle) {
        scaleToggle.addEventListener('click', () => {
            const isVisible = scaleDropdown.classList.toggle('visible');
            scaleToggle.classList.toggle('active', isVisible);
            scaleToggle.setAttribute('aria-expanded', isVisible);
            scaleDropdown.setAttribute('aria-hidden', !isVisible);

            // Ensure bold is off when scale is used
            body.classList.remove('bold-text');
            if (boldToggle) boldToggle.classList.remove('active');
        });
    }

    if (scaleSlider) {
        // Initialize the scale text display
        applyScale(scaleSlider.value); 

        // Debounced function that applies the final snapped value and zoom
        const debouncedApplySnapAndScale = debounce((snappedValue) => {
            applyScale(snappedValue);
        }, DEBOUNCE_TIME);
        
        // 1. Use 'input' to continuously snap the visual display (number and thumb) and trigger the debounced zoom.
        scaleSlider.addEventListener('input', (e) => {
            const currentValue = parseInt(e.target.value, 10);
            
            // Step A: Snap the value to the nearest fixed level 
            const snappedValue = snapToNearestPreferredLevel(currentValue);

            // Step B: Instantly snap the slider's physical position (the thumb jumps)
            scaleSlider.value = snappedValue;

            // Step C: Instantly snap the display to the stable value (removing 1% visibility)
            if (scaleValueDisplay) {
                scaleValueDisplay.textContent = `${snappedValue}%`;
            }
            
            // Step D: Trigger the debounced zoom operation. 
            debouncedApplySnapAndScale(snappedValue);
        });
        
        // 2. Use 'change' to ensure the final zoom happens immediately on mouse release.
        scaleSlider.addEventListener('change', (e) => {
            const snappedValue = parseInt(e.target.value, 10);
            clearTimeout(debounceTimer); // Cancel any pending debounced calls
            applyScale(snappedValue); // Apply the final, clean value immediately
        });
    }


    // --- B. Bold Text Toggle (B) ---

    if (boldToggle) {
        boldToggle.addEventListener('click', () => {
            // Close scale dropdown and reset scale when bold is toggled
            if (scaleDropdown && scaleDropdown.classList.contains('visible')) {
                scaleDropdown.classList.remove('visible');
                scaleToggle.classList.remove('active');
                scaleToggle.setAttribute('aria-expanded', 'false');
                scaleDropdown.setAttribute('aria-hidden', 'true');
            }
            if (scaleSlider) {
                scaleSlider.value = 100; // Reset scale to 100%
                applyScale(100);
            }
            
            body.classList.toggle('bold-text');
            boldToggle.classList.toggle('active');
        });
    }

    // --- C. Background Color Changer (Circles) ---

    if (colorCircles.length > 0) {
        colorCircles.forEach(circle => {
            circle.addEventListener('click', () => {
                const color = circle.getAttribute('data-color');
                body.classList.remove('tan-background', 'grey-background');
                colorCircles.forEach(c => c.classList.remove('active'));
                
                if (color === 'tan') {
                    body.classList.add('tan-background');
                    circle.classList.add('active');
                } else if (color === 'grey') {
                    body.classList.add('grey-background');
                    circle.classList.add('active');
                } else {
                     // Ensure the default circle is explicitly active
                    document.querySelector('.color-circle[data-color="default"]').classList.add('active');
                }
            });
        });
    }

    // --- 3. Smooth Scroll for internal links ---
    
    const smoothScrollLinks = document.querySelectorAll('.js-fluid-scroll[href^="#"]');

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.hash;
            if (hash && hash.length > 1) {
                e.preventDefault(); 
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
                closeMenu(); 
            }
        });
    });

    // --- 4. Scroll Fade-In Animations ---
    
    const animateElements = document.querySelectorAll('.animate-on-scroll');
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


    // --- 5. Hope Script Quote Fade-In (NEW) ---
    
    const quoteCardContainer = document.querySelector('.quote-card-container');
    const hopeScript = document.querySelector('.quote-label'); // Targeting the new location of the quote
    
    // Note: The visibility class for quote-label is now defined in CSS 
    
    function showHopeScript() {
        if (hopeScript) {
            hopeScript.classList.add('visible');
        }
    }

    // Use a new Intersection Observer for the Hero Quote Card
    if (quoteCardContainer) {
        const quoteObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Once the main quote card is visible, start the quote fade-in
                        showHopeScript();
                        quoteObserver.unobserve(entry.target);
                    }
                });
            },
            // Trigger when the container is 10% visible
            { threshold: 0.1 } 
        );
        quoteObserver.observe(quoteCardContainer);
    } else {
        // Fallback: Show immediately if the container is missing 
        showHopeScript();
    }
    
    // --- 6. Scroll to top on page load (NEW) ---
    
    window.addEventListener('load', () => {
        // Ensure the page starts at the very top after all assets have loaded
        window.scrollTo(0, 0); 
    });
    
    // --- 7. NAVIGATION CAPSULE SCROLL VISIBILITY LOGIC (NEW) ---
    if (navCapsule) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop < lastScrollTop || scrollTop === 0) {
                // Scrolling UP or at the very TOP
                navCapsule.classList.remove('hidden');
            } else if (scrollTop > lastScrollTop && scrollTop > 50) {
                // Scrolling DOWN and past the initial buffer of 50px
                navCapsule.classList.add('hidden');
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For mobile browsers
        }, false);
    }
});