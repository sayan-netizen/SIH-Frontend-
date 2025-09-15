// Dark Mode Functionality
class DarkModeManager {
    constructor() {
        this.init();
    }

    init() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (prefersDark) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Initialize theme toggle button
        this.initThemeToggle();

        console.log('🌙 Dark Mode Manager initialized');
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle button if it exists
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        }

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add a subtle animation effect
        document.body.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    initThemeToggle() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupExistingToggle());
        } else {
            this.setupExistingToggle();
        }
    }

    setupExistingToggle() {
        // Check if there's already a theme toggle button in the HTML
        const existingToggle = document.getElementById('themeToggle');
        
        if (existingToggle) {
            // Use the existing toggle button
            existingToggle.addEventListener('click', () => {
                this.toggleTheme();
                
                // Add ripple effect
                existingToggle.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    existingToggle.style.transform = 'scale(1)';
                }, 100);
            });
            
            console.log('🎨 Using existing theme toggle button');
        } else {
            // Create theme toggle button as fallback
            this.createThemeToggle();
        }
    }

    createThemeToggle() {
        // Find the auth buttons container to place the toggle next to it
        const authButtons = document.querySelector('.auth-buttons');
        const navRight = document.querySelector('.nav-right');
        const headerContainer = document.querySelector('.header-container');
        
        // Create theme toggle button
        const themeToggle = document.createElement('button');
        themeToggle.id = 'themeToggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', `Switch to ${this.getCurrentTheme() === 'dark' ? 'light' : 'dark'} mode`);
        themeToggle.setAttribute('title', 'Toggle dark mode');

        themeToggle.innerHTML = `
            <div class="theme-toggle-slider"></div>
            <i class="fas fa-sun theme-toggle-icon sun-icon"></i>
            <i class="fas fa-moon theme-toggle-icon moon-icon"></i>
        `;

        // Add click event listener
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
            
            // Add ripple effect
            themeToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 100);
        });

        // Place the toggle button intelligently based on page structure
        if (authButtons) {
            // For pages with auth buttons, place it next to them
            authButtons.parentNode.insertBefore(themeToggle, authButtons.nextSibling);
        } else if (navRight) {
            // For dashboard pages, place it in the nav-right section
            navRight.appendChild(themeToggle);
        } else if (headerContainer) {
            // For other pages, place it in the header container
            const nav = headerContainer.querySelector('nav') || headerContainer.querySelector('.main-nav');
            if (nav) {
                nav.appendChild(themeToggle);
            } else {
                headerContainer.appendChild(themeToggle);
            }
        } else {
            // Fallback: place it in the first available header
            const header = document.querySelector('header');
            if (header) {
                header.appendChild(themeToggle);
            }
        }

        console.log('🎨 Theme toggle button created and placed');
    }
}

// Initialize Dark Mode Manager
const darkModeManager = new DarkModeManager();

// Make it globally available
window.darkModeManager = darkModeManager;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeManager;
}