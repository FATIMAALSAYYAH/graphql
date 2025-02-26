// Simple router for GitHub Pages single-page applications
export default function setupRouter() {
    // Handle 404 redirects for SPA on GitHub Pages
    // This is needed because GitHub Pages doesn't support proper SPA routing
    
    // Check if we're on a GitHub Pages 404 page
    if (document.location.pathname.includes('/graphql/') && 
        !document.location.pathname.endsWith('/graphql/') && 
        !document.location.pathname.includes('.')) {
        
        // Redirect to the base app with the path as a fragment
        const path = document.location.pathname.replace('/graphql/', '');
        window.location.replace(`/graphql/#/${path}`);
    }
} 