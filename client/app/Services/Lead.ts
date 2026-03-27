import AxiosInstance from "../Utils/AxiosInstance";

export const createLead = async (data: any) => {
  const response = await AxiosInstance.post("/api/v1/lead/create", data);
  return response.data;
};

export const getAllLeads = async () => {
  const response = await AxiosInstance.get("/api/v1/lead/all");
  return response.data;
};

export const updateLeadDetails = async (id: string, data: any) => {
  const response = await AxiosInstance.put(`/api/v1/lead/update/${id}`, data);
  return response.data;
};

export const convertLeadToStudent = async (id: string, data: any) => {
  const response = await AxiosInstance.post(`/api/v1/lead/${id}/convert`, data);
  return response.data;
};

// Aliases to match component imports
export const getLeads = getAllLeads;
export const updateLead = updateLeadDetails;
