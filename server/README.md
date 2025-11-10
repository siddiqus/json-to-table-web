# CORS Proxy Server

A simple Express-based CORS proxy server for the JSON Table Viewer application.

## Features

- Proxies HTTP/HTTPS requests to bypass CORS restrictions
- Validates URLs for security
- Returns proper error messages
- Deployed as Vercel serverless functions

## Development

```bash
yarn dev
```

Runs the server on http://localhost:3000

## API Endpoint

### GET /api/proxy

Proxies a JSON request to the specified URL.

**Query Parameters:**
- `url` (required) - The URL to fetch JSON from

**Example:**
```
GET /api/proxy?url=https://jsonplaceholder.typicode.com/users
```

**Response:**
Returns the JSON data from the target URL.

**Error Responses:**
- `400` - Missing or invalid URL
- `500` - Failed to fetch or parse JSON
