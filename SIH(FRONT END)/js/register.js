document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registerOptions = document.getElementById('registerOptions');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const backBtn = document.getElementById('backBtn');
    const registerForm = document.getElementById('registerForm');
    const registerTypeTitle = document.getElementById('registerTypeTitle');
    const officialFields = document.querySelectorAll('.official-fields');
    const adminFields = document.querySelectorAll('.admin-fields');
    
    // Registration option buttons
    const citizenRegisterOption = document.getElementById('citizenRegisterOption');
    const officialRegisterOption = document.getElementById('officialRegisterOption');
    const adminRegisterOption = document.getElementById('adminRegisterOption');
    
    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    
    // Current registration type
    let currentRegisterType = 'citizen';
    
    // Initialize
    init();
    
    function init() {
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Registration option clicks
        if (citizenRegisterOption) {
            citizenRegisterOption.addEventListener('click', () => showRegisterForm('citizen'));
        }
        
        if (officialRegisterOption) {
            officialRegisterOption.addEventListener('click', () => showRegisterForm('official'));
        }
        
        if (adminRegisterOption) {
            adminRegisterOption.addEventListener('click', () => showRegisterForm('admin'));
        }
        
        // Back button
        if (backBtn) {
            backBtn.addEventListener('click', showOptions);
        }
        
        // Password toggle button
        if (togglePassword) {
            togglePassword.addEventListener('click', togglePasswordVisibility);
        }
        
        // Form submission
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegistration);
        }
    }
    
    function showRegisterForm(type) {
        // Set current registration type
        currentRegisterType = type;
        
        // Show form container, hide options
        registerOptions.classList.add('hidden');
        registerFormContainer.classList.remove('hidden');
        
        // Update form title
        if (registerTypeTitle) {
            registerTypeTitle.textContent = `${capitalizeFirstLetter(type)} Registration`;
        }
        
        // Show/hide role-specific fields
        hideElements(officialFields);
        hideElements(adminFields);
        
        if (type === 'official') {
            showElements(officialFields);
        } else if (type === 'admin') {
            showElements(adminFields);
        }
    }
    
    function showOptions() {
        // Show options, hide form
        registerOptions.classList.remove('hidden');
        registerFormContainer.classList.add('hidden');
        
        // Reset form
        registerForm.reset();
        clearAllErrors();
    }
    
    function togglePasswordVisibility() {
        const passwordField = document.getElementById('password');
        const icon = togglePassword.querySelector('i');
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    function handleRegistration(event) {
        event.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate form
        if (validateForm()) {
            // Get form data
            const formData = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                role: currentRegisterType
            };
            
            // Add role-specific data
            if (currentRegisterType === 'official') {
                formData.officialId = document.getElementById('officialId').value.trim();
                formData.department = document.getElementById('department').value;
            } else if (currentRegisterType === 'admin') {
                formData.adminCode = document.getElementById('adminCode').value.trim();
            }
            
            // Disable submit button and show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';
            
            // Call auth service
            authService.register(formData)
                .then(user => {
                    console.log('Registration successful:', user);
                    
                    // Show success message and redirect
                    alert(`Registration successful! Welcome ${user.fullName}!`);
                    
                    // Redirect to appropriate page
                    if (currentRegisterType === 'admin') {
                        window.location.href = '../../index.html';
                    } else {
                        window.location.href = 'login.html';
                    }
                })
                .catch(error => {
                    console.error('Registration error:', error);
                    
                    // Show error message
                    showError('registerError', error.message || 'Registration failed. Please try again.');
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                });
        }
    }
    
    function validateForm() {
        let isValid = true;
        
        // Validate full name
        const fullName = document.getElementById('fullName').value.trim();
        if (!fullName) {
            showError('fullNameError', 'Please enter your full name');
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('email').value.trim();
        if (!email) {
            showError('emailError', 'Please enter your email address');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        const password = document.getElementById('password').value;
        if (!password) {
            showError('passwordError', 'Please enter a password');
            isValid = false;
        } else if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters long');
            isValid = false;
        }
        
        // Validate phone
        const phone = document.getElementById('phone').value.trim();
        if (!phone) {
            showError('phoneError', 'Please enter your phone number');
            isValid = false;
        }
        
        // Validate address
        const address = document.getElementById('address').value.trim();
        if (!address) {
            showError('addressError', 'Please enter your address');
            isValid = false;
        }
        
        // Role-specific validation
        if (currentRegisterType === 'official') {
            const officialId = document.getElementById('officialId').value.trim();
            if (!officialId) {
                showError('officialIdError', 'Please enter your official ID');
                isValid = false;
            }
            
            const department = document.getElementById('department').value;
            if (!department) {
                showError('departmentError', 'Please select your department');
                isValid = false;
            }
        }
        
        if (currentRegisterType === 'admin') {
            const adminCode = document.getElementById('adminCode').value.trim();
            if (!adminCode) {
                showError('adminCodeError', 'Please enter the admin access code');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Helper functions
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
    
    function showElements(elements) {
        elements.forEach(element => element.classList.remove('hidden'));
    }
    
    function hideElements(elements) {
        elements.forEach(element => element.classList.add('hidden'));
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});