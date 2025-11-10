# JSON Table Viewer

A lightweight React single page application for viewing JSON data as searchable and sortable tables with a custom CORS proxy server.

## Features

1. **Upload JSON File** - Upload and validate JSON files with proper error handling
2. **Fetch from URL** - Fetch JSON data from public HTTP/HTTPS URLs with automatic CORS proxy
3. **Nested Data Access** - Use dot notation (e.g., `data.user.tasks`) to access nested arrays with clickable property suggestions
4. **Interactive JSON Inspector** - View and explore full JSON structure with expand/collapse functionality
5. **Markdown & HTML Rendering** - Table cells automatically detect and render Markdown and HTML content with syntax highlighting
6. **Searchable Table** - Filter table rows using the search input
7. **Sortable Columns** - Click column headers to sort ascending/descending
8. **Whitespace Preservation** - Newlines and whitespace are preserved in table cells

## Project Structure

This is a monorepo containing:

- **client/** - React frontend application built with Vite
- **server/** - Express CORS proxy server (deployed as Vercel serverless functions)

## Getting Started

### Install Dependencies

```bash
yarn install
```

This will install dependencies for both the client and server workspaces.

### Development

#### Run Client Only

```bash
yarn dev
```

This starts the Vite dev server at http://localhost:5173

#### Run Server Only

```bash
yarn dev:server
```

This starts the Express server at http://localhost:3000

#### Run Both (Recommended)

In separate terminal windows:

```bash
# Terminal 1 - Start the server
yarn dev:server

# Terminal 2 - Start the client
yarn dev
```

The client will proxy `/api` requests to the server running on port 3000.

### Build for Production

```bash
yarn build:all
```

This builds both the client and server for production.

## Usage

1. **Upload a JSON file** using the file input (25% width on the left), or
2. **Fetch from a URL** by entering an HTTP/HTTPS URL in the input bar (75% width on the right) and clicking "Fetch JSON"
   - Uses our own CORS proxy server automatically
3. If your JSON has nested data, use the **Data Path** field (e.g., `data.items`)
   - Click on suggested property buttons to quickly set the path
   - Use the **"Inspect JSON"** button to view the full JSON structure in an interactive viewer
4. Use the **search box** above the table to filter rows
5. Click **column headers** to sort the table

## JSON Inspector

The JSON Inspector modal provides an interactive view of your entire JSON structure with:
- **Expand/Collapse** - Click carets to expand or collapse nested objects and arrays
- **Syntax Highlighting** - Color-coded JSON with the Monokai theme
- **Copy to Clipboard** - Click on values to copy them
- **Depth Control** - Initially collapsed at depth 2 for better overview

## Markdown & HTML Rendering

Table cells automatically detect and render Markdown and HTML content:

**Supported Markdown:**
- Headers (# H1, ## H2, etc.)
- Bold (**text**) and italic (*text*)
- Code blocks with syntax highlighting (```language```)
- Inline code (`code`)
- Lists (ordered and unordered)
- Links ([text](url))
- Blockquotes (> quote)
- Tables
- Horizontal rules (---)

**Features:**
- Automatic detection - No configuration needed
- Syntax highlighting for code blocks (GitHub Dark theme)
- HTML rendering with security (escaped by default)
- Preserves plain text for non-markdown content

**Example:**
If your JSON contains:
```json
{
  "description": "## Installation\n\nRun `npm install` to get started.\n\n```bash\nnpm install\n```"
}
```

It will render as formatted markdown with syntax-highlighted code blocks.

## CORS Proxy

The application includes its own CORS proxy server that:
- Runs locally during development (port 3000)
- Deploys as serverless functions on Vercel
- Validates and sanitizes URLs for security
- Only allows HTTP and HTTPS protocols
- Returns proper error messages for debugging

## Deployment to Vercel

### Prerequisites

1. Install [Vercel CLI](https://vercel.com/cli):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

### Deploy

From the project root:

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

### Vercel Configuration

The `vercel.json` file is already configured to:
- Build the client as a static site
- Deploy the server as serverless functions under `/api`
- Route all API requests to the server
- Serve the client for all other routes

### Environment Variables

No environment variables are required for basic deployment. The client automatically uses:
- `/api/proxy` endpoint in production (Vercel)
- Vite proxy to `localhost:3000` in development

## Example JSON Structure

The application expects JSON data to be an array of objects:

```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com" },
  { "id": 2, "name": "Bob", "email": "bob@example.com" }
]
```

Or nested data accessible via dot notation:

```json
{
  "data": {
    "users": [
      { "id": 1, "name": "Alice" },
      { "id": 2, "name": "Bob" }
    ]
  }
}
```

Use `data.users` in the Data Path field to access the array.

## Tech Stack

### Client
- React 18
- Vite
- @microlink/react-json-view - Interactive JSON viewer
- react-markdown - Markdown rendering
- rehype-highlight - Syntax highlighting for code blocks
- rehype-raw - HTML support in markdown
- highlight.js - Code syntax highlighting

### Server
- Express
- CORS middleware

### Deployment
- Vercel (serverless functions + static hosting)
