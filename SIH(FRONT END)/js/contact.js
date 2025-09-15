document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const contactForm = document.getElementById('contactForm');
    const adminEmailSpan = document.querySelector('.admin-email');
    
    // Initialize page
    initializeContactPage();
    
    // Initialize contact page functionality
    function initializeContactPage() {
        // Load admin email dynamically
        loadAdminEmail();
        
        // Set up form submission handler
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmission);
        }
    }
    
    // Load admin email from API
    async function loadAdminEmail() {
        try {
            const response = await fetch('/api/admin/email');
            const data = await response.json();
            
            if (data.success && adminEmailSpan) {
                adminEmailSpan.textContent = data.adminEmail;
                adminEmailSpan.title = `Send messages directly to: ${data.adminEmail}`;
            }
        } catch (error) {
            console.error('Failed to load admin email:', error);
            // Keep the default email if API fails
        }
    }
    
    // Handle form submission
    async function handleFormSubmission(event) {
        event.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Prepare form data
        const formData = new FormData(contactForm);
        const contactData = {
            contactName: formData.get('contactName').trim(),
            contactEmail: formData.get('contactEmail').trim(),
            subject: formData.get('subject'),
            message: formData.get('message').trim()
        };
        
        // Show loading state
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send contact message
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showSuccessMessage(result.message);
                
                // Reset form
                contactForm.reset();
                
                // Show admin email confirmation
                if (result.adminEmail) {
                    showAdminEmailConfirmation(result.adminEmail);
                }
            } else {
                // Show error message
                showErrorMessage(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showErrorMessage('Failed to send message. Please check your connection and try again.');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Validate name
        const name = document.getElementById('contactName').value.trim();
        if (!name) {
            showFieldError('contactName', 'Please enter your name');
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('contactEmail').value.trim();
        if (!email) {
            showFieldError('contactEmail', 'Please enter your email');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('contactEmail', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate subject
        const subject = document.getElementById('subject').value;
        if (!subject) {
            showFieldError('subject', 'Please select a subject');
            isValid = false;
        }
        
        // Validate message
        const message = document.getElementById('message').value.trim();
        if (!message) {
            showFieldError('message', 'Please enter your message');
            isValid = false;
        } else if (message.length < 10) {
            showFieldError('message', 'Please enter a more detailed message (at least 10 characters)');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Show field error
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');
        
        // Remove existing error
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error styling
        field.classList.add('error');
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }
    
    // Clear all errors
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.field-error');
        errorElements.forEach(element => element.remove());
        
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
    }
    
    // Show success message
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        contactForm.insertBefore(successDiv, contactForm.firstChild);
        
        // Scroll to message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 8000);
    }
    
    // Show error message
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        contactForm.insertBefore(errorDiv, contactForm.firstChild);
        
        // Scroll to message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-remove after 6 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 6000);
    }
    
    // Show admin email confirmation
    function showAdminEmailConfirmation(adminEmail) {
        const confirmationDiv = document.createElement('div');
        confirmationDiv.className = 'admin-confirmation';
        confirmationDiv.innerHTML = `
            <i class="fas fa-envelope"></i>
            <span>Your message has been sent directly to our admin team at <strong>${adminEmail}</strong></span>
        `;
        
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            successMessage.appendChild(confirmationDiv);
        }
    }
});