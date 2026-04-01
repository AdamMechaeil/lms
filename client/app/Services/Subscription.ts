import AxiosInstance from "../Utils/AxiosInstance";

export const createRazorpayOrder = async (planId: string) => {
  const response = await AxiosInstance.post("/api/v1/subscription/create-order", { planId });
  return response.data;
};

export const verifyRazorpayPayment = async (data: any) => {
  const response = await AxiosInstance.post("/api/v1/subscription/verify", data);
  return response.data;
};
