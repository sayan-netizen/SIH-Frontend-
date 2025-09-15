// GPS Location functionality
function initGPSLocation() {
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    const locationInput = document.getElementById('location');
    
    if (!getCurrentLocationBtn || !locationInput) {
        console.log('GPS location elements not found');
        return;
    }
    
    console.log('GPS location functionality initialized');
    
    getCurrentLocationBtn.addEventListener('click', function() {
        getAndSetCurrentLocation();
    });
}

function getAndSetCurrentLocation() {
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    const locationInput = document.getElementById('location');
    const locationError = document.getElementById('locationError');
    
    if (!navigator.geolocation) {
        showLocationError('Geolocation is not supported by this browser');
        return;
    }
    
    // Show loading state
    getCurrentLocationBtn.disabled = true;
    getCurrentLocationBtn.classList.add('loading');
    getCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    locationInput.placeholder = 'Getting location...';
    
    // Clear any existing errors
    if (locationError) {
        locationError.classList.add('hidden');
    }
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
    };
    
    navigator.geolocation.getCurrentPosition(
        async function(position) {
            console.log('GPS position obtained:', position);
            
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            try {
                // Use reverse geocoding to get address
                const address = await reverseGeocode(latitude, longitude);
                locationInput.value = address;
                locationInput.placeholder = 'Enter location or click GPS button';
                
                // Clear any validation errors
                if (locationError) {
                    locationError.classList.add('hidden');
                }
                
                console.log('Location set to:', address);
            } catch (error) {
                console.error('Error getting address:', error);
                // Fallback: show coordinates
                locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                showLocationError('Address lookup failed, showing coordinates');
            } finally {
                resetLocationButton();
            }
        },
        function(error) {
            console.error('Geolocation error:', error);
            
            let errorMessage = 'Unable to get location';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied by user';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
            }
            
            showLocationError(errorMessage);
            resetLocationButton();
        },
        options
    );
}

async function reverseGeocode(latitude, longitude) {
    // Try OpenStreetMap Nominatim (free, no API key required)
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'DisasterReportApp/1.0'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
                // Format the address nicely
                const address = data.address;
                let formattedAddress = '';
                
                if (address.road || address.house_number) {
                    if (address.house_number) formattedAddress += address.house_number + ' ';
                    if (address.road) formattedAddress += address.road + ', ';
                }
                
                if (address.neighbourhood) formattedAddress += address.neighbourhood + ', ';
                if (address.suburb) formattedAddress += address.suburb + ', ';
                if (address.city || address.town || address.village) {
                    formattedAddress += (address.city || address.town || address.village) + ', ';
                }
                if (address.state) formattedAddress += address.state + ', ';
                if (address.country) formattedAddress += address.country;
                
                // Clean up trailing commas
                formattedAddress = formattedAddress.replace(/,\s*$/, '');
                
                return formattedAddress || data.display_name;
            }
        }
    } catch (error) {
        console.log('Nominatim geocoding failed:', error);
    }
    
    // Fallback: return coordinates
    throw new Error('Geocoding service unavailable');
}

function showLocationError(message) {
    const locationError = document.getElementById('locationError');
    if (locationError) {
        locationError.textContent = message;
        locationError.classList.remove('hidden');
    }
}

function resetLocationButton() {
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    const locationInput = document.getElementById('location');
    
    if (getCurrentLocationBtn) {
        getCurrentLocationBtn.disabled = false;
        getCurrentLocationBtn.classList.remove('loading');
        getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
    }
    
    if (locationInput && locationInput.placeholder === 'Getting location...') {
        locationInput.placeholder = 'Enter location or click GPS button';
    }
}