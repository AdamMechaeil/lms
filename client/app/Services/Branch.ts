import AxiosInstance from "../Utils/AxiosInstance";
import {
  CREATE_BRANCH,
  GET_ALL_BRANCHES,
  UPDATE_BRANCH,
  DELETE_BRANCH,
} from "../Utils/Constants/Branch";

export async function createBranch(data: any) {
  try {
    const response = await AxiosInstance.post(CREATE_BRANCH, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to create branch";
  }
}

export async function getAllBranches(params?: any) {
  try {
    const response = await AxiosInstance.get(GET_ALL_BRANCHES, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch branches";
  }
}

export async function updateBranch(id: string, data: any) {
  try {
    // Note: The route is defined as /updateBranch/:id in backend code provided
    const response = await AxiosInstance.put(`${UPDATE_BRANCH}/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update branch";
  }
}

export async function deleteBranch(id: string) {
  try {
    const response = await AxiosInstance.delete(`${DELETE_BRANCH}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to delete branch";
  }
}
