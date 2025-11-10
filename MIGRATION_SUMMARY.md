# Migration Summary: Monorepo Refactor

## What Changed

The project has been refactored from a single application to a monorepo structure with client and server workspaces.

### Before
```
web-json-viewer/
├── src/           # React app
├── index.html
├── package.json
└── vite.config.js
```

### After
```
web-json-viewer/
├── client/              # React frontend
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/              # Express API
│   ├── api/
│   │   └── proxy.js     # Vercel serverless function
│   ├── dev-server.js    # Local development server
│   ├── package.json
│   └── README.md
├── package.json         # Root workspace config
├── vercel.json          # Vercel deployment config
├── DEPLOYMENT.md        # Deployment guide
└── COMMANDS.md          # Quick reference
```

## Key Features

### 1. Yarn Workspaces
- Root `package.json` manages both workspaces
- Shared `node_modules` for common dependencies
- Independent scripts for client and server

### 2. Custom CORS Proxy
- Replaced `allorigins.win` with custom Express server
- More secure and controllable
- Deployed as Vercel serverless function
- Available at `/api/proxy`

### 3. Development Workflow
- Client: `yarn dev` (Vite dev server on port 5173)
- Server: `yarn dev:server` (Express on port 3000)
- Vite proxies `/api/*` requests to localhost:3000

### 4. Vercel Deployment Ready
- Simplified `vercel.json` configuration
- Client builds to static files
- Server deploys as serverless functions
- Single command deployment: `vercel --prod`

## File Changes

### New Files
- `server/api/proxy.js` - CORS proxy serverless function
- `server/dev-server.js` - Local development server
- `server/package.json` - Server dependencies
- `server/README.md` - Server documentation
- `vercel.json` - Vercel configuration
- `DEPLOYMENT.md` - Deployment guide
- `COMMANDS.md` - Quick command reference
- `.vercelignore` - Files to exclude from deployment

### Modified Files
- `package.json` - Now root workspace config
- `client/src/App.jsx` - Updated to use `/api/proxy` instead of allorigins
- `client/vite.config.js` - Added proxy configuration
- `.gitignore` - Updated with more patterns
- `README.md` - Complete rewrite for monorepo

## CORS Proxy Changes

### Old (External Service)
```javascript
const fetchUrl = useCorsProxy
  ? `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  : url;
```

### New (Custom Server)
```javascript
const proxyUrl = import.meta.env.VITE_PROXY_URL || '/api/proxy';
const fetchUrl = useCorsProxy
  ? `${proxyUrl}?url=${encodeURIComponent(url)}`
  : url;
```

## Environment Detection

The app automatically detects the environment:

**Development:**
- Client runs on port 5173
- Server runs on port 3000
- Vite proxies `/api/*` to `localhost:3000`

**Production (Vercel):**
- Client served as static files
- Server runs as serverless function at `/api/proxy`
- Same domain, no CORS issues

## Dependencies

### Client (unchanged)
- react 18.3.1
- react-dom 18.3.1
- @microlink/react-json-view 1.23.0
- vite 5.4.2
- @vitejs/plugin-react 4.3.1

### Server (new)
- express 4.18.2
- cors 2.8.5

## Next Steps

1. **Test locally:**
   ```bash
   # Terminal 1
   yarn dev:server

   # Terminal 2
   yarn dev
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Optional: Connect GitHub**
   - Auto-deploy on push to main
   - Preview deployments for PRs

## Benefits

✅ Better code organization
✅ Own CORS proxy (more secure)
✅ Ready for Vercel deployment
✅ Easier to maintain and scale
✅ Clear separation of concerns
✅ Improved development workflow
