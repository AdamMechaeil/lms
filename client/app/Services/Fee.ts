import AxiosInstance from "../Utils/AxiosInstance";

export const initializeFeeStructure = async (data: any) => {
  const response = await AxiosInstance.post("/api/v1/fee/structure/init", data);
  return response.data;
};

export const recordPayment = async (data: any) => {
  const response = await AxiosInstance.post("/api/v1/fee/payment/record", data);
  return response.data;
};

export const getStudentFinancials = async (studentId: string) => {
  const response = await AxiosInstance.get(`/api/v1/fee/student/${studentId}`);
  return response.data;
};

// --- STUDENT SELF-SERVICE APIs --- //

export const getMyFinancials = async () => {
  const response = await AxiosInstance.get("/api/v1/fee/my-financials");
  return response.data;
};

export const createStudentRazorpayOrder = async (amount: number) => {
  const response = await AxiosInstance.post("/api/v1/fee/student/create-order", { amount });
  return response.data;
};

export const verifyStudentPayment = async (data: any) => {
  const response = await AxiosInstance.post("/api/v1/fee/student/verify", data);
  return response.data;
};
