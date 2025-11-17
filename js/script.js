document.addEventListener('DOMContentLoaded', () => {
    // --- Debounce Utility Function ---
    let debounceTimer;
    const DEBOUNCE_TIME = 50; 
    
    const debounce = (func, delay) => {
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // --- Element References ---
    const body = document.body;
    // CRITICAL: This targets the <html> tag, whose font-size determines the size of all REM units.
    const rootElement = document.documentElement; 
    
    // Navigation/Accessibility References
    const menuTrigger = document.getElementById('menu-trigger'); 
    const menuClose = document.getElementById('menu-close');
    const offCanvasMenu = document.getElementById('off-canvas-menu');
    const navLinks = document.querySelector('.nav-links');
    const navCapsule = document.querySelector('.main-nav-capsule');
    
    const scaleToggle = document.getElementById('scale-page-toggle');
    const boldToggle = document.getElementById('bold-page-toggle');
    const colorCircles = document.querySelectorAll('.color-circle');
    
    const scaleDropdown = document.getElementById('scale-dropdown');
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValueDisplay = document.getElementById('scale-value');
    
    // Stable zoom levels for snapping the slider
    const preferredZoomLevels = [100, 110, 125, 150, 175];
    
    // Theme colors mapping (matching CSS variables)
    const colorMap = {
        'default': '#FAF9F6', 
        'tan': '#EDE4D7',
        'grey': '#D3D3D3'
    };

    // --- Menu Open/Close Functions ---
    const closeMenu = () => {
        if (offCanvasMenu) {
            offCanvasMenu.classList.remove('open');
            body.classList.remove('menu-open'); 
            if (menuTrigger) menuTrigger.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', closeMenuOutside);
        }
    };

    const openMenu = () => {
        if (offCanvasMenu) {
            offCanvasMenu.classList.add('open');
            body.classList.add('menu-open'); 
            if (menuTrigger) menuTrigger.setAttribute('aria-expanded', 'true');
            document.addEventListener('click', closeMenuOutside); 
        }
    };
    
    // Function to handle clicks outside the menu
    function closeMenuOutside(event) {
        // Check if the click target is outside the menu AND not the trigger button
        if (offCanvasMenu.classList.contains('open') && !offCanvasMenu.contains(event.target) && !menuTrigger.contains(event.target)) {
            closeMenu();
        }
    }

    // --- Persistence/Load State (Loads settings from local storage) ---
    const loadState = () => {
        // Load and Apply Bold State
        const savedBold = localStorage.getItem('boldText') === 'true';
        if (savedBold) {
            body.classList.add('bold-text');
            if (boldToggle) boldToggle.classList.add('active');
        }

        // Load and Apply Scale State
        const savedScale = localStorage.getItem('pageScale') || '100';
        if (scaleSlider) {
            scaleSlider.value = savedScale;
        }
        applyScale(parseInt(savedScale, 10), false); // Apply without re-saving

        // Load and Apply Color State
        const savedColor = localStorage.getItem('backgroundColor') || 'default';
        
        // Apply background color to the body
        body.style.backgroundColor = colorMap[savedColor];
        
        // Add class to body for card-level color changes (handled by CSS)
        body.classList.remove('tan-background', 'grey-background');
        if (savedColor === 'tan') {
            body.classList.add('tan-background');
        } else if (savedColor === 'grey') {
            body.classList.add('grey-background');
        }


        // Set the active color circle button
        colorCircles.forEach(circle => {
            circle.classList.remove('active');
            if (circle.dataset.color === savedColor) {
                circle.classList.add('active');
            } else if (savedColor === 'default' && circle.dataset.color === 'default') {
                circle.classList.add('active');
            }
        });
    };
    
    // --- CRITICAL Scaling Logic ---
    
    // Finds the closest preferred zoom level for snapping the slider.
    const snapToNearestPreferredLevel = (currentValue) => {
        return preferredZoomLevels.reduce((prev, curr) => {
            return (Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev);
        });
    };

    /**
     * Applies page scaling by setting the base font size (1rem) on the root element.
     */
    const applyScale = (value, save = true) => {
        const scaleFactor = value / 100;

        if (rootElement) {
            // Calculates the new pixel size for 1rem (base is 16px)
            const newBaseFontSize = 16 * scaleFactor;
            // This line drives all the REM unit scaling in your CSS
            rootElement.style.fontSize = `${newBaseFontSize}px`;
        }
        
        if (scaleValueDisplay) {
            scaleValueDisplay.textContent = `${value}%`;
        }
        
        if (save) {
            localStorage.setItem('pageScale', value);
        }
    };

    // --- Event Listeners Initialization ---

    // Menu Listeners
    if (menuTrigger) menuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        openMenu();
    });
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    
    if (navLinks) {
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') closeMenu();
        });
    }

    // Close scale dropdown when clicking outside
    document.addEventListener('click', (e) => {
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

    // Scale Toggle Listener (A)
    if (scaleToggle) {
        scaleToggle.addEventListener('click', () => {
            const isVisible = scaleDropdown.classList.toggle('visible');
            scaleToggle.classList.toggle('active', isVisible);
            scaleToggle.setAttribute('aria-expanded', isVisible);
            scaleDropdown.setAttribute('aria-hidden', !isVisible);
        });
    }

    // Scale Slider Listeners
    if (scaleSlider) {
        // Debounced function that applies the final snapped value and zoom
        const debouncedApplySnapAndScale = debounce((snappedValue) => {
            applyScale(snappedValue);
        }, DEBOUNCE_TIME);
        
        // Continuously snap the visual display and trigger the debounced zoom.
        scaleSlider.addEventListener('input', (e) => {
            const currentValue = parseInt(e.target.value, 10);
            const snappedValue = snapToNearestPreferredLevel(currentValue);
            
            // NOTE: Removed line 'scaleSlider.value = snappedValue;'
            // The slider value should only snap when the user stops dragging (on 'change') 
            // to avoid confusing jumpiness during the 'input' event.

            if (scaleValueDisplay) {
                scaleValueDisplay.textContent = `${snappedValue}%`;
            }
            
            debouncedApplySnapAndScale(snappedValue);
        });
        
        // Ensure the final zoom happens immediately on mouse release, AND set the snapped slider value.
        scaleSlider.addEventListener('change', (e) => {
            const currentValue = parseInt(e.target.value, 10);
            const snappedValue = snapToNearestPreferredLevel(currentValue);

            clearTimeout(debounceTimer); 
            
            // CRITICAL FIX: Explicitly set the slider to the snapped value on change
            scaleSlider.value = snappedValue;
            
            applyScale(snappedValue); 
        });
    }


    // Bold Text Toggle Listener (B)
    if (boldToggle) {
        boldToggle.addEventListener('click', () => {
            // Optional: reset scale when bold is toggled
            if (scaleSlider) {
                scaleSlider.value = 100; // Reset scale to 100%
                applyScale(100);
            }
            
            const isActive = body.classList.toggle('bold-text');
            boldToggle.classList.toggle('active', isActive);
            localStorage.setItem('boldText', isActive); 
        });
    }

    // Background Color Changer Listeners (Circles)
    if (colorCircles.length > 0) {
        colorCircles.forEach(circle => {
            circle.addEventListener('click', () => {
                const color = circle.getAttribute('data-color');
                
                // 1. Set the body background using the colorMap (for fast body color change)
                body.style.backgroundColor = colorMap[color];
                localStorage.setItem('backgroundColor', color);
                
                // 2. Manage the body classes for card background changes (handled by CSS)
                body.classList.remove('tan-background', 'grey-background');
                if (color === 'tan') {
                    body.classList.add('tan-background');
                } else if (color === 'grey') {
                    body.classList.add('grey-background');
                }
                
                // 3. Update active state on buttons
                colorCircles.forEach(c => c.classList.remove('active'));
                circle.classList.add('active');
            });
        });
    }

    // Smooth Scroll for internal links
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
                if (link.closest('#off-canvas-menu')) {
                    closeMenu(); 
                }
            }
        });
    });

    // Scroll Fade-In Animations Observer
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view'); // Using 'in-view' class
                    observer.unobserve(entry.target);
                }
            });
        },
        { 
            rootMargin: '0px 0px -100px 0px', // Start showing a bit earlier
            threshold: 0.1 
        }
    );
    animateElements.forEach(el => observer.observe(el));


    // Hope Script Quote Fade-In Observer
    const quoteCardContainer = document.querySelector('.quote-card-container');
    const hopeScript = document.querySelector('.quote-label'); 
    
    function showHopeScript() {
        if (hopeScript) {
            // Apply transition and final opacity to trigger fade-in
            hopeScript.style.transition = 'opacity 0.8s ease 0.3s';
            hopeScript.style.opacity = '1';
        }
    }

    if (quoteCardContainer) {
        const quoteObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        showHopeScript();
                        quoteObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 } 
        );
        quoteObserver.observe(quoteCardContainer);
    } else {
        // Fallback for cases where container is missing but script exists
        showHopeScript();
    }
    
    // Scroll to top on page load and load state
    window.addEventListener('load', () => {
        window.scrollTo(0, 0); 
        loadState();
    });
    
    // NAVIGATION CAPSULE SCROLL VISIBILITY LOGIC (Hide/Show Nav on Scroll)
    if (navCapsule) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop < lastScrollTop || scrollTop === 0) {
                // Scrolling UP or at the very TOP
                navCapsule.classList.remove('hidden');
            } else if (scrollTop > lastScrollTop && scrollTop > 50) {
                // Scrolling DOWN and past the initial buffer
                navCapsule.classList.add('hidden');
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
        }, false);
    }
});