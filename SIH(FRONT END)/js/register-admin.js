/**
 * Admin Registration JavaScript
 * Handles admin-specific registration form validation and submission
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registerForm = document.getElementById('adminRegisterForm');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const registerSuccess = document.getElementById('registerSuccess');
    const successMessage = document.getElementById('successMessage');
    
    // Form fields
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const adminCodeInput = document.getElementById('adminCode');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const agreeTermsInput = document.getElementById('agreeTerms');
    
    // Admin code - This should be configured securely
    const VALID_ADMIN_CODES = ['ADMIN123', 'DISASTER_ADMIN_2024', 'SIH_ADMIN_CODE'];
    
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
        if (adminCodeInput) adminCodeInput.addEventListener('blur', validateAdminCode);
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
                role: 'admin', // Set role as admin
                adminCode: adminCodeInput.value.trim()
            };
            
            // Disable submit button and show loading state
            const submitBtn = document.getElementById('registerButton');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Admin Account...';
            
            // Call auth service
            authService.register(formData)
                .then(user => {
                    console.log('Admin registration successful:', user);
                    
                    // Show success message
                    registerFormContainer.classList.add('hidden');
                    registerSuccess.classList.remove('hidden');
                    
                    // Set success message
                    if (successMessage) {
                        successMessage.textContent = 'Your administrator account has been created successfully! You now have full system privileges and can manage all aspects of the disaster alert system.';
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
                    submitBtn.innerHTML = '<i class="fas fa-user-shield"></i> Create Admin Account';
                });
        }
    }
    
    function validateForm() {
        let isValid = true;
        
        if (!validateFullName()) isValid = false;
        if (!validateEmail()) isValid = false;
        if (!validatePhone()) isValid = false;
        if (!validateAdminCode()) isValid = false;
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
            showError('emailError', 'Please enter your admin email address');
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
    
    function validateAdminCode() {
        const adminCode = adminCodeInput.value.trim();
        
        if (!adminCode) {
            showError('adminCodeError', 'Please enter the admin access code');
            return false;
        } else if (!VALID_ADMIN_CODES.includes(adminCode)) {
            showError('adminCodeError', 'Invalid admin access code. Contact your system administrator.');
            return false;
        } else {
            clearError('adminCodeError');
            return true;
        }
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            showError('passwordError', 'Please enter a password');
            return false;
        } else if (password.length < 8) {
            showError('passwordError', 'Admin password must be at least 8 characters long');
            return false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showError('passwordError', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
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
            showError('agreeTermsError', 'You must agree to the Terms of Service, Privacy Policy, and Admin Guidelines');
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