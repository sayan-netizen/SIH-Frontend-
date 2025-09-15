// Basic navigation functionality for static pages
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu toggle for mobile - Enhanced version
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');
    
    console.log('Navigation initialized');
    console.log('Mobile menu toggle element:', mobileMenuToggle);
    console.log('Main nav element:', mainNav);
    
    if (mobileMenuToggle && mainNav) {
        // Add click event listener
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger menu clicked!');
            
            // Toggle the mobile menu
            const isOpen = mainNav.classList.contains('mobile-open');
            
            if (isOpen) {
                mainNav.classList.remove('mobile-open');
                mobileMenuToggle.classList.remove('menu-active');
                console.log('Menu closed');
            } else {
                mainNav.classList.add('mobile-open');
                mobileMenuToggle.classList.add('menu-active');
                console.log('Menu opened');
            }
            
            // Animate hamburger lines
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (spans.length >= 3) {
                if (!isOpen) { // Opening menu
                    spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
                } else { // Closing menu
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && mainNav.classList.contains('mobile-open')) {
                mainNav.classList.remove('mobile-open');
                mobileMenuToggle.classList.remove('menu-active');
                
                // Reset hamburger animation
                const spans = mobileMenuToggle.querySelectorAll('span');
                if (spans.length >= 3) {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
                console.log('Menu closed by clicking outside');
            }
        });
        
        // Close menu when window is resized to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && mainNav.classList.contains('mobile-open')) {
                mainNav.classList.remove('mobile-open');
                mobileMenuToggle.classList.remove('menu-active');
                
                // Reset hamburger animation
                const spans = mobileMenuToggle.querySelectorAll('span');
                if (spans.length >= 3) {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
        
        console.log('Mobile menu event listeners added successfully');
    } else {
        console.error('Mobile menu elements not found!');
        console.error('mobileMenuToggle:', mobileMenuToggle);
        console.error('mainNav:', mainNav);
    }
});