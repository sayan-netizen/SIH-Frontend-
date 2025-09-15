/**
 * Authentication Service for Disaster Alert System
 * Handles user registration, login, logout and session management with MongoDB backend
 */
const authService = (function() {
    // Constants
    const CURRENT_USER_KEY = 'disaster_current_user';
    const API_BASE = '/api/auth';
    
    // User roles
    const ROLES = {
        CITIZEN: 'citizen',
        OFFICIAL: 'official',
        ADMIN: 'admin'
    };
    
    // Save current user session
    function saveCurrentUser(user) {
        // Remove password before storing in session
        const sessionUser = {...user};
        delete sessionUser.password;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    }
    
    // Make API request helper
    function makeApiRequest(url, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        return fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || `HTTP ${response.status}`);
                    });
                }
                return response.json();
            });
    }
    
    return {
        // Constants accessible from outside
        ROLES: ROLES,
        
        /**
         * Register a new user
         * @param {Object} userData - User registration data
         * @returns {Promise} - Resolves with the registered user
         */
        register: function(userData) {
            return new Promise((resolve, reject) => {
                try {
                    console.log("Starting registration process for", userData.email);
                    
                    // Validate required fields
                    if (!userData.fullName || !userData.email || !userData.password) {
                        reject(new Error('Name, email and password are required'));
                        return;
                    }
                    
                    // Check email format
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(userData.email)) {
                        reject(new Error('Invalid email format'));
                        return;
                    }
                    
                    // Prepare registration data for API
                    const registrationData = {
                        fullName: userData.fullName,
                        email: userData.email,
                        password: userData.password,
                        phone: userData.phone || '',
                        userType: userData.role || ROLES.CITIZEN
                    };
                    
                    // Validate role-specific requirements
                    if (userData.role === ROLES.OFFICIAL && (!userData.officialId || !userData.department)) {
                        reject(new Error('Official ID and department are required for official registration'));
                        return;
                    }
                    
                    if (userData.role === ROLES.ADMIN && (!userData.adminCode || userData.adminCode !== 'ADMIN123')) {
                        reject(new Error('Valid admin access code is required for admin registration'));
                        return;
                    }
                    
                    // Add role-specific fields
                    if (userData.role === ROLES.OFFICIAL) {
                        registrationData.officialId = userData.officialId;
                        registrationData.department = userData.department;
                        registrationData.designation = userData.designation || '';
                    }
                    
                    // Make API call to register user
                    makeApiRequest(`${API_BASE}/register`, 'POST', registrationData)
                        .then(response => {
                            if (response.success) {
                                console.log("User registered successfully:", response.user.email);
                                resolve(response.user);
                            } else {
                                reject(new Error(response.error || 'Registration failed'));
                            }
                        })
                        .catch(error => {
                            console.error("Registration API error:", error);
                            reject(new Error(error.message || 'Registration failed'));
                        });
                        
                } catch (error) {
                    console.error("Registration error:", error);
                    reject(new Error('Registration failed: ' + error.message));
                }
            });
        },
        
        /**
         * Log in a user
         * @param {string} email - User email
         * @param {string} password - User password
         * @param {string} userType - User type (optional)
         * @returns {Promise} - Resolves with the logged in user
         */
        login: function(email, password, userType = null) {
            return new Promise((resolve, reject) => {
                try {
                    console.log("Starting login process for", email);
                    
                    if (!email || !password) {
                        reject(new Error('Email and password are required'));
                        return;
                    }
                    
                    // Prepare login data
                    const loginData = {
                        email: email,
                        password: password
                    };
                    
                    if (userType) {
                        loginData.userType = userType;
                    }
                    
                    // Make API call to login
                    makeApiRequest(`${API_BASE}/login`, 'POST', loginData)
                        .then(response => {
                            if (response.success) {
                                console.log("Login successful:", response.user.email);
                                
                                // Save current user session
                                saveCurrentUser(response.user);
                                
                                resolve(response.user);
                            } else {
                                reject(new Error(response.error || 'Login failed'));
                            }
                        })
                        .catch(error => {
                            console.error("Login API error:", error);
                            reject(new Error(error.message || 'Login failed'));
                        });
                        
                } catch (error) {
                    console.error("Login error:", error);
                    reject(new Error('Login failed: ' + error.message));
                }
            });
        },
        
        /**
         * Log out current user
         * @returns {Promise} - Resolves when logout is complete
         */
        logout: function() {
            return new Promise((resolve) => {
                localStorage.removeItem(CURRENT_USER_KEY);
                console.log("User logged out");
                resolve();
            });
        },
        
        /**
         * Get current logged in user
         * @returns {Object|null} - Current user or null if not logged in
         */
        getCurrentUser: function() {
            const user = localStorage.getItem(CURRENT_USER_KEY);
            return user ? JSON.parse(user) : null;
        },
        
        /**
         * Check if user is logged in
         * @returns {boolean} - True if user is logged in
         */
        isLoggedIn: function() {
            return !!this.getCurrentUser();
        },
        
        /**
         * Check if current user has a specific role
         * @param {string} role - Role to check
         * @returns {boolean} - True if user has role
         */
        hasRole: function(role) {
            const user = this.getCurrentUser();
            return user && user.type === role;
        },
        
        /**
         * Check if current user is admin
         * @returns {boolean} - True if user is admin
         */
        isAdmin: function() {
            return this.hasRole(ROLES.ADMIN);
        },
        
        /**
         * Check if current user is official
         * @returns {boolean} - True if user is official
         */
        isOfficial: function() {
            return this.hasRole(ROLES.OFFICIAL);
        },
        
        /**
         * Check if current user is citizen
         * @returns {boolean} - True if user is citizen
         */
        isCitizen: function() {
            return this.hasRole(ROLES.CITIZEN);
        }
    };
})();