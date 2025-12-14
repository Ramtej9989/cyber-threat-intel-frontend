import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

  try {
    const response = await axios.post(
      `https://cyber-threat-intel-analytics.onrender.com/api/detection/run?api_key=${apiKey}`,
      { hours_back: 24 },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000 // 2 minutes
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Detection error:', error);
    return res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
}
