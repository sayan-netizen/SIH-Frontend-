// Live Disasters JavaScript
let map;
let disasterMarkers = [];
let disasters = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Show loading spinner
    showMapLoading();
    
    // Add Font Awesome if not already present
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    // Initialize components with delay for smooth loading
    setTimeout(() => {
        initializeMap();
        loadDisasterData();
        hideMapLoading();
        
        // Refresh data every 30 seconds
        setInterval(loadDisasterData, 30000);
        
        console.log('Live Disasters page initialized with enhanced controls');
    }, 1000);
});

// Initialize Leaflet map of India
function initializeMap() {
    // Initialize map centered on India
    map = L.map('indiaMap', {
        center: [20.5937, 78.9629],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true
    });
    
    // Add OpenStreetMap tiles with better styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        opacity: 0.9
    }).addTo(map);
    
    // Position zoom controls
    map.zoomControl.setPosition('topright');
    
    // Add custom controls
    addCustomMapControls();
    
    // Add map event listeners
    map.on('zoomend', function() {
        updateMapInfo();
    });
    
    map.on('moveend', function() {
        updateMapInfo();
    });
    
    console.log('Map initialized successfully with enhanced controls');
}

// Add custom map controls
function addCustomMapControls() {
    // Full screen control
    const FullScreenControl = L.Control.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
            const button = L.DomUtil.create('a', 'leaflet-control-fullscreen', container);
            
            button.innerHTML = '<i class="fas fa-expand"></i>';
            button.href = '#';
            button.title = 'Toggle Fullscreen';
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', 'Toggle fullscreen view');
            
            L.DomEvent.on(button, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                toggleFullscreen();
            });
            
            return container;
        }
    });
    
    // Reset view control
    const ResetViewControl = L.Control.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
            const button = L.DomUtil.create('a', 'leaflet-control-reset', container);
            
            button.innerHTML = '<i class="fas fa-home"></i>';
            button.href = '#';
            button.title = 'Reset View to India';
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', 'Reset map view to India');
            
            L.DomEvent.on(button, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                resetMapView();
            });
            
            return container;
        }
    });
    
    // Layer control for different map views
    const LayerControl = L.Control.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
            const button = L.DomUtil.create('a', 'leaflet-control-layers-toggle', container);
            
            button.innerHTML = '<i class="fas fa-layer-group"></i>';
            button.href = '#';
            button.title = 'Toggle Satellite View';
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', 'Toggle satellite view');
            
            L.DomEvent.on(button, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                toggleSatelliteView();
            });
            
            return container;
        }
    });
    
    // Add controls to map
    new FullScreenControl({ position: 'topright' }).addTo(map);
    new ResetViewControl({ position: 'topright' }).addTo(map);
    new LayerControl({ position: 'topright' }).addTo(map);
}

// Toggle fullscreen mode
function toggleFullscreen() {
    const mapContainer = document.getElementById('indiaMap');
    const isFullscreen = mapContainer.classList.contains('fullscreen-map');
    
    if (isFullscreen) {
        mapContainer.classList.remove('fullscreen-map');
        mapContainer.style.position = 'relative';
        mapContainer.style.zIndex = 'auto';
        mapContainer.style.top = 'auto';
        mapContainer.style.left = 'auto';
        mapContainer.style.width = '100%';
        mapContainer.style.height = '520px';
    } else {
        mapContainer.classList.add('fullscreen-map');
        mapContainer.style.position = 'fixed';
        mapContainer.style.zIndex = '9999';
        mapContainer.style.top = '0';
        mapContainer.style.left = '0';
        mapContainer.style.width = '100vw';
        mapContainer.style.height = '100vh';
    }
    
    // Invalidate map size after transition
    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

// Reset map view to India
function resetMapView() {
    map.setView([20.5937, 78.9629], 5);
    
    // Add a smooth animation effect
    const button = document.querySelector('.leaflet-control-reset');
    button.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        button.style.transform = 'rotate(0deg)';
    }, 300);
}

