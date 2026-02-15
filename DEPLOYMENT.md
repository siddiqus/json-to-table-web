# Deployment Guide

This guide covers deploying the JSON to Table project to Vercel.

## Project Structure

```
json-table-viewer/
├── client/          # React frontend (Vite)
├── server/          # Express API (Serverless)
│   └── api/
│       └── proxy.js # CORS proxy endpoint
├── vercel.json      # Vercel configuration
└── package.json     # Root package.json with workspaces
```

## Vercel Deployment

### Setup

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

### Deploy

From the project root directory:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### What Happens During Deployment

1. Vercel reads `vercel.json` configuration
2. Runs `yarn install` in the root (installs all workspace dependencies)
3. Builds the client with `cd client && yarn build`
4. Outputs static files from `client/dist`
5. Deploys `server/api/*.js` as serverless functions

### API Routes

The server proxy is automatically available at:
- Development: http://localhost:3000/api/proxy
- Production: https://your-app.vercel.app/api/proxy

### Environment Variables

No environment variables are required for basic deployment.

The client automatically detects the environment:
- In development: Uses Vite proxy to localhost:3000
- In production: Uses `/api/proxy` (same domain)

### Custom Domain (Optional)

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain

### Troubleshooting

**Build fails:**
- Check that `client/package.json` has a `build` script
- Ensure all dependencies are listed in package.json

**API not working:**
- Verify `server/api/proxy.js` exists
- Check Vercel function logs in the dashboard
- Ensure the file exports a default function

**Client not loading:**
- Check `vercel.json` has correct `outputDirectory`
- Verify build completed successfully
- Check browser console for errors

## Local Testing

Test the production build locally:

```bash
# Build the client
cd client
yarn build

# Preview the build
yarn preview

# In another terminal, run the server
cd ../server
yarn dev
```

## Monitoring

View logs and analytics in the Vercel dashboard:
- https://vercel.com/dashboard

## Rolling Back

To rollback to a previous deployment:

1. Go to Vercel dashboard
2. Select your project
3. Go to Deployments
4. Click on a previous deployment
5. Click "Promote to Production"

## CI/CD

Vercel automatically deploys when you push to GitHub:

1. Connect your GitHub repository in Vercel dashboard
2. Every push to `main` branch deploys to production
3. Pull requests create preview deployments

### GitHub Integration Setup

1. Go to Vercel dashboard
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will detect settings from `vercel.json`
5. Click "Deploy"
