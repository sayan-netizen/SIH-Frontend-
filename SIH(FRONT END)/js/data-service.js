/**
 * Data Service for the Disaster Alert System
 * Handles API communication and data persistence
 */
const dataService = (function() {
    // Store reports locally if no backend is available
    let localReports = JSON.parse(localStorage.getItem('disasterReports')) || [];
    
    // Save reports to local storage
    function saveReportsToLocalStorage() {
        localStorage.setItem('disasterReports', JSON.stringify(localReports));
    }
    
    return {
        /**
         * Submit a new disaster report
         * @param {Object} reportData - The disaster report data
         * @returns {Promise} - Resolves with the saved report
         */
        submitDisasterReport: function(reportData) {
            return new Promise((resolve, reject) => {
                try {
                    // Add ID and submission time
                    const report = {
                        ...reportData,
                        id: Date.now().toString(),
                        submissionTime: new Date().toISOString()
                    };
                    
                    // In a real app, you'd make an API call here
                    // For demo, we'll just save to local storage
                    
                    // Simulate API delay
                    setTimeout(() => {
                        // Add to local reports
                        localReports.push(report);
                        saveReportsToLocalStorage();
                        resolve(report);
                    }, 1000);
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Get all disaster reports
         * @returns {Promise} - Resolves with array of reports
         */
        getAllReports: function() {
            return new Promise((resolve) => {
                // Simulate API delay
                setTimeout(() => {
                    resolve([...localReports]);
                }, 500);
            });
        },
        
        /**
         * Get a single report by ID
         * @param {string} id - The report ID
         * @returns {Promise} - Resolves with the report or null if not found
         */
        getReportById: function(id) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const report = localReports.find(r => r.id === id) || null;
                    resolve(report);
                }, 300);
            });
        },
        
        /**
         * Update report status
         * @param {string} id - The report ID
         * @param {string} status - New status (verified, rejected, etc)
         * @returns {Promise} - Resolves with updated report
         */
        updateReportStatus: function(id, status) {
            return new Promise((resolve, reject) => {
                try {
                    const index = localReports.findIndex(r => r.id === id);
                    if (index === -1) {
                        reject(new Error('Report not found'));
                        return;
                    }
                    
                    // Update status
                    localReports[index].status = status;
                    localReports[index].lastUpdated = new Date().toISOString();
                    
                    // Save changes
                    saveReportsToLocalStorage();
                    resolve(localReports[index]);
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Delete a report
         * @param {string} id - The report ID
         * @returns {Promise} - Resolves when deleted
         */
        deleteReport: function(id) {
            return new Promise((resolve, reject) => {
                try {
                    const initialLength = localReports.length;
                    localReports = localReports.filter(r => r.id !== id);
                    
                    if (localReports.length === initialLength) {
                        reject(new Error('Report not found'));
                        return;
                    }
                    
                    saveReportsToLocalStorage();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            });
        }
    };
})();
