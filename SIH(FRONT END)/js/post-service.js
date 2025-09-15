/**
 * Post Service for Disaster Alert System
 * Handles disaster posts, comments, and verifications
 */
const postService = (function() {
    // Local storage keys
    const POSTS_KEY = 'disasterPosts';
    const COMMENTS_KEY = 'disasterComments';
    const VERIFICATIONS_KEY = 'disasterVerifications';
    
    // Get posts from localStorage
    function getPosts() {
        const posts = localStorage.getItem(POSTS_KEY);
        return posts ? JSON.parse(posts) : [];
    }
    
    // Save posts to localStorage
    function savePosts(posts) {
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
    
    // Get comments from localStorage
    function getComments() {
        const comments = localStorage.getItem(COMMENTS_KEY);
        return comments ? JSON.parse(comments) : [];
    }
    
    // Save comments to localStorage
    function saveComments(comments) {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    }
    
    // Get verifications from localStorage
    function getVerifications() {
        const verifications = localStorage.getItem(VERIFICATIONS_KEY);
        return verifications ? JSON.parse(verifications) : [];
    }
    
    // Save verifications to localStorage
    function saveVerifications(verifications) {
        localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(verifications));
    }
    
    // Generate unique ID
    function generateId(prefix = '') {
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Calculate verification status for a post
    function calculateVerificationStatus(postId) {
        const verifications = getVerifications();
        const postVerifications = verifications.filter(v => v.postId === postId);
        
        if (postVerifications.length === 0) {
            return {
                status: 'unverified',
                trueCount: 0,
                falseCount: 0,
                totalCount: 0,
                percentage: 0
            };
        }
        
        const trueCount = postVerifications.filter(v => v.isTrue).length;
        const totalCount = postVerifications.length;
        const percentage = Math.round((trueCount / totalCount) * 100);
        
        let status = 'unverified';
        if (totalCount >= 3) {
            if (percentage >= 70) status = 'verified';
            else if (percentage <= 30) status = 'false';
            else status = 'disputed';
        }
        
        return {
            status,
            trueCount,
            falseCount: totalCount - trueCount,
            totalCount,
            percentage
        };
    }
    
    // Check if current user has verified a post
    function hasUserVerified(postId) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return false;
        
        const verifications = getVerifications();
        return verifications.some(v => 
            v.postId === postId && v.userId === currentUser.id
        );
    }
    
    // Get unique locations from all posts
    function getUniqueLocations() {
        const posts = getPosts();
        const locations = posts.map(post => post.location);
        return [...new Set(locations)].sort();
    }
    
    return {
        /**
         * Create a new disaster post
         * @param {Object} postData - Post data including disasterType, content, location, etc.
         * @returns {Promise} - Resolves with the created post
         */
        createPost: function(postData) {
            return new Promise((resolve, reject) => {
                try {
                    // Verify user is authenticated
                    const currentUser = authService.getCurrentUser();
                    if (!currentUser) {
                        reject(new Error('You must be logged in to create a post'));
                        return;
                    }
                    
                    // Validate required fields
                    if (!postData.disasterType || !postData.content || !postData.location) {
                        reject(new Error('Disaster type, content and location are required'));
                        return;
                    }
                    
                    // Create post object
                    const newPost = {
                        id: generateId('post'),
                        disasterType: postData.disasterType,
                        content: postData.content,
                        location: postData.location,
                        coordinates: postData.coordinates || null,
                        media: postData.media || null,
                        severity: postData.severity || 'medium',
                        timestamp: new Date().toISOString(),
                        user: {
                            id: currentUser.id,
                            fullName: currentUser.fullName,
                            profilePicture: currentUser.profilePicture || null,
                            role: currentUser.role
                        }
                    };
                    
                    // Get current posts and add the new one
                    const posts = getPosts();
                    posts.push(newPost);
                    
                    // Save to storage
                    savePosts(posts);
                    
                    // Return the new post
                    resolve(newPost);
                } catch (error) {
                    reject(new Error('Failed to create post: ' + error.message));
                }
            });
        },
        
        /**
         * Get all posts with optional sorting
         * @param {Object} options - Sorting options
         * @returns {Promise} - Resolves with array of posts
         */
        getAllPosts: function(options = {}) {
            return new Promise((resolve) => {
                let posts = getPosts();
                
                // Apply sorting
                if (options.sortBy) {
                    switch (options.sortBy) {
                        case 'newest':
                            posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                            break;
                        case 'oldest':
                            posts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                            break;
                        case 'verified':
                            // Sort by verification status (verified posts first)
                            posts.sort((a, b) => {
                                const aStatus = calculateVerificationStatus(a.id);
                                const bStatus = calculateVerificationStatus(b.id);
                                
                                if (aStatus.status === 'verified' && bStatus.status !== 'verified') return -1;
                                if (aStatus.status !== 'verified' && bStatus.status === 'verified') return 1;
                                
                                // If both are verified or both are not, sort by timestamp
                                return new Date(b.timestamp) - new Date(a.timestamp);
                            });
                            break;
                        case 'severity':
                            // Map severity to numeric value for sorting
                            const severityMap = {
                                'critical': 4,
                                'high': 3,
                                'medium': 2,
                                'low': 1
                            };
                            
                            posts.sort((a, b) => {
                                const aValue = severityMap[a.severity] || 0;
                                const bValue = severityMap[b.severity] || 0;
                                return bValue - aValue;
                            });
                            break;
                    }
                }
                
                // Add verification status to each post
                posts = posts.map(post => {
                    return {
                        ...post,
                        verificationStatus: calculateVerificationStatus(post.id),
                        commentCount: this.getCommentCount(post.id),
                        userHasVerified: hasUserVerified(post.id)
                    };
                });
                
                resolve(posts);
            });
        },
        
        /**
         * Get a post by ID
         * @param {string} postId - The post ID
         * @returns {Promise} - Resolves with the post or null if not found
         */
        getPostById: function(postId) {
            return new Promise((resolve) => {
                const posts = getPosts();
                const post = posts.find(p => p.id === postId);
                
                if (post) {
                    // Add verification status and comment count
                    post.verificationStatus = calculateVerificationStatus(post.id);
                    post.commentCount = this.getCommentCount(post.id);
                    post.userHasVerified = hasUserVerified(post.id);
                }
                
                resolve(post || null);
            });
        },
        
        /**
         * Get posts by a specific user
         * @param {string} userId - The user ID
         * @returns {Promise} - Resolves with array of user's posts
         */
        getPostsByUser: function(userId) {
            return new Promise((resolve) => {
                let posts = getPosts().filter(post => post.user.id === userId);
                
                // Sort by newest first
                posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                // Add verification status to each post
                posts = posts.map(post => {
                    return {
                        ...post,
                        verificationStatus: calculateVerificationStatus(post.id),
                        commentCount: this.getCommentCount(post.id),
                        userHasVerified: hasUserVerified(post.id)
                    };
                });
                
                resolve(posts);
            });
        },
        
        /**
         * Get posts by disaster type
         * @param {string} disasterType - The disaster type
         * @returns {Promise} - Resolves with array of matching posts
         */
        getPostsByType: function(disasterType) {
            return new Promise((resolve) => {
                let posts = getPosts().filter(post => post.disasterType === disasterType);
                
                // Sort by newest first
                posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                // Add verification status to each post
                posts = posts.map(post => {
                    return {
                        ...post,
                        verificationStatus: calculateVerificationStatus(post.id),
                        commentCount: this.getCommentCount(post.id),
                        userHasVerified: hasUserVerified(post.id)
                    };
                });
                
                resolve(posts);
            });
        },
        
        /**
         * Get posts by location
         * @param {string} location - The location
         * @returns {Promise} - Resolves with array of matching posts
         */
        getPostsByLocation: function(location) {
            return new Promise((resolve) => {
                let posts = getPosts().filter(post => 
                    post.location.toLowerCase().includes(location.toLowerCase())
                );
                
                // Sort by newest first
                posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                // Add verification status to each post
                posts = posts.map(post => {
                    return {
                        ...post,
                        verificationStatus: calculateVerificationStatus(post.id),
                        commentCount: this.getCommentCount(post.id),
                        userHasVerified: hasUserVerified(post.id)
                    };
                });
                
                resolve(posts);
            });
        },
        
        /**
         * Get unique locations from all posts
         * @returns {Promise} - Resolves with array of unique locations
         */
        getLocations: function() {
            return new Promise((resolve) => {
                resolve(getUniqueLocations());
            });
        },
        
        /**
         * Delete a post
         * @param {string} postId - The post ID
         * @returns {Promise} - Resolves when deleted
         */
        deletePost: function(postId) {
            return new Promise((resolve, reject) => {
                try {
                    // Verify user is authenticated
                    const currentUser = authService.getCurrentUser();
                    if (!currentUser) {
                        reject(new Error('You must be logged in to delete a post'));
                        return;
                    }
                    
                    // Get post to check ownership
                    const posts = getPosts();
                    const postIndex = posts.findIndex(p => p.id === postId);
                    
                    if (postIndex === -1) {
                        reject(new Error('Post not found'));
                        return;
                    }
                    
                    // Check if user has permission to delete
                    const post = posts[postIndex];
                    const isOwner = post.user.id === currentUser.id;
                    const isAdmin = currentUser.role === 'admin';
                    
                    if (!isOwner && !isAdmin) {
                        reject(new Error('You do not have permission to delete this post'));
                        return;
                    }
                    
                    // Remove post
                    posts.splice(postIndex, 1);
                    savePosts(posts);
                    
                    // Also remove associated comments and verifications
                    const comments = getComments().filter(c => c.postId !== postId);
                    saveComments(comments);
                    
                    const verifications = getVerifications().filter(v => v.postId !== postId);
                    saveVerifications(verifications);
                    
                    resolve();
                } catch (error) {
                    reject(new Error('Failed to delete post: ' + error.message));
                }
            });
        },
        
        /**
         * Submit verification for a post
         * @param {string} postId - The post ID
         * @param {boolean} isTrue - Whether the user verifies the post as true
         * @returns {Promise} - Resolves with updated verification status
         */
        verifyPost: function(postId, isTrue) {
            return new Promise((resolve, reject) => {
                try {
                    // Verify user is authenticated
                    const currentUser = authService.getCurrentUser();
                    if (!currentUser) {
                        reject(new Error('You must be logged in to verify a post'));
                        return;
                    }
                    
                    // Check if post exists
                    const posts = getPosts();
                    const post = posts.find(p => p.id === postId);
                    
                    if (!post) {
                        reject(new Error('Post not found'));
                        return;
                    }
                    
                    // Check if user has already verified this post
                    const verifications = getVerifications();
                    const existingIndex = verifications.findIndex(v => 
                        v.postId === postId && v.userId === currentUser.id
                    );
                    
                    if (existingIndex !== -1) {
                        // Update existing verification
                        verifications[existingIndex].isTrue = isTrue;
                        verifications[existingIndex].timestamp = new Date().toISOString();
                    } else {
                        // Add new verification
                        verifications.push({
                            id: generateId('verification'),
                            postId: postId,
                            userId: currentUser.id,
                            userRole: currentUser.role,
                            isTrue: isTrue,
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                    // Save verifications
                    saveVerifications(verifications);
                    
                    // Calculate updated status
                    const status = calculateVerificationStatus(postId);
                    resolve(status);
                } catch (error) {
                    reject(new Error('Failed to verify post: ' + error.message));
                }
            });
        },
        
        /**
         * Add comment to a post
         * @param {string} postId - The post ID
         * @param {string} text - Comment text
         * @returns {Promise} - Resolves with the added comment
         */
        addComment: function(postId, text) {
            return new Promise((resolve, reject) => {
                try {
                    // Verify user is authenticated
                    const currentUser = authService.getCurrentUser();
                    if (!currentUser) {
                        reject(new Error('You must be logged in to comment'));
                        return;
                    }
                    
                    // Check if post exists
                    const posts = getPosts();
                    const post = posts.find(p => p.id === postId);
                    
                    if (!post) {
                        reject(new Error('Post not found'));
                        return;
                    }
                    
                    // Create comment
                    const newComment = {
                        id: generateId('comment'),
                        postId: postId,
                        text: text.trim(),
                        timestamp: new Date().toISOString(),
                        user: {
                            id: currentUser.id,
                            fullName: currentUser.fullName,
                            profilePicture: currentUser.profilePicture || null,
                            role: currentUser.role
                        }
                    };
                    
                    // Get current comments and add the new one
                    const comments = getComments();
                    comments.push(newComment);
                    
                    // Save to storage
                    saveComments(comments);
                    
                    // Return the new comment
                    resolve(newComment);
                } catch (error) {
                    reject(new Error('Failed to add comment: ' + error.message));
                }
            });
        },
        
        /**
         * Get comments for a post
         * @param {string} postId - The post ID
         * @returns {Promise} - Resolves with array of comments
         */
        getCommentsForPost: function(postId) {
            return new Promise((resolve) => {
                const comments = getComments().filter(c => c.postId === postId);
                
                // Sort comments by newest first
                comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                resolve(comments);
            });
        },
        
        /**
         * Get total comment count for a post
         * @param {string} postId - The post ID
         * @returns {number} - Comment count
         */
        getCommentCount: function(postId) {
            const comments = getComments();
            return comments.filter(c => c.postId === postId).length;
        },
        
        /**
         * Check if current user has verified a post
         * @param {string} postId - The post ID
         * @returns {Object|null} - User's verification or null if not verified
         */
        getUserVerificationStatus: function(postId) {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) return null;
            
            const verifications = getVerifications();
            const userVerification = verifications.find(v => 
                v.postId === postId && v.userId === currentUser.id
            );
            
            return userVerification || null;
        },
        
        /**
         * Get recent posts (last 24 hours)
         * @returns {Promise} - Resolves with array of recent posts
         */
        getRecentPosts: function() {
            return new Promise((resolve) => {
                const posts = getPosts();
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                
                let recentPosts = posts.filter(post => 
                    new Date(post.timestamp) >= oneDayAgo
                );
                
                // Sort by newest first
                recentPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                // Add verification status to each post
                recentPosts = recentPosts.map(post => {
                    return {
                        ...post,
                        verificationStatus: calculateVerificationStatus(post.id)
                    };
                });
                
                resolve(recentPosts);
            });
        },
        
        /**
         * Get statistics about posts
         * @returns {Promise} - Resolves with statistics object
         */
        getStatistics: function() {
            return new Promise((resolve) => {
                const posts = getPosts();
                const comments = getComments();
                const verifications = getVerifications();
                
                // Get today's date at 00:00:00
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Calculate statistics
                const stats = {
                    totalPosts: posts.length,
                    postsToday: posts.filter(p => new Date(p.timestamp) >= today).length,
                    
                    // Count by disaster type
                    byDisasterType: {},
                    
                    // Count by verification status
                    verified: 0,
                    disputed: 0,
                    unverified: 0,
                    false: 0,
                    
                    // Count by severity
                    bySeverity: {
                        critical: 0,
                        high: 0,
                        medium: 0,
                        low: 0
                    },
                    
                    // Engagement metrics
                    totalComments: comments.length,
                    totalVerifications: verifications.length,
                    avgCommentsPerPost: posts.length > 0 ? comments.length / posts.length : 0,
                    avgVerificationsPerPost: posts.length > 0 ? verifications.length / posts.length : 0
                };
                
                // Count by disaster type
                posts.forEach(post => {
                    // Count by disaster type
                    if (!stats.byDisasterType[post.disasterType]) {
                        stats.byDisasterType[post.disasterType] = 0;
                    }
                    stats.byDisasterType[post.disasterType]++;
                    
                    // Count by severity
                    if (stats.bySeverity[post.severity] !== undefined) {
                        stats.bySeverity[post.severity]++;
                    }
                    
                    // Count by verification status
                    const status = calculateVerificationStatus(post.id).status;
                    stats[status]++;
                });
                
                resolve(stats);
            });
        }
    };
})();