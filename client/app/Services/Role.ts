import AxiosInstance from "../Utils/AxiosInstance";

export const getAllRoles = async () => {
  const response = await AxiosInstance.get("/api/v1/role/all");
  return response.data;
};

export const createRole = async (data: any) => {
  const response = await AxiosInstance.post("/api/v1/role/create", data);
  return response.data;
};