let satelliteLayer = null;
let isUsingSatellite = false;

// Toggle satellite view
function toggleSatelliteView() {
    const button = document.querySelector('.leaflet-control-layers-toggle i');
    
    if (!isUsingSatellite) {
        // Add satellite layer
        if (!satelliteLayer) {
            satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18
            });
        }
        
        map.eachLayer(function(layer) {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });
        
        satelliteLayer.addTo(map);
        button.className = 'fas fa-map';
        button.parentElement.title = 'Switch to Street View';
        isUsingSatellite = true;
    } else {
        // Switch back to street view
        if (satelliteLayer) {
            map.removeLayer(satelliteLayer);
        }
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            opacity: 0.9
        }).addTo(map);
        
        button.className = 'fas fa-layer-group';
        button.parentElement.title = 'Toggle Satellite View';
        isUsingSatellite = false;
    }
}

// Update map information
function updateMapInfo() {
    const zoom = map.getZoom();
    const center = map.getCenter();
    console.log(`Map updated - Zoom: ${zoom}, Center: [${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}]`);
}

// Load disaster data from API
async function loadDisasterData() {
    try {
        console.log('Loading disaster data...');
        
        const response = await fetch('/api/live-disasters');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        disasters = await response.json();
        console.log('Loaded disasters:', disasters);
        
        updateDisastersList();
        updateMap();
        updateDisasterCount();
        
    } catch (error) {
        console.error('Error loading disaster data:', error);
        showErrorMessage();
    }
}

