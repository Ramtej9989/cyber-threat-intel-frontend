import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = req.query.endpoint;
  const apiKey = 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

  try {
    // Parse the multipart form data
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Forward the request to the backend
    const formData = new FormData();
    const stream = Readable.from(buffer);
    formData.append('file', stream, { filename: 'file.csv' });

    const response = await axios.post(
      `https://cyber-threat-intel-analytics.onrender.com/api/ingestion/upload/${endpoint}?api_key=${apiKey}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
}
