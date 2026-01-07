import AxiosInstance from "../Utils/AxiosInstance";
import {
  CREATE_DOMAIN,
  GET_ALL_DOMAINS,
  GET_DOMAIN_BY_ID,
  UPDATE_DOMAIN,
  DELETE_DOMAIN,
} from "../Utils/Constants/Domain";

export async function createDomain(data: any) {
  try {
    const response = await AxiosInstance.post(CREATE_DOMAIN, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to create domain";
  }
}

export async function getAllDomains(params?: any) {
  try {
    const response = await AxiosInstance.get(GET_ALL_DOMAINS, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch domains";
  }
}

export async function getDomainById(id: string) {
  try {
    const response = await AxiosInstance.get(`${GET_DOMAIN_BY_ID}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch domain";
  }
}

export async function updateDomain(id: string, data: any) {
  try {
    const response = await AxiosInstance.put(`${UPDATE_DOMAIN}/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update domain";
  }
}

export async function deleteDomain(id: string) {
  try {
    const response = await AxiosInstance.delete(`${DELETE_DOMAIN}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to delete domain";
  }
}
