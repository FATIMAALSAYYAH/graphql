// Helper to determine the current environment
export const environment = {
  isGithubPages: window.location.hostname.includes('github.io'),
  isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Get the base URL for the current environment
  getBaseUrl: function() {
    if (this.isGithubPages) {
      // Extract the repository name from the pathname
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 1) {
        return '/' + pathParts[1] + '/';
      }
    }
    return '/';
  },
  
  // Log environment information for debugging
  logInfo: function() {
    console.log('Environment:', this.isGithubPages ? 'GitHub Pages' : (this.isLocalhost ? 'Localhost' : 'Other'));
    console.log('Base URL:', this.getBaseUrl());
    console.log('Full URL:', window.location.href);
  }
}; 