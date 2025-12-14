export default async function handler(req, res) {
  const targetUrl = req.query.url;
  const apiKey = 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Build the full target URL
    const fullUrl = `https://cyber-threat-intel-analytics.onrender.com${targetUrl}`;
    const urlWithKey = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}api_key=${apiKey}`;
    
    // Forward the request
    const response = await fetch(urlWithKey, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    // Get response data
    const data = await response.json();
    
    // Return response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch from API' });
  }
}
