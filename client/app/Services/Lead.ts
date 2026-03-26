import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const createLead = async (data: any) => {
  const response = await axios.post(`${API_URL}/lead/create`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const getLeads = async (params: any = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`${API_URL}/lead/all?${queryString}`, {
    withCredentials: true,
  });
  return response.data; // Note: Currently returns array, not {data, total}
};

export const updateLead = async (id: string, data: any) => {
  const response = await axios.put(`${API_URL}/lead/update/${id}`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const convertLeadToStudent = async (
  id: string,
  data: { branch: string; gender: string; type: string }
) => {
  const response = await axios.post(`${API_URL}/lead/${id}/convert`, data, {
    withCredentials: true,
  });
  return response.data;
};
