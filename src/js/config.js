// Configuration settings for the application
const config = {
  // Check if we're running on GitHub Pages and set the base URL accordingly
  baseUrl: window.location.hostname.includes('github.io') 
    ? '/graphql/' 
    : './',
  
  apiEndpoint: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
  
  // API endpoint for authentication
  authEndpoint: 'https://learn.reboot01.com/api/auth/signin'
};

// Helper function to resolve paths correctly for the current environment
config.resolvePath = function(path) {
  // Remove starting slash if present
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  
  // For relative paths that don't need baseUrl prefixing
  if (path.startsWith('./') || path.startsWith('../')) {
    return path;
  }
  
  return this.baseUrl + path;
};

// Add debug information to help troubleshoot
if (window.location.hostname.includes('github.io')) {
  console.log('Running on GitHub Pages');
  console.log('Base URL:', config.baseUrl);
}

export default config; 