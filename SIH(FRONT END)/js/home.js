document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    
    // DOM elements
    const userProfile = document.getElementById('userProfile');
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const alertsContainer = document.getElementById('alertsContainer');
    const alertTypeFilter = document.getElementById('alertTypeFilter');
    const refreshAlertsBtn = document.getElementById('refreshAlertsBtn');
    const disasterMap = document.getElementById('disasterMap');
    const postFeed = document.getElementById('postFeed');
    const sortTypeSelect = document.getElementById('sortType');
    const disasterTypeFilter = document.getElementById('disasterTypeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const recentDisasters = document.getElementById('recentDisasters');
    const reportsToday = document.getElementById('reportsToday');
    const verifiedReports = document.getElementById('verifiedReports');
    const activeAlerts = document.getElementById('activeAlerts');
    
    // Initialize the page
    init();
    
    // Initialize the page
    function init() {
        // Setup user interface based on authentication
        setupUserInterface();
        
        // Load active alerts
        loadActiveAlerts();
        
        // Initialize map
        initializeMap();
        
        // Load posts for feed
        loadPosts();
        
        // Load recent disasters
        loadRecentDisasters();
        
        // Load statistics
        loadStatistics();
        
        // Setup event listeners
        setupEventListeners();
        
        // Populate location filter
        populateLocationFilter();
    }
    
    // Setup user interface based on authentication
    function setupUserInterface() {
        // Show/hide elements based on login status
        if (currentUser) {
            // Update user avatar if available
            if (currentUser.profilePicture) {
                userAvatar.src = currentUser.profilePicture;
            }
            
            // Show/hide role-specific elements
            const officialElements = document.querySelectorAll('.official-only');
            const adminElements = document.querySelectorAll('.admin-only');
            
            if (currentUser.role === 'official' || currentUser.role === 'admin') {
                officialElements.forEach(el => el.classList.remove('hidden'));
            }
            
            if (currentUser.role === 'admin') {
                adminElements.forEach(el => el.classList.remove('hidden'));
            }
        } else {
            // Redirect to login if we want to enforce authentication
            // window.location.href = 'login.html?redirect=home.html';
        }
    }
    
    // Load active alerts
    function loadActiveAlerts() {
        if (!alertsContainer) return;
        
        alertsContainer.innerHTML = '<div class="loading">Loading alerts...</div>';
        
        // In a real app, you would fetch alerts from a server
        // For demo purposes, we'll use timeout to simulate API call
        setTimeout(() => {
            // Sample alerts data
            const alerts = [
                {
                    id: 'alert_1',
                    title: 'Flood Warning',
                    description: 'Heavy rainfall expected. Potential flooding in low-lying areas.',
                    location: 'Mumbai, Maharashtra',
                    disasterType: 'flood',
                    severity: 'high',
                    timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
                },
                {
                    id: 'alert_2',
                    title: 'Earthquake Alert',
                    description: 'Magnitude 4.5 earthquake detected. Aftershocks possible.',
                    location: 'Delhi NCR',
                    disasterType: 'earthquake',
                    severity: 'medium',
                    timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
                },
                {
                    id: 'alert_3',
                    title: 'Cyclone Warning',
                    description: 'Cyclone approaching coastal areas. Wind speeds up to 120 km/h expected.',
                    location: 'Chennai, Tamil Nadu',
                    disasterType: 'cyclone',
                    severity: 'critical',
                    timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
                }
            ];
            
            // Display alerts
            displayAlerts(alerts);
        }, 1000);
    }
    
    // Display alerts
    function displayAlerts(alerts) {
        if (!alertsContainer) return;
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = '<div class="no-data">No active alerts at this time.</div>';
            return;
        }
        
        // Filter alerts by type if a filter is selected
        if (alertTypeFilter && alertTypeFilter.value !== 'all') {
            alerts = alerts.filter(alert => alert.disasterType === alertTypeFilter.value);
        }
        
        // Clear previous alerts
        alertsContainer.innerHTML = '';
        
        // Create and append alert elements
        alerts.forEach(alert => {
            const alertEl = createAlertElement(alert);
            alertsContainer.appendChild(alertEl);
        });
    }
    
    // Create an alert element
    function createAlertElement(alert) {
        const alertEl = document.createElement('div');
        alertEl.className = `alert-item alert-${alert.severity}`;
        alertEl.dataset.alertId = alert.id;
        alertEl.dataset.type = alert.disasterType;
        
        // Format timestamp
        const timestamp = new Date(alert.timestamp);
        const timeAgo = getTimeAgo(timestamp);
        
        // Get icon for disaster type
        let icon = '';
        switch (alert.disasterType) {
            case 'flood':
                icon = '<i class="fas fa-water"></i>';
                break;
            case 'earthquake':
                icon = '<i class="fas fa-house-damage"></i>';
                break;
            case 'fire':
                icon = '<i class="fas fa-fire"></i>';
                break;
            case 'landslide':
                icon = '<i class="fas fa-mountain"></i>';
                break;
            case 'cyclone':
                icon = '<i class="fas fa-wind"></i>';
                break;
            default:
                icon = '<i class="fas fa-exclamation-triangle"></i>';
        }
        
        alertEl.innerHTML = `
            <div class="alert-icon">
                ${icon}
            </div>
            <div class="alert-content">
                <h4 class="alert-title">${alert.title}</h4>
                <div class="alert-details">
                    <span class="alert-location"><i class="fas fa-map-marker-alt"></i> ${alert.location}</span>
                    <span class="alert-time"><i class="fas fa-clock"></i> ${timeAgo}</span>
                </div>
            </div>
            <button class="alert-action">View</button>
        `;
        
        // Add event listener to view button
        const viewBtn = alertEl.querySelector('.alert-action');
        viewBtn.addEventListener('click', () => {
            window.location.href = `alert-details.html?id=${alert.id}`;
        });
        
        return alertEl;
    }
    
    // Initialize map
    function initializeMap() {
        if (!disasterMap) return;
        
        // In a real app, you would integrate with a mapping library like Mapbox or Leaflet
        // For demo purposes, we'll use a placeholder
        disasterMap.innerHTML = `
            <div class="map-placeholder">
                <p>Interactive disaster map would be displayed here</p>
                <p>(Mapbox or Leaflet integration)</p>
            </div>
        `;
    }
    
    // Load posts for feed
    function loadPosts() {
        if (!postFeed) return;
        
        postFeed.innerHTML = '<div class="loading">Loading posts...</div>';
        
        // Get sorting option
        const sortBy = sortTypeSelect ? sortTypeSelect.value : 'newest';
        
        // Get posts with sorting
        postService.getAllPosts({ sortBy })
            .then(posts => {
                // Filter posts if needed
                if (disasterTypeFilter && disasterTypeFilter.value !== 'all') {
                    posts = posts.filter(post => post.disasterType === disasterTypeFilter.value);
                }
                
                if (locationFilter && locationFilter.value !== 'all') {
                    posts = posts.filter(post => post.location === locationFilter.value);
                }
                
                // Display posts
                displayPosts(posts);
            })
            .catch(error => {
                console.error('Error loading posts:', error);
                postFeed.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load posts. Please try again later.</p>
                        <button id="retryLoadPosts">Retry</button>
                    </div>
                `;
                
                // Add retry button event listener
                const retryBtn = document.getElementById('retryLoadPosts');
                if (retryBtn) {
                    retryBtn.addEventListener('click', loadPosts);
                }
            });
    }
    
    // Display posts
    function displayPosts(posts) {
        if (!postFeed) return;
        
        if (posts.length === 0) {
            postFeed.innerHTML = '<div class="no-data">No posts found matching your criteria.</div>';
            return;
        }
        
        // Clear previous posts
        postFeed.innerHTML = '';
        
        // Create and append post elements
        posts.forEach(post => {
            const postEl = createPostElement(post);
            postFeed.appendChild(postEl);
        });
    }
    
    // Create a post element
    function createPostElement(post) {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.dataset.postId = post.id;
        postEl.dataset.type = post.disasterType;
        
        // Format timestamp
        const timestamp = new Date(post.timestamp);
        const timeAgo = getTimeAgo(timestamp);
        
        // Get verification status
        const verificationClass = `verification-${post.verificationStatus.status}`;
        let verificationText = '';
        
        switch (post.verificationStatus.status) {
            case 'verified':
                verificationText = `<i class="fas fa-check-circle"></i> Verified (${post.verificationStatus.percentage}%)`;
                break;
            case 'disputed':
                verificationText = `<i class="fas fa-question-circle"></i> Disputed (${post.verificationStatus.percentage}%)`;
                break;
            case 'false':
                verificationText = `<i class="fas fa-times-circle"></i> False Report (${post.verificationStatus.percentage}%)`;
                break;
            default:
                verificationText = `<i class="fas fa-clock"></i> Awaiting Verification`;
        }
        
        // Create post HTML
        postEl.innerHTML = `
            <div class="post-header">
                <div class="post-user">
                    <img src="${post.user.profilePicture || 'images/default-avatar.png'}" alt="${post.user.fullName}" class="user-avatar">
                    <div class="user-info">
                        <div class="user-name">${post.user.fullName}</div>
                        <div class="user-role">${capitalizeFirstLetter(post.user.role)}</div>
                    </div>
                </div>
                <div class="post-meta">
                    <div class="post-time">${timeAgo}</div>
                    <div class="post-type disaster-${post.disasterType}">${capitalizeFirstLetter(post.disasterType)}</div>
                </div>
            </div>
            
            <div class="post-content">
                <p>${post.content}</p>
                ${post.media ? `<div class="post-media">
                    ${post.media.type === 'image' 
                        ? `<img src="${post.media.url}" alt="Disaster image">` 
                        : `<video src="${post.media.url}" controls></video>`}
                </div>` : ''}
                
                <div class="post-location">
                    <i class="fas fa-map-marker-alt"></i> ${post.location}
                </div>
            </div>
            
            <div class="post-footer">
                <div class="verification-status ${verificationClass}">
                    ${verificationText}
                </div>
                
                <div class="post-actions">
                    <button class="verify-btn" data-action="verify" ${post.userHasVerified ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Verify
                    </button>
                    <button class="comment-btn" data-action="comment">
                        <i class="fas fa-comment"></i> Comment (${post.commentCount})
                    </button>
                    <button class="share-btn" data-action="share">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners for post actions
        const verifyBtn = postEl.querySelector('.verify-btn');
        const commentBtn = postEl.querySelector('.comment-btn');
        const shareBtn = postEl.querySelector('.share-btn');
        
        if (verifyBtn) {
            verifyBtn.addEventListener('click', () => {
                if (!currentUser) {
                    window.location.href = 'login.html?redirect=home.html';
                    return;
                }
                
                // Show verification dialog
                showVerificationDialog(post.id);
            });
        }
        
        if (commentBtn) {
            commentBtn.addEventListener('click', () => {
                // Navigate to post details page
                window.location.href = `post-details.html?id=${post.id}#comments`;
            });
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                // Show sharing options
                sharePost(post);
            });
        }
        
        return postEl;
    }
    
    // Show verification dialog
    function showVerificationDialog(postId) {
        // Create a simple modal for verification
        const modal = document.createElement('div');
        modal.className = 'modal verification-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Verify this report</h2>
                <p>Is this disaster report accurate based on your knowledge?</p>
                <div class="verification-buttons">
                    <button class="verify-true-btn">Yes, it's accurate</button>
                    <button class="verify-false-btn">No, it's not accurate</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        modal.style.display = 'block';
        
        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const verifyTrueBtn = modal.querySelector('.verify-true-btn');
        const verifyFalseBtn = modal.querySelector('.verify-false-btn');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        verifyTrueBtn.addEventListener('click', () => {
            submitVerification(postId, true, modal);
        });
        
        verifyFalseBtn.addEventListener('click', () => {
            submitVerification(postId, false, modal);
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Submit post verification
    function submitVerification(postId, isTrue, modal) {
        postService.verifyPost(postId, isTrue)
            .then(status => {
                // Close modal
                if (modal) modal.remove();
                
                // Show success message
                const message = isTrue ? 'You have verified this report as accurate' : 'You have marked this report as inaccurate';
                showNotification(message, 'success');
                
                // Refresh posts to update status
                loadPosts();
            })
            .catch(error => {
                console.error('Verification error:', error);
                
                // Show error message
                showNotification('Failed to submit verification: ' + error.message, 'error');
            });
    }
    
    // Share post function
    function sharePost(post) {
        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: `Disaster Alert: ${capitalizeFirstLetter(post.disasterType)} in ${post.location}`,
                text: post.content,
                url: window.location.origin + `/post-details.html?id=${post.id}`
            })
            .then(() => console.log('Shared successfully'))
            .catch(err => console.log('Share failed:', err));
        } else {
            // Create a simple modal for sharing options
            const modal = document.createElement('div');
            modal.className = 'modal share-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Share this report</h2>
                    <div class="share-options">
                        <button class="share-option" data-platform="facebook">
                            <i class="fab fa-facebook"></i> Facebook
                        </button>
                        <button class="share-option" data-platform="twitter">
                            <i class="fab fa-twitter"></i> Twitter
                        </button>
                        <button class="share-option" data-platform="whatsapp">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        <button class="share-option" data-platform="copy">
                            <i class="fas fa-copy"></i> Copy Link
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Show modal
            modal.style.display = 'block';
            
            // Add event listeners
            const closeBtn = modal.querySelector('.close-modal');
            const shareOptions = modal.querySelectorAll('.share-option');
            
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
            
            shareOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const platform = option.dataset.platform;
                    const postUrl = window.location.origin + `/post-details.html?id=${post.id}`;
                    const postTitle = `Disaster Alert: ${capitalizeFirstLetter(post.disasterType)} in ${post.location}`;
                    const postText = post.content;
                    
                    switch (platform) {
                        case 'facebook':
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`);
                            break;
                        case 'twitter':
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`);
                            break;
                        case 'whatsapp':
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(postTitle + '\n' + postUrl)}`);
                            break;
                        case 'copy':
                            // Copy link to clipboard
                            navigator.clipboard.writeText(postUrl)
                                .then(() => showNotification('Link copied to clipboard', 'success'))
                                .catch(err => console.error('Could not copy text: ', err));
                            break;
                    }
                    
                    modal.remove();
                });
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.remove();
                }
            });
        }
    }
    
    // Load recent disasters for sidebar
    function loadRecentDisasters() {
        if (!recentDisasters) return;
        
        recentDisasters.innerHTML = '<div class="loading">Loading...</div>';
        
        postService.getRecentPosts()
            .then(posts => {
                if (posts.length === 0) {
                    recentDisasters.innerHTML = '<div class="no-data">No recent disasters reported.</div>';
                    return;
                }
                
                // Display only the most recent 5 posts
                const recentPosts = posts.slice(0, 5);
                
                // Clear previous content
                recentDisasters.innerHTML = '';
                
                // Create and append disaster items
                recentPosts.forEach(post => {
                    const disasterItem = document.createElement('div');
                    disasterItem.className = 'disaster-item';
                    
                    // Format timestamp
                    const timeAgo = getTimeAgo(new Date(post.timestamp));
                    
                    disasterItem.innerHTML = `
                        <div class="disaster-type disaster-${post.disasterType}">${capitalizeFirstLetter(post.disasterType)}</div>
                        <div class="disaster-info">
                            <div class="disaster-location">${post.location}</div>
                            <div class="disaster-time">${timeAgo}</div>
                        </div>
                    `;
                    
                    disasterItem.addEventListener('click', () => {
                        window.location.href = `post-details.html?id=${post.id}`;
                    });
                    
                    recentDisasters.appendChild(disasterItem);
                });
            })
            .catch(error => {
                console.error('Error loading recent disasters:', error);
                recentDisasters.innerHTML = '<div class="error-message">Failed to load recent disasters.</div>';
            });
    }
    
    // Load statistics
    function loadStatistics() {
        postService.getStatistics()
            .then(stats => {
                // Update statistics display
                if (reportsToday) reportsToday.textContent = stats.postsToday;
                if (verifiedReports) verifiedReports.textContent = stats.verified;
                if (activeAlerts) activeAlerts.textContent = '3'; // Hardcoded for demo
            })
            .catch(error => {
                console.error('Error loading statistics:', error);
            });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // User profile click
        if (userProfile) {
            userProfile.addEventListener('click', function() {
                if (userMenu) {
                    userMenu.classList.toggle('show');
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (userMenu && userProfile && userMenu.classList.contains('show') &&
                !userProfile.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.classList.remove('show');
            }
        });
        
        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(event) {
                event.preventDefault();
                
                authService.logout()
                    .then(() => {
                        window.location.href = 'login.html';
                    })
                    .catch(error => {
                        console.error('Logout error:', error);
                        window.location.href = 'login.html';
                    });
            });
        }
        
        // Alert filter change
        if (alertTypeFilter) {
            alertTypeFilter.addEventListener('change', function() {
                loadActiveAlerts();
            });
        }
        
        // Refresh alerts button
        if (refreshAlertsBtn) {
            refreshAlertsBtn.addEventListener('click', function() {
                loadActiveAlerts();
            });
        }
        
        // Sort type change
        if (sortTypeSelect) {
            sortTypeSelect.addEventListener('change', function() {
                loadPosts();
            });
        }
        
        // Disaster type filter change
        if (disasterTypeFilter) {
            disasterTypeFilter.addEventListener('change', function() {
                loadPosts();
            });
        }
        
        // Location filter change
        if (locationFilter) {
            locationFilter.addEventListener('change', function() {
                loadPosts();
            });
        }
    }
    
    // Populate location filter with unique locations from posts
    function populateLocationFilter() {
        if (!locationFilter) return;
        
        postService.getLocations()
            .then(locations => {
                // Clear existing options except the "All Locations" option
                locationFilter.innerHTML = '<option value="all">All Locations</option>';
                
                // Add location options
                locations.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location;
                    option.textContent = location;
                    locationFilter.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading locations:', error);
            });
    }
    
    // Helper function to format time ago
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval === 1 ? '1 year ago' : interval + ' years ago';
        }
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval === 1 ? '1 month ago' : interval + ' months ago';
        }
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval === 1 ? '1 day ago' : interval + ' days ago';
        }
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval === 1 ? '1 hour ago' : interval + ' hours ago';
        }
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval === 1 ? '1 minute ago' : interval + ' minutes ago';
        }
        
        return 'just now';
    }
    
    // Helper function to capitalize first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-hide after 5 seconds
        const hideTimeout = setTimeout(() => {
            hideNotification(notification);
        }, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(hideTimeout);
            hideNotification(notification);
        });
    }
    
    // Hide notification
    function hideNotification(notification) {
        notification.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
});