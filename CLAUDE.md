# CLAUDE.md

Development guide for AI assistants working on this codebase.

## Project Overview

JSON To Table: a React + Express monorepo that converts JSON data into searchable, sortable, editable tables. Deployed on Vercel.

## Repository Structure

```
web-json-viewer/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx          # Main app component (state, data loading, URL params)
│   │   ├── main.jsx         # React entry point
│   │   ├── components/
│   │   │   ├── DataTable.jsx    # Table rendering, sorting, search, TSV copy
│   │   │   ├── TableCell.jsx    # Cell rendering (markdown detection, inline editing)
│   │   │   ├── Modal.jsx        # Generic modal (JSON inspector + text input)
│   │   │   ├── Button.jsx       # Reusable button
│   │   │   ├── Card.jsx         # Reusable card wrapper
│   │   │   ├── Input.jsx        # Reusable input
│   │   │   └── ErrorMessage.jsx # Error display
│   │   └── utils/
│   │       └── json.js          # resolvePath() and formatCellContent()
│   ├── index.html
│   ├── vite.config.js       # Vite config with /api proxy to localhost:3000
│   └── package.json
├── server/                  # Express CORS proxy
│   ├── api/
│   │   └── proxy.js         # Vercel serverless function + Express handler
│   ├── dev-server.js        # Local dev server (port 3000)
│   └── package.json
├── package.json             # Root workspace config (Yarn workspaces)
├── vercel.json              # Vercel deployment config
└── .gitignore
```

## Commands

```bash
# Install all dependencies (client + server)
yarn install

# Start client dev server (port 5173)
yarn dev

# Start API server (port 3000)
yarn dev:server

# Build client for production
yarn build

# Build everything
yarn build:all

# Preview production build
yarn preview

# Deploy to Vercel
vercel          # preview
vercel --prod   # production
```

For local development, run both `yarn dev:server` and `yarn dev` in separate terminals. The Vite dev server proxies `/api` requests to `localhost:3000`.

## Tech Stack

- **Frontend:** React 18, Vite 5, JSX (no TypeScript)
- **Backend:** Express 4
- **Package Manager:** Yarn with workspaces
- **Deployment:** Vercel (static frontend + serverless functions)
- **Key Libraries:** react-markdown, rehype-highlight, rehype-raw, highlight.js, @microlink/react-json-view

## Architecture Notes

- **No TypeScript** -- all source files are `.jsx` / `.js`. Do not introduce TypeScript.
- **No test framework** -- there are no automated tests. Do not create test files unless explicitly asked.
- **CSS is co-located** -- each component has a matching `.css` file in the same directory. Use plain CSS, not CSS modules or styled-components.
- **State lives in App.jsx** -- all top-level state (jsonData, dataPath, searchTerm, sortConfig, url, loading, modals) is managed in App.jsx with React useState hooks. There is no state management library.
- **CORS proxy** -- the server exists solely as a CORS proxy at `/api/proxy?url=<encoded-url>`. In development, Vite proxies `/api` to `localhost:3000`. In production, Vercel deploys `server/api/proxy.js` as a serverless function.
- **URL state persistence** -- query params (`?url=...&path=...`) are synced to the browser URL so table views are shareable.

## Code Conventions

- Functional components with hooks (no class components)
- No prop-types or runtime type checking
- Component files are PascalCase (`DataTable.jsx`)
- Utility files are camelCase (`json.js`)
- CSS class names use kebab-case
- ES module syntax throughout (`import`/`export`, `"type": "module"` in package.json)
- No linter or formatter is configured -- match the style of surrounding code

## Key Patterns

### Adding a new component

1. Create `client/src/components/ComponentName.jsx` and optionally `ComponentName.css`
2. Import and use in `App.jsx` or in the parent component
3. Follow the existing pattern: export a single default function component

### Modifying table behavior

- **Sorting/searching:** `DataTable.jsx` handles sort state and search filtering
- **Cell rendering:** `TableCell.jsx` handles markdown detection, JSON formatting, and inline edit mode
- **Data path resolution:** `utils/json.js` `resolvePath()` navigates nested objects with dot notation

### Working with the proxy server

- `server/dev-server.js` is the local Express server
- `server/api/proxy.js` is the Vercel serverless function
- Both validate URLs (HTTP/HTTPS only) and set CORS headers
- When modifying proxy behavior, update both files

## Common Tasks

### Add a new dependency

```bash
# Frontend dependency
yarn workspace json-table-viewer add <package>

# Server dependency
yarn workspace server add <package>

# Dev dependency
yarn workspace json-table-viewer add -D <package>
```

### Clean reinstall

```bash
rm -rf node_modules client/node_modules server/node_modules client/dist
yarn install
```
