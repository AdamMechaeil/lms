import AxiosInstance from "../Utils/AxiosInstance";
import { GET_BATCH_MESSAGES, UPLOAD_CHAT_MEDIA } from "../Utils/Constants/Chat";

export async function getBatchMessages(batchId: string) {
  try {
    // Replace :batchId in the constant or construct URL dynamically
    // The constant is "/chat/:batchId/messages"
    const url = GET_BATCH_MESSAGES.replace(":batchId", batchId);
    const response = await AxiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch messages";
  }
}

export async function uploadChatMedia(data: FormData) {
  try {
    const response = await AxiosInstance.post(UPLOAD_CHAT_MEDIA, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to upload media";
  }
}
