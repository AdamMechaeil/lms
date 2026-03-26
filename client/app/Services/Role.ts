import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const getAllRoles = async () => {
  const response = await axios.get(`${API_URL}/role/all`, {
    withCredentials: true,
  });
  return response.data;
};

export const createRole = async (data: {
  name: string;
  description?: string;
  permissions: string[];
}) => {
  const response = await axios.post(`${API_URL}/role/create`, data, {
    withCredentials: true,
  });
  return response.data;
};
