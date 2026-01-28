import AxiosInstance from "../Utils/AxiosInstance";
import {
  APPLY_LEAVE,
  GET_MY_LEAVES,
  GET_ALL_LEAVES,
  UPDATE_LEAVE_STATUS,
} from "../Utils/Constants/Leave";

export async function applyLeave(data: any) {
  try {
    const response = await AxiosInstance.post(APPLY_LEAVE, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to apply for leave";
  }
}

export async function getMyLeaves() {
  try {
    const response = await AxiosInstance.get(GET_MY_LEAVES);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch leaves";
  }
}

export async function getAllLeaves() {
  try {
    const response = await AxiosInstance.get(GET_ALL_LEAVES);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch leaves";
  }
}

export async function updateLeaveStatus(leaveId: string, status: string) {
  try {
    const response = await AxiosInstance.put(
      `${UPDATE_LEAVE_STATUS}/${leaveId}/status`,
      { status },
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update leave status";
  }
}
