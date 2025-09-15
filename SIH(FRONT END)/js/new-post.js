document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html?redirect=new-post.html';
        return;
    }
    
    // DOM elements
    const disasterReportForm = document.getElementById('disasterReportForm');
    const disasterTypeSelect = document.getElementById('disasterType');
    const otherDisasterGroup = document.getElementById('otherDisasterGroup');
    const otherDisasterInput = document.getElementById('otherDisaster');
    const disasterPhotosInput = document.getElementById('disasterPhotos');
    const mediaPreview = document.getElementById('mediaPreview');
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
    const coordinatesValue = document.getElementById('coordinatesValue');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const cancelReportBtn = document.getElementById('cancelReport');
    const userAvatar = document.getElementById('userAvatar');
    const profileMenuBtn = document.getElementById('profileMenuBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Set user avatar if available
    if (currentUser.avatar) {
        userAvatar.src = currentUser.avatar;
    }
    
    // Initialize map
    let map;
    let marker;
    
    initializeMap();
    
    // Initialize button styling
    updateButtonStyling();
    
    // Event listeners
    disasterTypeSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            otherDisasterGroup.classList.remove('hidden');
            otherDisasterInput.setAttribute('required', true);
        } else {
            otherDisasterGroup.classList.add('hidden');
            otherDisasterInput.removeAttribute('required');
        }
    });
    
    disasterPhotosInput.addEventListener('change', handleFileSelection);
    
    useCurrentLocationBtn.addEventListener('click', getUserLocation);
    
    cancelReportBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel this report? All entered information will be lost.')) {
            window.location.href = 'home.html';
        }
    });
    
    profileMenuBtn.addEventListener('click', function() {
        profileDropdown.classList.toggle('hidden');
    });
    
    logoutBtn.addEventListener('click', function(event) {
        event.preventDefault();
        authService.logout()
            .then(() => {
                window.location.href = 'login.html';
            });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.user-menu') && !profileDropdown.classList.contains('hidden')) {
            profileDropdown.classList.add('hidden');
        }
    });
    
    // Form submission
    disasterReportForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate form
        if (validateForm()) {
            // Prepare data for submission
            const formData = new FormData(this);
            const disasterData = {
                title: formData.get('disasterTitle'),
                disasterType: formData.get('disasterType') === 'other' ? formData.get('otherDisaster') : formData.get('disasterType'),
                description: formData.get('disasterDescription'),
                location: formData.get('disasterLocation'),
                coordinates: {
                    latitude: formData.get('latitude'),
                    longitude: formData.get('longitude')
                },
                severityLevel: formData.get('severityLevel'),
                peopleAffected: formData.get('peopleAffected') || 'Unknown',
                needsAssistance: formData.get('needsAssistance') === 'on',
                additionalInfo: formData.get('additionalInfo'),
                media: getMediaFiles()
            };
            
            // Submit report
            postService.createPost(disasterData)
                .then(post => {
                    alert('Disaster report submitted successfully!');
                    window.location.href = `post.html?id=${post.id}`;
                })
                .catch(error => {
                    console.error('Error submitting report:', error);
                    alert('Failed to submit report. Please try again.');
                });
        }
    });
    
    // Initialize map
    function initializeMap() {
        // In a real implementation:
        // mapboxgl.accessToken = 'your_mapbox_access_token';
        // map = new mapboxgl.Map({
        //     container: 'locationMap',
        //     style: 'mapbox://styles/mapbox/streets-v11',
        //     center: [78.9629, 20.5937], // Center of India
        //     zoom: 4
        // });
        // 
        // map.on('click', function(e) {
        //     setMarker(e.lngLat.lat, e.lngLat.lng);
        // });
        
        // Placeholder for demo
        const mapContainer = document.getElementById('locationMap');
        mapContainer.innerHTML = `
            <div style="width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;">
                <p>Map would be displayed here for selecting disaster location</p>
            </div>
        `;
    }
    
    // Set marker on map
    function setMarker(lat, lng) {
        // Update form values
        latitudeInput.value = lat;
        longitudeInput.value = lng;
        coordinatesValue.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        // In a real implementation with MapBox:
        // // Remove existing marker if any
        // if (marker) {
        //     marker.remove();
        // }
        // 
        // // Add new marker
        // marker = new mapboxgl.Marker()
        //     .setLngLat([lng, lat])
        //     .addTo(map);
    }
    
    // Get user's current location
    function getUserLocation() {
        if (navigator.geolocation) {
            useCurrentLocationBtn.textContent = 'Getting location...';
            useCurrentLocationBtn.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Set marker and update map
                    setMarker(lat, lng);
                    
                    // In a real implementation:
                    // map.flyTo({
                    //     center: [lng, lat],
                    //     zoom: 14
                    // });
                    
                    useCurrentLocationBtn.textContent = 'Use My Current Location';
                    useCurrentLocationBtn.disabled = false;
                },
                function(error) {
                    console.error('Error getting location:', error);
                    alert('Failed to get your location. Please select manually on the map.');
                    useCurrentLocationBtn.textContent = 'Use My Current Location';
                    useCurrentLocationBtn.disabled = false;
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }
    
    // Handle file selection for media upload
    function handleFileSelection() {
        mediaPreview.innerHTML = '';
        
        const files = disasterPhotosInput.files;
        
        // Check file count
        if (files.length > 5) {
            showError('disasterPhotosError', 'Maximum 5 files allowed');
            disasterPhotosInput.value = '';
            updateButtonStyling(); // Update button styling after clearing files
            return;
        }
        
        // Check file size and create previews
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                showError('disasterPhotosError', 'Files must be less than 10MB');
                disasterPhotosInput.value = '';
                mediaPreview.innerHTML = '';
                updateButtonStyling(); // Update button styling after clearing files
                return;
            }
            
            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                if (file.type.startsWith('image/')) {
                    previewItem.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                } else if (file.type.startsWith('video/')) {
                    previewItem.innerHTML = `<video src="${e.target.result}" controls></video>`;
                }
                
                mediaPreview.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        }
        
        // Update button styling after processing files
        updateButtonStyling();
    }
    
    // Update submit button styling based on photo upload status
    function updateButtonStyling() {
        const submitButton = document.querySelector('button[type="submit"]');
        if (!submitButton) return;
        
        const hasPhotos = disasterPhotosInput.files.length > 0;
        
        if (hasPhotos) {
            submitButton.classList.remove('no-photos');
            submitButton.classList.add('has-photos');
            submitButton.innerHTML = '📷 Submit Report with Photos';
        } else {
            submitButton.classList.remove('has-photos');
            submitButton.classList.add('no-photos');
            submitButton.innerHTML = '⚠️ Submit Report (Add Photos?)';
        }
    }
    
    // Get media files from input
    function getMediaFiles() {
        const files = disasterPhotosInput.files;
        const mediaFiles = [];
        
        // In a real implementation, you would upload these files to a server
        // and get back URLs. For this demo, we'll create object URLs.
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileType = file.type.startsWith('image/') ? 'image' : 'video';
            
            mediaFiles.push({
                type: fileType,
                url: URL.createObjectURL(file),
                name: file.name
            });
        }
        
        return mediaFiles;
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Validate disaster type
        if (!disasterTypeSelect.value) {
            showError('disasterTypeError', 'Please select a disaster type');
            isValid = false;
        }
        
        // Validate other disaster type if selected
        if (disasterTypeSelect.value === 'other' && !otherDisasterInput.value.trim()) {
            showError('otherDisasterError', 'Please specify the disaster type');
            isValid = false;
        }
        
        // Validate title
        const disasterTitle = document.getElementById('disasterTitle').value.trim();
        if (!disasterTitle) {
            showError('disasterTitleError', 'Please enter a title for the disaster');
            isValid = false;
        }
        
        // Validate description
        const disasterDescription = document.getElementById('disasterDescription').value.trim();
        if (!disasterDescription) {
            showError('disasterDescriptionError', 'Please provide a description of the disaster');
            isValid = false;
        }
        
        // Validate location
        const disasterLocation = document.getElementById('disasterLocation').value.trim();
        if (!disasterLocation) {
            showError('disasterLocationError', 'Please enter the location');
            isValid = false;
        }
        
        // Validate coordinates
        if (!latitudeInput.value || !longitudeInput.value) {
            showError('coordinatesError', 'Please select a location on the map');
            isValid = false;
        }
        
        // Validate severity level
        const severityLevel = document.getElementById('severityLevel').value;
        if (!severityLevel) {
            showError('severityLevelError', 'Please select a severity level');
            isValid = false;
        }
        
        // Validate confirmation checkbox
        const confirmInfo = document.getElementById('confirmInfo');
        if (!confirmInfo.checked) {
            showError('confirmInfoError', 'You must confirm that the information is accurate');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show error message
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    // Clear all errors
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }
});