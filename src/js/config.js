// Configuration settings for the application
const config = {
  baseUrl: './',  // Use relative path instead of absolute
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

export default config; 