import axios from 'axios';

// Create an instance of axios
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  // You can add more default settings here
});

export default axiosClient;
