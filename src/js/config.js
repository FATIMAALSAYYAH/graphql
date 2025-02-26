// Configuration settings for the application
const config = {
  // Dynamically determine base URL for local vs GitHub Pages
  baseUrl: location.hostname === 'localhost' || location.hostname === '127.0.0.1' 
    ? '/' 
    : '/graphql/',
  
  // API endpoint for GraphQL
  apiEndpoint: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
  
  // API endpoint for authentication
  authEndpoint: 'https://learn.reboot01.com/api/auth/signin'
};

// Helper function to resolve paths correctly
config.resolvePath = function(path) {
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return this.baseUrl + path;
};

export default config; 