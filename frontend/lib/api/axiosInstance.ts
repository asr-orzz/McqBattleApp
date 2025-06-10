import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mcqbattleapp-production.up.railway.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
