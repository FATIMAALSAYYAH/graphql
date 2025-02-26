/**
 * Simple development server for local testing
 * Run with: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Handle root request with index.html
  let filePath = req.url === '/' 
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, req.url);

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Default to plain text if mime type is not recognized
  const contentType = mimeTypes[extname] || 'text/plain';

  // Read file and respond
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Page not found
        console.log(`⚠️ File not found: ${filePath}`);
        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
          if (err) {
            // If 404 page doesn't exist, send a basic 404 message
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('404 Not Found');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        console.error(`❌ Server error:`, error);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`
✅ Development server running at http://localhost:${PORT}
🌐 You can now view your application in the browser.
📋 Press Ctrl+C to stop the server
  `);
}); 