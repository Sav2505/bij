import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const fetchMessageAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};
