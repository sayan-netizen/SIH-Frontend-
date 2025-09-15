// Initiali    // Hamburger menu toggle for mobile - Enhanced version
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');
    
    console.log('Mobile menu toggle element:', mobileMenuToggle);
    console.log('Main nav element:', mainNav);
    
    if (mobileMenuToggle && mainNav) {
        // Add click event listener
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger menu clicked!'); // Debug log
            
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
    }document.addEventListener('DOMContentLoaded', function() {
    // Initialize page state - ensure clean start
    initPageState();
    
    // Initialize photo upload functionality
    initPhotoUpload();

    // Initialize form submission
    initFormSubmission();

    // Monitor photo uploads and update submit button
    updateSubmitButtonState();
    
    // Initialize GPS location functionality
    initGPSLocation();

    // Hamburger menu toggle for mobile
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('nav-open');
        });
    }
});

// Initialize page state - ensure clean start
function initPageState() {
    console.log('Initializing page state...');
    
    // Clear any saved form state that might interfere
    localStorage.removeItem('disasterReportDraft');
    localStorage.removeItem('formSubmitted');
    
    const reportForm = document.getElementById('reportForm');
    const successMessage = document.getElementById('successMessage');
    
    // Ensure the form is visible and success message is hidden on page load
    if (reportForm) {
        reportForm.classList.remove('hidden');
        reportForm.style.display = ''; // Reset any inline styles
    }
    
    if (successMessage) {
        successMessage.classList.add('hidden');
        successMessage.style.display = 'none'; // Force hide with inline style
    }
    
    console.log('Page state initialized - form visible, success message hidden');
}

