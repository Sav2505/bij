import axios from 'axios';

export const fetchMessageAPI = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
    
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};
