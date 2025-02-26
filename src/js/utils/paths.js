// Utility for handling paths in both local development and GitHub Pages
export const pathResolver = {
  // Determine if we're on GitHub Pages
  isGitHubPages: window.location.hostname === 'fatimaalsayyah.github.io',
  
  // Get the base path ('/graphql/' for GitHub Pages, '/' for local)
  getBasePath: function() {
    return this.isGitHubPages ? '/graphql/' : '/';
  },
  
  // Resolve a path to be correct for the current environment
  resolvePath: function(path) {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    return this.getBasePath() + path;
  },
  
  // Get a full URL including hostname
  getFullUrl: function(path) {
    return window.location.origin + this.resolvePath(path);
  }
}; 