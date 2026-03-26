import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const createRazorpayOrder = async (planId: string) => {
  const response = await axios.post(`${API_URL}/subscription/create-order`, { planId }, {
    withCredentials: true,
  });
  return response.data;
};

export const verifyRazorpayPayment = async (data: any) => {
  const response = await axios.post(`${API_URL}/subscription/verify`, data, {
    withCredentials: true,
  });
  return response.data;
};
