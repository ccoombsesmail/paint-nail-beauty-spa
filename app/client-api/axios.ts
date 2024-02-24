import axios from 'axios';

// Create an instance of axios
const axiosClient = axios.create({
  baseURL: `${window.location.origin}/api`,
  // You can add more default settings here
});

export default axiosClient;
