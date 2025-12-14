const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://cors-anywhere.herokuapp.com/https://cyber-threat-intel-analytics.onrender.com'
  : 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

export { API_URL, API_KEY };
