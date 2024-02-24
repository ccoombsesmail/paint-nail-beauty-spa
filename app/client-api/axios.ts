import axios from 'axios';

// Create an instance of axios
const baseURL = process.env.NODE_ENV === 'development' ? "http://localhost:3000/api" : `${window.location.origin}/api`
const axiosClient = axios.create({
  baseURL
  // You can add more default settings here
});

export default axiosClient;
