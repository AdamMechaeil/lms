import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DEV_BASE_URL,
  withCredentials: true,
});

export default axiosInstance;
