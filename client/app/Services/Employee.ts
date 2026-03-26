import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const getAllEmployees = async () => {
  const response = await axios.get(`${API_URL}/employee/all`, {
    withCredentials: true,
  });
  return response.data;
};

export const addEmployee = async (data: {
  name: string;
  email: string;
  role: string;
  contactNumber?: string;
}) => {
  const response = await axios.post(`${API_URL}/employee/add`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const updateEmployee = async (id: string, data: any) => {
  const response = await axios.put(`${API_URL}/employee/${id}`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteEmployee = async (id: string) => {
  const response = await axios.delete(`${API_URL}/employee/${id}`, {
    withCredentials: true,
  });
  return response.data;
};
