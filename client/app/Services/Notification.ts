import AxiosInstance from "../Utils/AxiosInstance";
import {
  SEND_NOTIFICATION,
  GET_MY_NOTIFICATIONS,
  MARK_AS_READ,
} from "../Utils/Constants/Notification";

export async function sendNotification(data: any) {
  try {
    const response = await AxiosInstance.post(SEND_NOTIFICATION, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to send notification";
  }
}

export async function getMyNotifications() {
  try {
    const response = await AxiosInstance.get(GET_MY_NOTIFICATIONS);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch notifications";
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const response = await AxiosInstance.put(`${MARK_AS_READ}/${id}/read`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to mark as read";
  }
}
