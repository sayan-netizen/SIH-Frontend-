/**
 * Citizen Registration JavaScript
 * Handles citizen-specific registration form validation and submission
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registerForm = document.getElementById('citizenRegisterForm');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const registerSuccess = document.getElementById('registerSuccess');
    const successMessage = document.getElementById('successMessage');
    
    // Form fields
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const agreeTermsInput = document.getElementById('agreeTerms');
    
    // Initialize
    init();
    
    function init() {
        setupEventListeners();
        setupFieldValidation();
    }
    
    function setupEventListeners() {
        // Form submission
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegistration);
        }
        
        // Password toggle functionality
        const toggleButtons = document.querySelectorAll('.toggle-password');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                
                if (passwordInput) {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    
                    // Toggle icon
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-eye');
                        icon.classList.toggle('fa-eye-slash');
                    }
                }
            });
        });
    }
    
    function setupFieldValidation() {
        // Real-time validation
        if (fullNameInput) fullNameInput.addEventListener('blur', validateFullName);
        if (emailInput) emailInput.addEventListener('blur', validateEmail);
        if (phoneInput) phoneInput.addEventListener('blur', validatePhone);
        if (passwordInput) passwordInput.addEventListener('blur', validatePassword);
        if (confirmPasswordInput) confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
    }
    
    function handleRegistration(event) {
        event.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate form
        if (validateForm()) {
            // Get form data
            const formData = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                password: passwordInput.value,
                role: 'citizen' // Set role as citizen
            };
            
            // Disable submit button and show loading state
            const submitBtn = document.getElementById('registerButton');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            
            // Call auth service
            authService.register(formData)
                .then(user => {
                    console.log('Citizen registration successful:', user);
                    
                    // Show success message
                    registerFormContainer.classList.add('hidden');
                    registerSuccess.classList.remove('hidden');
                    
                    // Set success message
                    if (successMessage) {
                        successMessage.textContent = 'Your citizen account has been created successfully! You can now log in and start reporting disasters in your area.';
                    }
                })
                .catch(error => {
                    console.error('Registration error:', error);
                    
                    // Show error message
                    showError('fullNameError', error.message || 'Registration failed. Please try again.');
                    
                    // Scroll to top of form
                    registerFormContainer.scrollTop = 0;
                })
                .finally(() => {
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                });
        }
    }
    
    function validateForm() {
        let isValid = true;
        
        if (!validateFullName()) isValid = false;
        if (!validateEmail()) isValid = false;
        if (!validatePhone()) isValid = false;
        if (!validatePassword()) isValid = false;
        if (!validateConfirmPassword()) isValid = false;
        if (!validateTermsAgreement()) isValid = false;
        
        return isValid;
    }
    
    function validateFullName() {
        const fullName = fullNameInput.value.trim();
        if (!fullName) {
            showError('fullNameError', 'Please enter your full name');
            return false;
        } else if (fullName.length < 2) {
            showError('fullNameError', 'Full name must be at least 2 characters long');
            return false;
        } else {
            clearError('fullNameError');
            return true;
        }
    }
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showError('emailError', 'Please enter your email address');
            return false;
        } else if (!emailRegex.test(email)) {
            showError('emailError', 'Please enter a valid email address');
            return false;
        } else {
            clearError('emailError');
            return true;
        }
    }
    
    function validatePhone() {
        const phone = phoneInput.value.trim();
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        
        if (!phone) {
            showError('phoneError', 'Please enter your phone number');
            return false;
        } else if (!phoneRegex.test(phone.replace(/[-\s\(\)]/g, ''))) {
            showError('phoneError', 'Please enter a valid phone number');
            return false;
        } else {
            clearError('phoneError');
            return true;
        }
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            showError('passwordError', 'Please enter a password');
            return false;
        } else if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters long');
            return false;
        } else {
            clearError('passwordError');
            return true;
        }
    }
    
    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            showError('confirmPasswordError', 'Please confirm your password');
            return false;
        } else if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            return false;
        } else {
            clearError('confirmPasswordError');
            return true;
        }
    }
    
    function validateTermsAgreement() {
        if (!agreeTermsInput.checked) {
            showError('agreeTermsError', 'You must agree to the Terms of Service and Privacy Policy');
            return false;
        } else {
            clearError('agreeTermsError');
            return true;
        }
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }
});