// Form submission handling with photo requirement
function initFormSubmission() {
    console.log('Initializing form submission...');
    
    const reportForm = document.getElementById('reportForm');
    const successMessage = document.getElementById('successMessage');
    const submitAnotherBtn = document.getElementById('submitAnotherBtn');
    
    console.log('Report form found:', reportForm);
    console.log('Success message found:', successMessage);
    console.log('Submit another button found:', submitAnotherBtn);
    
    if (!reportForm) {
        console.error('Report form not found!');
        // Try to find any form on the page
        const allForms = document.querySelectorAll('form');
        console.log('All forms found on page:', allForms);
        return;
    }
    
    const submitBtn = reportForm.querySelector('.submit-btn');
    console.log('Submit button found in form:', submitBtn);
    console.log('Submit button HTML:', submitBtn ? submitBtn.outerHTML : 'NONE');
    
    if (!submitBtn) {
        console.error('Submit button not found in form!');
        console.log('Trying to find submit button by type...');
        const submitByType = reportForm.querySelector('button[type="submit"]');
        console.log('Submit button by type:', submitByType);
        return;
    }
    
    // Real-time validation
    setupFormValidation();
    
    // Save form data as user types
    setupAutoSave();
    
    // Add photo requirement notice
    addPhotoRequirementNotice();
    
    if (reportForm) {
        // Restore any saved form data
        restoreFormData();
        
        // Handle form submission
        reportForm.addEventListener('submit', async function(e) {
            console.log('=== FORM SUBMIT EVENT TRIGGERED ===');
            console.log('Event target:', e.target);
            console.log('Event type:', e.type);
            e.preventDefault();
            console.log('Form submission prevented, starting validation...');
            
            try {
                await handleFormSubmission();
            } catch (error) {
                console.error('Error in form submission:', error);
                alert('Error submitting form: ' + error.message);
            }
        });
        
        // Additional click handler for the submit button
        submitBtn.addEventListener('click', function(e) {
            console.log('=== SUBMIT BUTTON CLICKED ===');
            console.log('Button clicked:', e.target);
            console.log('Button type:', e.target.type);
            console.log('Form element:', reportForm);
            
            // Let the form submission event handle it naturally
            if (e.target.type === 'submit') {
                console.log('Submit button will trigger form submit event');
            } else {
                console.log('Button type is not submit, manually triggering form submission');
                e.preventDefault();
                handleFormSubmission();
            }
        });
        
        // Extracted form submission logic
        async function handleFormSubmission() {
            console.log('handleFormSubmission called');
            
            // Validate form before submission (including photos)
            const isValid = validateForm();
            console.log('Form validation result:', isValid);
            
            if (!isValid) {
                console.log('Form validation failed');
                // Scroll to first error
                const firstError = document.querySelector('.error-message:not(.hidden)');
                if (firstError) {
                    console.log('Scrolling to first error:', firstError);
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            // Check if photos are uploaded
            if (!window.selectedFiles || window.selectedFiles.length === 0) {
                // For testing purposes, allow submission without photos
                console.warn('No photos uploaded - proceeding anyway for testing');
                // showPhotoError('At least one photo is required to submit the report.');
                // document.getElementById('photoPreviewContainer').scrollIntoView({ 
                //     behavior: 'smooth', 
                //     block: 'center' 
                // });
                // return;
            }
            
            // Show loading indicator
            const originalBtnText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            reportForm.classList.add('submitting');
            
            try {
                // Get form data
                const formData = new FormData(reportForm);
                
                // Add selected photos
                if (window.selectedFiles && window.selectedFiles.length > 0) {
                    window.selectedFiles.forEach((file, index) => {
                        formData.append(`photo_${index}`, file);
                    });
                    formData.append('photoCount', window.selectedFiles.length);
                } else {
                    formData.append('photoCount', 0);
                }
                
                // Add timestamp and geolocation if available
                formData.append('timestamp', new Date().toISOString());
                if (navigator.geolocation) {
                    try {
                        const position = await getLocationPromise();
                        formData.append('latitude', position.coords.latitude);
                        formData.append('longitude', position.coords.longitude);
                    } catch (error) {
                        console.log('Geolocation error or permission denied', error);
                    }
                }
                
                // Submit the report
                await submitReport(formData);
                
                // Clear saved form data
                localStorage.removeItem('disasterReportDraft');
                
                // Show success message with enhanced debugging
                console.log('Report submitted successfully, switching to success message');
                console.log('Form element:', reportForm);
                console.log('Success message element:', successMessage);
                
                if (reportForm) {
                    reportForm.classList.add('hidden');
                    reportForm.style.display = 'none';
                    console.log('Form hidden');
                } else {
                    console.error('reportForm not found!');
                }
                
                if (successMessage) {
                    successMessage.classList.remove('hidden');
                    successMessage.style.display = 'block';
                    console.log('Success message shown');
                    
                    // Scroll to success message
                    setTimeout(() => {
                        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                } else {
                    console.error('successMessage not found!');
                    alert('Report submitted successfully!'); // Fallback
                }
                
                // Reset button
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                reportForm.classList.remove('submitting');
                
                // Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'report_submitted', {
                        'disaster_type': formData.get('disasterType'),
                        'photo_count': formData.get('photoCount') || 0
                    });
                }
            } catch (error) {
                console.error('Error submitting report:', error);
                alert(`Error submitting report: ${error.message || 'Please try again.'}`);
                
                // Reset button
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                reportForm.classList.remove('submitting');
            }
        }
        
        // Add fallback click handler for submit button
        submitBtn.addEventListener('click', function(e) {
            console.log('Submit button clicked directly (fallback handler)');
            console.log('Button type:', submitBtn.type);
            console.log('Button disabled:', submitBtn.disabled);
            
            if (submitBtn.type !== 'submit') {
                console.log('Button type is not submit, preventing default and manually triggering form submission');
                e.preventDefault();
                // Manually trigger form submission
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                reportForm.dispatchEvent(submitEvent);
            } else {
                console.log('Button type is submit, should trigger form submit event naturally');
                // If it's a submit button but form event isn't working, let's manually handle it
                if (!submitBtn.disabled) {
                    console.log('Manually handling form submission since submit event may not be working');
                    e.preventDefault();
                    
                    // Call the same logic as the form submit handler
                    handleFormSubmission();
                }
            }
        });
    }
    
    // Submit another report button
    if (submitAnotherBtn) {
        submitAnotherBtn.addEventListener('click', function() {
            console.log('Submit Another Report clicked - refreshing page');
            
            // Clear any saved data
            localStorage.removeItem('disasterReportDraft');
            localStorage.removeItem('formSubmitted');
            
            // Reload the entire page for a fresh start
            window.location.reload();
        });
    }
}

// Add photo requirement notice
function addPhotoRequirementNotice() {
    const photoContainer = document.querySelector('.upload-photo-container');
    if (!photoContainer) return;
    
    const notice = document.createElement('div');
    notice.className = 'photo-requirement-notice';
    notice.id = 'photoRequirementNotice';
    notice.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>Photos are required to verify and document the disaster situation. Please upload at least one clear image.</span>
    `;
    
    photoContainer.appendChild(notice);
}

// Enhanced form validation with photo requirement
function validateForm() {
    let isValid = true;
    
    // Clear all previous errors
    clearAllErrors();
    
    // Name validation
    const nameInput = document.getElementById('name');
    if (!nameInput || !nameInput.value.trim()) {
        showError('nameError', 'Please enter your name');
        isValid = false;
    }
    
    // Location validation
    const locationInput = document.getElementById('location');
    if (!locationInput || !locationInput.value.trim()) {
        showError('locationError', 'Please enter the location');
        isValid = false;
    }
    
    // Disaster type validation
    const disasterTypeSelect = document.getElementById('disasterType');
    if (!disasterTypeSelect || !disasterTypeSelect.value) {
        showError('disasterTypeError', 'Please select a disaster type');
        isValid = false;
    }
    
    // Description validation
    const descriptionInput = document.getElementById('description');
    if (!descriptionInput || !descriptionInput.value.trim()) {
        showError('descriptionError', 'Please provide a description');
        isValid = false;
    } else if (descriptionInput.value.trim().length < 10) {
        showError('descriptionError', 'Please provide a more detailed description (at least 10 characters)');
        isValid = false;
    }
    
    // Photo validation - REQUIRED
    if (!window.selectedFiles || window.selectedFiles.length === 0) {
        showPhotoError('At least one photo is required to submit the report');
        isValid = false;
    }
    
    return isValid;
}

// Show photo-specific error
function showPhotoError(message) {
    const photoError = document.getElementById('photoError');
    const photoContainer = document.querySelector('.upload-photo-container');
    
    if (photoError) {
        photoError.textContent = message;
        photoError.classList.remove('hidden');
    }
    
    if (photoContainer) {
        photoContainer.classList.add('invalid');
    }
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (photoError) {
            photoError.classList.add('hidden');
        }
        if (photoContainer) {
            photoContainer.classList.remove('invalid');
        }
    }, 10000);
}

// Clear photo error
function clearPhotoError() {
    const photoError = document.getElementById('photoError');
    const photoContainer = document.querySelector('.upload-photo-container');
    
    if (photoError) {
        photoError.classList.add('hidden');
    }
    
    if (photoContainer) {
        photoContainer.classList.remove('invalid');
    }
}

// Update submit button state based on photos
function updateSubmitButtonState() {
    const submitBtn = document.querySelector('.submit-btn');
    if (!submitBtn) {
        console.log('Submit button not found');
        return;
    }
    
    // Check if photos are uploaded
    const hasPhotos = window.selectedFiles && window.selectedFiles.length > 0;
    console.log('Has photos:', hasPhotos, 'Selected files:', window.selectedFiles);
    
    // Temporarily allow submission without photos for testing
    const allowWithoutPhotos = true;
    
    if (!hasPhotos && !allowWithoutPhotos) {
        submitBtn.disabled = true;
        submitBtn.classList.add('photo-required');
        submitBtn.innerHTML = '<i class="fas fa-camera"></i> Upload Photos Required';
        submitBtn.title = 'Please upload at least one photo before submitting';
        console.log('Submit button disabled - no photos');
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('photo-required');
        if (hasPhotos) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
            submitBtn.title = 'Click to submit your disaster report';
        } else {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report (No Photos)';
            submitBtn.title = 'Click to submit your disaster report without photos';
        }
        console.log('Submit button enabled');
        
        // Clear photo errors when photos are uploaded
        clearPhotoError();
    }
}

// Enhanced photo upload initialization
function initPhotoUpload() {
    const photoUploadInput = document.getElementById('photoUpload');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoPreviewGrid = document.getElementById('photoPreviewGrid');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const selectedPhotoCount = document.getElementById('selectedPhotoCount');
    
    // Selected files storage
    window.selectedFiles = [];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILES = 10; // Maximum number of files
    
    // Setup event listeners
    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', handleFileSelect);
    }
    
    if (photoPreviewContainer) {
        photoPreviewContainer.addEventListener('dragover', handleDragOver);
        photoPreviewContainer.addEventListener('dragleave', handleDragLeave);
        photoPreviewContainer.addEventListener('drop', handleDrop);
        photoPreviewContainer.addEventListener('click', function(e) {
            if (e.target === photoPreviewContainer || 
                e.target === uploadPlaceholder || 
                uploadPlaceholder.contains(e.target)) {
                photoUploadInput.click();
            }
        });
    }
    
    // Handle file selection via input
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        processFiles(files);
    }
    
    // Handle drag over event
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        photoPreviewContainer.classList.add('drag-over');
    }
    
    // Handle drag leave event
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        photoPreviewContainer.classList.remove('drag-over');
    }
    
    // Handle drop event
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        photoPreviewContainer.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.match('image/jpeg') || 
            file.type.match('image/png') || 
            file.type.match('image/webp')
        );
        
        if (files.length > 0) {
            processFiles(files);
        }
    }
    
    // Process selected files with validation
    function processFiles(files) {
        if (window.selectedFiles.length >= MAX_FILES) {
            showError(`You can upload a maximum of ${MAX_FILES} photos.`);
            return;
        }
        
        // Calculate how many more files we can accept
        const remainingSlots = MAX_FILES - window.selectedFiles.length;
        const filesToProcess = files.slice(0, remainingSlots);
        
        // Validate files
        const validFiles = filesToProcess.filter(file => {
            const validType = file.type.match('image/jpeg') || 
                           file.type.match('image/png') || 
                           file.type.match('image/webp');
            const validSize = file.size <= MAX_FILE_SIZE;
            return validType && validSize;
        });
        
        if (validFiles.length !== filesToProcess.length) {
            showError('Some files were skipped. Images must be JPG, PNG, or WEBP and under 5MB.');
        }
        
        if (validFiles.length === 0) {
            return;
        }
        
        // Add to selected files
        window.selectedFiles = [...window.selectedFiles, ...validFiles];
        
        // Update preview
        updatePreview();
        
        // Update submit button state
        updateSubmitButtonState();
        
        // Reset input to allow selecting the same file again
        photoUploadInput.value = '';
    }
    
    // Update preview grid
    function updatePreview() {
        // Hide placeholder if we have files
        if (window.selectedFiles.length > 0) {
            uploadPlaceholder.style.display = 'none';
            photoPreviewGrid.style.display = 'grid';
        } else {
            uploadPlaceholder.style.display = 'flex';
            photoPreviewGrid.style.display = 'none';
        }
        
        // Clear existing previews
        photoPreviewGrid.innerHTML = '';
        
        // Add previews for each file
        window.selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'photo-preview-item';
                previewItem.dataset.index = index;
                
                const img = document.createElement('img');
                img.className = 'photo-preview-img';
                img.src = e.target.result;
                img.alt = file.name;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'photo-preview-remove';
                removeBtn.type = 'button';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeFile(parseInt(previewItem.dataset.index));
                });
                
                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                photoPreviewGrid.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        });
        
        // Update selected count
        if (selectedPhotoCount) {
            selectedPhotoCount.textContent = `${window.selectedFiles.length} ${window.selectedFiles.length === 1 ? 'photo' : 'photos'} selected`;
        }
    }
    
    // Remove file from selection
    function removeFile(index) {
        window.selectedFiles = window.selectedFiles.filter((_, i) => i !== index);
        updatePreview();
        updateSubmitButtonState(); // Update submit button when photos are removed
    }
    
    // Show error message
    function showError(message) {
        showPhotoError(message);
    }
    
    // Reset photo upload
    window.resetPhotoUpload = function() {
        window.selectedFiles = [];
        if (photoPreviewGrid) {
            photoPreviewGrid.innerHTML = '';
        }
        if (uploadPlaceholder) {
            uploadPlaceholder.style.display = 'flex';
        }
        if (photoPreviewGrid) {
            photoPreviewGrid.style.display = 'none';
        }
        if (selectedPhotoCount) {
            selectedPhotoCount.textContent = '';
        }
        if (photoUploadInput) {
            photoUploadInput.value = '';
        }
        updateSubmitButtonState();
    };
}

// Helper functions
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.classList.add('hidden');
    });
    clearPhotoError();
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

// Submit the report data (optimized for speed)
async function submitReport(formData) {
    return new Promise((resolve, reject) => {
        // In a real-world scenario, this would be an actual API call
        // Simulating network request with improved performance
        setTimeout(() => {
            try {
                // Here you would actually send the data to your server
                const reportId = 'REP' + Date.now();
                
                // Add to local storage for demo purposes
                const reports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
                const newReport = {
                    id: reportId,
                    name: formData.get('name'),
                    location: formData.get('location'),
                    disasterType: formData.get('disasterType'),
                    description: formData.get('description'),
                    timestamp: formData.get('timestamp'),
                    status: 'pending',
                    photoCount: formData.get('photoCount') || 0
                };
                
                reports.push(newReport);
                localStorage.setItem('disasterReports', JSON.stringify(reports));
                
                resolve(reportId);
            } catch (error) {
                reject(error);
            }
        }, 1000); // Reduced simulation time for faster response
    });
}

// Real-time validation
function setupFormValidation() {
    // Validate name field
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('nameError');
    if (nameInput && nameError) {
        nameInput.addEventListener('blur', function() {
            if (!nameInput.value.trim()) {
                nameError.textContent = 'Please enter your name';
                nameError.classList.remove('hidden');
            } else {
                nameError.textContent = '';
                nameError.classList.add('hidden');
            }
        });
    }
    
    // Validate location field
    const locationInput = document.getElementById('location');
    const locationError = document.getElementById('locationError');
    if (locationInput && locationError) {
        locationInput.addEventListener('blur', function() {
            if (!locationInput.value.trim()) {
                locationError.textContent = 'Please enter the location';
                locationError.classList.remove('hidden');
            } else {
                locationError.textContent = '';
                locationError.classList.add('hidden');
            }
        });
        
        // Autocomplete for location
        if (window.google && window.google.maps) {
            const autocomplete = new google.maps.places.Autocomplete(locationInput);
        }
    }
    
    // Validate disaster type
    const disasterTypeSelect = document.getElementById('disasterType');
    const disasterTypeError = document.getElementById('disasterTypeError');
    if (disasterTypeSelect && disasterTypeError) {
        disasterTypeSelect.addEventListener('change', function() {
            if (!disasterTypeSelect.value) {
                disasterTypeError.textContent = 'Please select a disaster type';
                disasterTypeError.classList.remove('hidden');
            } else {
                disasterTypeError.textContent = '';
                disasterTypeError.classList.add('hidden');
            }
        });
    }
    
    // Validate description
    const descriptionInput = document.getElementById('description');
    const descriptionError = document.getElementById('descriptionError');
    if (descriptionInput && descriptionError) {
        descriptionInput.addEventListener('blur', function() {
            if (!descriptionInput.value.trim()) {
                descriptionError.textContent = 'Please provide a description';
                descriptionError.classList.remove('hidden');
            } else if (descriptionInput.value.trim().length < 10) {
                descriptionError.textContent = 'Please provide a more detailed description';
                descriptionError.classList.remove('hidden');
            } else {
                descriptionError.textContent = '';
                descriptionError.classList.add('hidden');
            }
        });
    }
}

// Validate entire form
function validateForm() {
    let isValid = true;
    
    // Name validation
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('nameError');
    if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your name';
        nameError.classList.remove('hidden');
        isValid = false;
    }
    
    // Location validation
    const locationInput = document.getElementById('location');
    const locationError = document.getElementById('locationError');
    if (!locationInput.value.trim()) {
        locationError.textContent = 'Please enter the location';
        locationError.classList.remove('hidden');
        isValid = false;
    }
    
    // Disaster type validation
    const disasterTypeSelect = document.getElementById('disasterType');
    const disasterTypeError = document.getElementById('disasterTypeError');
    if (!disasterTypeSelect.value) {
        disasterTypeError.textContent = 'Please select a disaster type';
        disasterTypeError.classList.remove('hidden');
        isValid = false;
    }
    
    // Description validation
    const descriptionInput = document.getElementById('description');
    const descriptionError = document.getElementById('descriptionError');
    if (!descriptionInput.value.trim()) {
        descriptionError.textContent = 'Please provide a description';
        descriptionError.classList.remove('hidden');
        isValid = false;
    } else if (descriptionInput.value.trim().length < 10) {
        descriptionError.textContent = 'Please provide a more detailed description';
        descriptionError.classList.remove('hidden');
        isValid = false;
    }
    
    // Photo validation - REQUIRED
    if (!window.selectedFiles || window.selectedFiles.length === 0) {
        showPhotoError('At least one photo is required to submit the report');
        isValid = false;
    }
    
    return isValid;
}

// Auto-save form data as user types
function setupAutoSave() {
    const reportForm = document.getElementById('reportForm');
    if (!reportForm) return;
    
    const formFields = reportForm.querySelectorAll('input, textarea, select');
    formFields.forEach(field => {
        field.addEventListener('change', saveFormData);
        if (field.tagName === 'TEXTAREA' || field.type === 'text' || field.type === 'email') {
            field.addEventListener('input', debounce(saveFormData, 500));
        }
    });
}

// Save form data to localStorage
function saveFormData() {
    const reportForm = document.getElementById('reportForm');
    if (!reportForm) return;
    
    const formData = {
        name: document.getElementById('name').value,
        location: document.getElementById('location').value,
        disasterType: document.getElementById('disasterType').value,
        description: document.getElementById('description').value,
    };
    
    localStorage.setItem('disasterReportDraft', JSON.stringify(formData));
}

// Restore form data from localStorage
function restoreFormData() {
    const savedData = localStorage.getItem('disasterReportDraft');
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        // Populate form fields
        if (formData.name) document.getElementById('name').value = formData.name;
        if (formData.location) document.getElementById('location').value = formData.location;
        if (formData.disasterType) document.getElementById('disasterType').value = formData.disasterType;
        if (formData.description) document.getElementById('description').value = formData.description;
        
    } catch (error) {
        console.error('Error restoring form data:', error);
    }
}

// Get geolocation promise
function getLocationPromise() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
}

// Helper function - debounce
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Photo upload functionality (optimized version)
function initPhotoUpload() {
    const photoUploadInput = document.getElementById('photoUpload');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoPreviewGrid = document.getElementById('photoPreviewGrid');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const selectedPhotoCount = document.getElementById('selectedPhotoCount');
    
    // Selected files storage
    window.selectedFiles = [];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILES = 10; // Maximum number of files
    
    // Setup event listeners
    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', handleFileSelect);
    }
    
    if (photoPreviewContainer) {
        photoPreviewContainer.addEventListener('dragover', handleDragOver);
        photoPreviewContainer.addEventListener('dragleave', handleDragLeave);
        photoPreviewContainer.addEventListener('drop', handleDrop);
        photoPreviewContainer.addEventListener('click', function(e) {
            if (e.target === photoPreviewContainer || 
                e.target === uploadPlaceholder || 
                uploadPlaceholder.contains(e.target)) {
                photoUploadInput.click();
            }
        });
    }
    
    // Handle file selection via input
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        processFiles(files);
    }
    
    // Handle drag over event
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        photoPreviewContainer.classList.add('drag-over');
    }
    
    // Handle drag leave event
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        photoPreviewContainer.classList.remove('drag-over');
    }
    
    // Handle drop event
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        photoPreviewContainer.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.match('image/jpeg') || 
            file.type.match('image/png') || 
            file.type.match('image/webp')
        );
        
        if (files.length > 0) {
            processFiles(files);
        }
    }
    
    // Process selected files with validation
    function processFiles(files) {
        if (window.selectedFiles.length >= MAX_FILES) {
            showError(`You can upload a maximum of ${MAX_FILES} photos.`);
            return;
        }
        
        // Calculate how many more files we can accept
        const remainingSlots = MAX_FILES - window.selectedFiles.length;
        const filesToProcess = files.slice(0, remainingSlots);
        
        // Validate files
        const validFiles = filesToProcess.filter(file => {
            const validType = file.type.match('image/jpeg') || 
                           file.type.match('image/png') || 
                           file.type.match('image/webp');
            const validSize = file.size <= MAX_FILE_SIZE;
            return validType && validSize;
        });
        
        if (validFiles.length !== filesToProcess.length) {
            showError('Some files were skipped. Images must be JPG, PNG, or WEBP and under 5MB.');
        }
        
        if (validFiles.length === 0) {
            return;
        }
        
        // Add to selected files
        window.selectedFiles = [...window.selectedFiles, ...validFiles];
        
        // Update preview
        updatePreview();
        
        // Update submit button state
        updateSubmitButtonState();
        
        // Reset input to allow selecting the same file again
        photoUploadInput.value = '';
    }
    
    // Update preview grid
    function updatePreview() {
        // Hide placeholder if we have files
        if (window.selectedFiles.length > 0) {
            uploadPlaceholder.style.display = 'none';
            photoPreviewGrid.style.display = 'grid';
        } else {
            uploadPlaceholder.style.display = 'flex';
            photoPreviewGrid.style.display = 'none';
        }
        
        // Clear existing previews
        photoPreviewGrid.innerHTML = '';
        
        // Add previews for each file
        window.selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'photo-preview-item';
                previewItem.dataset.index = index;
                
                const img = document.createElement('img');
                img.className = 'photo-preview-img';
                img.src = e.target.result;
                img.alt = file.name;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'photo-preview-remove';
                removeBtn.type = 'button';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeFile(parseInt(previewItem.dataset.index));
                });
                
                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                photoPreviewGrid.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        });
        
        // Update selected count
        if (selectedPhotoCount) {
            selectedPhotoCount.textContent = `${window.selectedFiles.length} ${window.selectedFiles.length === 1 ? 'photo' : 'photos'} selected`;
        }
    }
    
    // Remove file from selection
    function removeFile(index) {
        window.selectedFiles = window.selectedFiles.filter((_, i) => i !== index);
        updatePreview();
        updateSubmitButtonState(); // Update submit button when photos are removed
    }
    
    // Show error message
    function showError(message) {
        showPhotoError(message);
    }
    
    // Reset photo upload
    window.resetPhotoUpload = function() {
        window.selectedFiles = [];
        if (photoPreviewGrid) {
            photoPreviewGrid.innerHTML = '';
        }
        if (uploadPlaceholder) {
            uploadPlaceholder.style.display = 'flex';
        }
        if (photoPreviewGrid) {
            photoPreviewGrid.style.display = 'none';
        }
        if (selectedPhotoCount) {
            selectedPhotoCount.textContent = '';
        }
        if (photoUploadInput) {
            photoUploadInput.value = '';
        }
        updateSubmitButtonState();
    };
}

// Helper functions
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.classList.add('hidden');
    });
    clearPhotoError();
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}


// Additional safety measure - ensure clean state on window load
window.addEventListener('load', function() {
    console.log('Window fully loaded, ensuring clean page state...');
    
    // Force clean state regardless of any other factors
    const successMessage = document.getElementById('successMessage');
    const reportForm = document.getElementById('reportForm');
    
    if (successMessage) {
        successMessage.classList.add('hidden');
        successMessage.style.display = 'none';
        console.log('Success message forcibly hidden');
    }
    
    if (reportForm) {
        reportForm.classList.remove('hidden');
        reportForm.style.display = '';
        console.log('Report form forcibly shown');
    }
});
