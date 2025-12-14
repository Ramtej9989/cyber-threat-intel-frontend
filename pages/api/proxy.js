import axios from 'axios';

export default async function handler(req, res) {
  const { url, method = 'GET', body, headers = {} } = req.query;
  
  // Make sure the API key is included
  const apiKey = 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';
  const targetUrl = `https://cyber-threat-intel-analytics.onrender.com${url}?api_key=${apiKey}`;
  
  try {
    const response = await axios({
      method,
      url: targetUrl,
      data: body ? JSON.parse(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
    
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
}
