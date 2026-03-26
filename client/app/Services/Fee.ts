import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const initializeFeeStructure = async (data: any) => {
  const response = await axios.post(`${API_URL}/fee/initialize`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const recordPayment = async (data: any) => {
  const response = await axios.post(`${API_URL}/fee/payment`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const getStudentFinancials = async (studentId: string) => {
  const response = await axios.get(`${API_URL}/fee/student/${studentId}`, {
    withCredentials: true,
  });
  return response.data;
};

// --- STUDENT SELF-SERVICE APIs --- //

export const getMyFinancials = async () => {
  const response = await axios.get(`${API_URL}/fee/my-financials`, {
    withCredentials: true,
  });
  return response.data;
};

export const createStudentRazorpayOrder = async (amount: number) => {
  const response = await axios.post(`${API_URL}/fee/student/create-order`, { amount }, {
    withCredentials: true,
  });
  return response.data;
};

export const verifyStudentPayment = async (data: any) => {
  const response = await axios.post(`${API_URL}/fee/student/verify`, data, {
    withCredentials: true,
  });
  return response.data;
};
