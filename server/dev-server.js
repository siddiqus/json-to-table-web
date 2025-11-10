import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint
app.get('/api/proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Validate URL format
  let targetUrl;
  try {
    targetUrl = new URL(url);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are allowed' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Fetch the URL
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'JSON-Table-Viewer/1.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch: ${response.status} ${response.statusText}`,
      });
    }

    // Get the response as text first
    const text = await response.text();

    // Try to parse as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(text);
    } catch (error) {
      return res.status(400).json({ error: 'Response is not valid JSON' });
    }

    // Return the JSON data
    return res.status(200).json(jsonData);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Failed to fetch URL',
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`CORS Proxy server running on http://localhost:${PORT}`);
});