// Update the disasters list
function updateDisastersList() {
    const disastersList = document.getElementById('disastersList');
    
    if (disasters.length === 0) {
        disastersList.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-check-circle"></i>
                <p>No active disasters reported</p>
            </div>
        `;
        return;
    }
    
    disastersList.innerHTML = disasters.map(disaster => `
        <div class="disaster-item" onclick="focusOnDisaster('${disaster._id}')">
            <span class="disaster-type disaster-${disaster.disasterType}">${disaster.disasterType}</span>
            <span class="disaster-severity severity-${disaster.severity}">${disaster.severity.toUpperCase()}</span>
            
            <div class="disaster-title">${disaster.description}</div>
            
            <div class="disaster-location">
                <i class="fas fa-map-marker-alt"></i>
                ${disaster.location}
            </div>
            
            <div class="disaster-time">
                <i class="fas fa-clock"></i>
                ${formatTimeAgo(disaster.timestamp)}
            </div>
        </div>
    `).join('');
}

// Update map markers
function updateMap() {
    // Clear existing markers
    disasterMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    disasterMarkers = [];
    
    // Add markers for each disaster
    disasters.forEach(disaster => {
        if (disaster.coordinates && disaster.coordinates.length === 2) {
            const [lat, lng] = disaster.coordinates;
            
            // Create custom marker based on severity
            const markerColor = getSeverityColor(disaster.severity);
            const markerSize = getSeveritySize(disaster.severity);
            
            const customIcon = L.divIcon({
                className: 'custom-disaster-marker',
                html: `<div style="
                    background-color: ${markerColor};
                    width: ${markerSize}px;
                    height: ${markerSize}px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: ${Math.max(10, markerSize - 10)}px;
                ">
                    <i class="fas fa-exclamation"></i>
                </div>`,
                iconSize: [markerSize, markerSize],
                iconAnchor: [markerSize/2, markerSize/2],
                popupAnchor: [0, -markerSize/2]
            });
            
            const marker = L.marker([lat, lng], { icon: customIcon })
                .bindPopup(createPopupContent(disaster))
                .addTo(map);
            
            disasterMarkers.push(marker);
        }
    });
}

// Create popup content for map markers
function createPopupContent(disaster) {
    return `
        <div style="min-width: 200px;">
            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 8px;">
                <span class="disaster-type disaster-${disaster.disasterType}" style="font-size: 0.8em; padding: 2px 6px; border-radius: 10px;">
                    ${disaster.disasterType.toUpperCase()}
                </span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Location:</strong> ${disaster.location}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Severity:</strong> 
                <span class="severity-${disaster.severity}" style="padding: 2px 6px; border-radius: 8px; font-size: 0.8em;">
                    ${disaster.severity.toUpperCase()}
                </span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Time:</strong> ${formatTimeAgo(disaster.timestamp)}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Description:</strong><br>
                ${disaster.description}
            </div>
            ${disaster.reporterName ? `<div style="font-size: 0.9em; color: #7f8c8d;">Reported by: ${disaster.reporterName}</div>` : ''}
        </div>
    `;
}

// Get marker color based on severity
function getSeverityColor(severity) {
    switch(severity.toLowerCase()) {
        case 'high': return '#e74c3c';
        case 'medium': return '#f39c12';
        case 'low': return '#27ae60';
        default: return '#95a5a6';
    }
}

// Get marker size based on severity
function getSeveritySize(severity) {
    switch(severity.toLowerCase()) {
        case 'high': return 24;
        case 'medium': return 20;
        case 'low': return 16;
        default: return 18;
    }
}

// Focus map on specific disaster
function focusOnDisaster(disasterId) {
    const disaster = disasters.find(d => d._id === disasterId);
    if (disaster && disaster.coordinates) {
        const [lat, lng] = disaster.coordinates;
        map.setView([lat, lng], 10);
        
        // Find and open the corresponding marker popup
        const marker = disasterMarkers.find(m => {
            const markerLatLng = m.getLatLng();
            return Math.abs(markerLatLng.lat - lat) < 0.001 && Math.abs(markerLatLng.lng - lng) < 0.001;
        });
        
        if (marker) {
            marker.openPopup();
        }
    }
}

// Update disaster count display
function updateDisasterCount() {
    const countElement = document.getElementById('disasterCount');
    const count = disasters.length;
    countElement.innerHTML = `
        <i class="fas fa-chart-line"></i> 
        ${count} Active Disaster${count !== 1 ? 's' : ''}
    `;
}

// Format time ago string
function formatTimeAgo(timestamp) {
    try {
        const now = new Date();
        let time;
        
        // Handle different timestamp formats
        if (typeof timestamp === 'string') {
            // Try parsing ISO string or MongoDB date format
            time = new Date(timestamp);
        } else if (timestamp && timestamp['$date']) {
            // Handle MongoDB date format
            time = new Date(timestamp['$date']);
        } else if (typeof timestamp === 'number') {
            // Handle Unix timestamp
            time = new Date(timestamp);
        } else {
            // Direct Date object
            time = new Date(timestamp);
        }
        
        // Validate the parsed date
        if (isNaN(time.getTime())) {
            console.warn('Invalid timestamp:', timestamp);
            return 'Recently';
        }
        
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        // Handle negative differences (future dates)
        if (diffInSeconds < 0) {
            return 'Just now';
        }
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    } catch (error) {
        console.error('Error formatting timestamp:', error, timestamp);
        return 'Recently';
    }
}

// Show error message
function showErrorMessage() {
    const disastersList = document.getElementById('disastersList');
    disastersList.innerHTML = `
        <div class="loading-indicator" style="color: #e74c3c;">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading disaster data. Please try again.</p>
            <button onclick="loadDisasterData()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
}

// Show map loading spinner
function showMapLoading() {
    const loading = document.getElementById('mapLoading');
    if (loading) {
        loading.style.display = 'block';
    }
}

// Hide map loading spinner
function hideMapLoading() {
    const loading = document.getElementById('mapLoading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Refresh disaster data manually
function refreshDisasterData() {
    console.log('Manually refreshing disaster data...');
    loadDisasterData();
    
    // Show loading state briefly
    const button = document.querySelector('.refresh-button');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    button.disabled = true;
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}