/**
 * Login functionality for Disaster Alert System
 * Handles user authentication with role-specific flows
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginOptions = document.getElementById('loginOptions');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const loginTypeTitle = document.getElementById('loginTypeTitle');
    const loginForm = document.getElementById('loginForm');
    const backBtn = document.getElementById('backBtn');
    const officialFields = document.querySelectorAll('.official-fields');
    const adminFields = document.querySelectorAll('.admin-fields');
    
    // Login option elements
    const citizenLoginOption = document.getElementById('citizenLoginOption');
    const officialLoginOption = document.getElementById('officialLoginOption');
    const adminLoginOption = document.getElementById('adminLoginOption');
    
    // Form fields
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheck = document.getElementById('rememberMe');
    const officialIdInput = document.getElementById('officialId');
    const adminCodeInput = document.getElementById('adminCode');
    
    // Error message elements
    const loginError = document.getElementById('loginError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const officialIdError = document.getElementById('officialIdError');
    const adminCodeError = document.getElementById('adminCodeError');
    
    // Current login type
    let currentLoginType = 'citizen';
    
    // Initialize
    init();
    
    function init() {
        // Set up event listeners
        setupEventListeners();
        
        // Check if user is already logged in
        checkLoginStatus();
        
        // Check URL params for auto-showing specific form type
        checkUrlParameters();
    }
    
    function setupEventListeners() {
        // Login option clicks
        if (citizenLoginOption) {
            citizenLoginOption.addEventListener('click', () => showLoginForm('citizen'));
        }
        
        if (officialLoginOption) {
            officialLoginOption.addEventListener('click', () => showLoginForm('official'));
        }
        
        if (adminLoginOption) {
            adminLoginOption.addEventListener('click', () => showLoginForm('admin'));
        }
        
        // Back button
        if (backBtn) {
            backBtn.addEventListener('click', showOptions);
        }
        
        // Form submission
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Toggle icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        }
    }
    
    // Show login form based on type
    function showLoginForm(type) {
        currentLoginType = type;
        
        if (loginOptions && loginFormContainer) {
            loginOptions.classList.add('hidden');
            loginFormContainer.classList.remove('hidden');
        }
        
        // Update form title
        if (loginTypeTitle) {
            loginTypeTitle.textContent = `${capitalizeFirstLetter(type)} Login`;
        }
        
        // Show/hide role-specific fields
        hideElements(officialFields);
        hideElements(adminFields);
        
        if (type === 'official') {
            showElements(officialFields);
        } else if (type === 'admin') {
            showElements(adminFields);
        }
        
        // Populate remembered email if available
        const rememberedEmail = localStorage.getItem('remembered_email');
        if (emailInput && rememberedEmail) {
            emailInput.value = rememberedEmail;
            if (rememberMeCheck) {
                rememberMeCheck.checked = true;
            }
        }
        
        // Clear any previous error messages
        clearErrors();
    }
    
    // Show login options
    function showOptions() {
        if (loginOptions && loginFormContainer) {
            loginOptions.classList.remove('hidden');
            loginFormContainer.classList.add('hidden');
        }
        
        // Reset form
        if (loginForm) {
            loginForm.reset();
            clearErrors();
        }
    }
    
    // Handle login form submission
    function handleLogin(event) {
        event.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Validate form
        if (validateForm()) {
            // Get form data
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            const rememberMe = rememberMeCheck ? rememberMeCheck.checked : false;
            
            // Additional data based on login type
            let additionalData = {};
            if (currentLoginType === 'official' && officialIdInput) {
                additionalData.officialId = officialIdInput.value.trim();
            }
            if (currentLoginType === 'admin' && adminCodeInput) {
                additionalData.adminCode = adminCodeInput.value.trim();
            }
            
            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Logging in...';
            submitButton.disabled = true;
            
            // Call auth service (ensure auth-service.js is loaded)
            if (typeof authService === 'undefined') {
                showLoginError('Authentication service not available');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                return;
            }
            
            authService.login(email, password, currentLoginType)
                .then(user => {
                    console.log('Login successful:', user);
                    
                    // Save email if remember me is checked
                    if (rememberMe) {
                        localStorage.setItem('remembered_email', email);
                    } else {
                        localStorage.removeItem('remembered_email');
                    }
                    
                    // Redirect based on user type (the API returns 'type' property)
                    redirectAfterLogin(user.type);
                })
                .catch(error => {
                    console.error('Login error:', error);
                    showLoginError(error.message || 'Login failed. Please check your credentials.');
                    
                    // Reset button state
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                });
        }
    }
    
    // Validate form
    function validateForm() {
        let isValid = true;
        
        // Validate email
        if (!emailInput || !emailInput.value.trim()) {
            showError('emailError', 'Please enter your email address');
            isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!passwordInput || !passwordInput.value) {
            showError('passwordError', 'Please enter your password');
            isValid = false;
        }
        
        // Validate role-specific fields
        if (currentLoginType === 'official' && officialIdInput && !officialIdInput.value.trim()) {
            showError('officialIdError', 'Please enter your official ID');
            isValid = false;
        }
        
        if (currentLoginType === 'admin' && adminCodeInput && !adminCodeInput.value.trim()) {
            showError('adminCodeError', 'Please enter admin access code');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show login error message
    function showLoginError(message) {
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
        }
    }
    
    // Show field error message
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    // Clear all error messages
    function clearErrors() {
        const errorElements = [loginError, emailError, passwordError, officialIdError, adminCodeError];
        
        errorElements.forEach(element => {
            if (element) {
                element.textContent = '';
                element.style.display = 'none';
            }
        });
    }
    
    // Check if email is valid
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Show elements
    function showElements(elements) {
        if (elements) {
            elements.forEach(element => element.classList.remove('hidden'));
        }
    }
    
    // Hide elements
    function hideElements(elements) {
        if (elements) {
            elements.forEach(element => element.classList.add('hidden'));
        }
    }
    
    // Capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Check if user is already logged in
    function checkLoginStatus() {
        if (typeof authService !== 'undefined' && authService.isLoggedIn && authService.isLoggedIn()) {
            const user = authService.getCurrentUser();
            if (user) {
                redirectAfterLogin(user.type);
            }
        }
    }
    
    // Redirect after successful login based on role
    function redirectAfterLogin(userType) {
        // Check for redirect URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        
        if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
        }
        
        // Default redirects based on role
        if (userType === 'admin') {
            window.location.href = '/pages/reports.html'; // Admin goes to reports page
        } else if (userType === 'official') {
            window.location.href = '/pages/reports.html'; // Officials go to reports page  
        } else {
            window.location.href = '/home.html'; // Citizens go to home page
        }
    }
    
    // Check URL parameters
    function checkUrlParameters() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const loginType = urlParams.get('type');
            
            if (loginType && ['citizen', 'official', 'admin'].includes(loginType)) {
                showLoginForm(loginType);
            }
        } catch (e) {
            console.error('Error parsing URL parameters:', e);
        }
    }
});