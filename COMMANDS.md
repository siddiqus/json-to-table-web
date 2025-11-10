# Quick Reference Commands

## Development

### Start Everything (Recommended)

```bash
# Terminal 1 - Server
yarn dev:server

# Terminal 2 - Client
yarn dev
```

Then open http://localhost:5173

### Start Client Only

```bash
yarn dev
```

### Start Server Only

```bash
yarn dev:server
```

## Building

### Build Client

```bash
yarn build
```

Output: `client/dist/`

### Build Everything

```bash
yarn build:all
```

## Deployment

### Deploy to Vercel Preview

```bash
vercel
```

### Deploy to Vercel Production

```bash
vercel --prod
```

## Testing the Build Locally

```bash
# Build the client
cd client
yarn build

# Preview
yarn preview

# In another terminal, run server
cd ../server
yarn dev
```

## Workspaces

### Install Dependencies

```bash
# Install all (from root)
yarn install

# Install for client only
yarn workspace client install

# Install for server only
yarn workspace server install
```

### Add Dependencies

```bash
# Add to client
yarn workspace client add package-name

# Add to server
yarn workspace server add package-name

# Add dev dependency to client
yarn workspace client add -D package-name
```

### Run Scripts

```bash
# Run client script
yarn workspace client <script-name>

# Run server script
yarn workspace server <script-name>
```

## Useful Commands

### Clean Everything

```bash
# Remove all node_modules
rm -rf node_modules client/node_modules server/node_modules

# Remove all build artifacts
rm -rf client/dist

# Reinstall
yarn install
```

### Check Project Structure

```bash
tree -I node_modules -L 3
```

### View Logs (Vercel)

```bash
vercel logs
```
