import AxiosInstance from "../Utils/AxiosInstance";
import {
  GET_DASHBOARD_STATS,
  GET_RECENT_ACTIVITY,
} from "../Utils/Constants/Dashboard";

export async function getDashboardStats() {
  try {
    const response = await AxiosInstance.get(GET_DASHBOARD_STATS);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch dashboard stats";
  }
}

export async function getRecentActivity() {
  try {
    const response = await AxiosInstance.get(GET_RECENT_ACTIVITY);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch recent activity";
  }
}
