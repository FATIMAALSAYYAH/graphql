# GraphQL Dashboard for GitHub Pages

A beautiful, interactive dashboard built with JavaScript for GitHub Pages. This project was converted from a Go backend to a fully client-side JavaScript implementation to enable hosting on GitHub Pages.

## Features

- Interactive user dashboard with profile information
- Beautiful visualizations using D3.js
  - XP Progress graph with animations
  - Skills radar chart
  - Audit statistics bar chart
- Secure authentication with JWT
- GraphQL data fetching
- Responsive design for all devices

## Running Locally

You have several options to run this project locally:

### Option 1: Using Node.js (Recommended)

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Clone this repository
3. Open a terminal in the project directory
4. Run the development server:

```bash
# Install dependencies (first time only)
npm install

# Start the server
npm start
```

The application will be available at http://localhost:3000

For development with auto-reload:

```bash
npm run dev
```

### Option 2: Using Python's built-in HTTP server

If you have Python installed, you can use its built-in HTTP server:

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

The application will be available at http://localhost:8000

### Option 3: Using any static file server

You can use any static file server like [serve](https://www.npmjs.com/package/serve):

```bash
npx serve
```

## Deployment to GitHub Pages

This project is specifically designed to work with GitHub Pages. Follow these steps to deploy:

1. Fork this repository
2. Go to your repository settings
3. Navigate to "Pages" under "Code and automation"
4. Select "main" branch as the source
5. Click "Save"

Your dashboard will be available at `https://FATIMAALSAYYAH.github.io/graphql/`

### Automatic Deployment

This repository includes a GitHub Actions workflow that automatically deploys your changes to GitHub Pages whenever you push to the main branch.

## Technical Architecture

This project uses a pure client-side JavaScript implementation to replace the original Go backend:

- **Authentication**: Client-side JWT handling with secure token storage
- **API Requests**: Fetch API for GraphQL queries
- **Data Visualization**: D3.js for interactive charts
- **Styling**: CSS with responsive design

## Configuration

You may need to update the API endpoint in `src/js/server/api.js` to point to your specific GraphQL server.

```javascript
// In src/js/server/api.js
this.baseUrl = 'https://01.kood.tech' // Replace with your actual API endpoint
```

## Troubleshooting

### CORS Issues

If you're experiencing CORS issues when making API requests:

1. Ensure your API server has CORS headers enabled
2. For development, you can use a CORS proxy
3. Check that your API endpoint is correctly configured in `src/js/server/api.js`

### Authentication Issues

If you're having trouble logging in:

1. Check your API endpoint configuration
2. Clear your browser's localStorage and cache
3. Ensure your GraphQL endpoint is accessible from your deployment location 