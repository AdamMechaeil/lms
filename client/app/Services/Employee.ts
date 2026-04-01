import AxiosInstance from "../Utils/AxiosInstance";

export const getAllEmployees = async () => {
  const response = await AxiosInstance.get("/api/v1/employee/all");
  return response.data;
};

export const addEmployee = async (data: {
  name: string;
  email: string;
  role: string;
  contactNumber?: string;
}) => {
  const response = await AxiosInstance.post("/api/v1/employee/add", data);
  return response.data;
};

export const updateEmployee = async (id: string, data: any) => {
  const response = await AxiosInstance.put(`/api/v1/employee/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id: string) => {
  const response = await AxiosInstance.delete(`/api/v1/employee/${id}`);
  return response.data;
};
