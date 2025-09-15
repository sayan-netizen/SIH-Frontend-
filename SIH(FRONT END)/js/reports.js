document.addEventListener('DOMContentLoaded', function() {
    loadReports();
    setupFilters();
});

function loadReports() {
    const reportsContainer = document.getElementById('reportsContainer');
    const noReports = document.getElementById('noReports');
    
    // Show loading message
    reportsContainer.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading reports...</div>';
    
    // Simulate loading reports from localStorage
    setTimeout(() => {
        const reports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
        
        if (reports.length === 0) {
            reportsContainer.innerHTML = '';
            noReports.classList.remove('hidden');
        } else {
            displayReports(reports);
            noReports.classList.add('hidden');
        }
    }, 1000);
}

function displayReports(reports) {
    const reportsContainer = document.getElementById('reportsContainer');
    
    const reportsHTML = reports.map(report => {
        const date = new Date(report.timestamp).toLocaleDateString();
        const photoCount = report.photoCount || 0;
        
        return `
            <div class="report-card">
                <div class="report-header">
                    <span class="report-type">${report.disasterType}</span>
                    <span class="report-status ${report.status}">${report.status}</span>
                </div>
                
                <div class="report-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${report.location}
                </div>
                
                <div class="report-description">
                    ${report.description}
                </div>
                
                <div class="report-meta">
                    <div class="report-date">
                        <i class="fas fa-calendar"></i>
                        ${date}
                    </div>
                    <div class="report-photos">
                        <i class="fas fa-camera"></i>
                        ${photoCount} photo${photoCount !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    reportsContainer.innerHTML = reportsHTML;
}

function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterReports);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', filterReports);
    }
}

function filterReports() {
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    const allReports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
    
    let filteredReports = allReports.filter(report => {
        const statusMatch = statusFilter === 'all' || report.status === statusFilter;
        const typeMatch = typeFilter === 'all' || report.disasterType === typeFilter;
        return statusMatch && typeMatch;
    });
    
    displayReports(filteredReports);
}