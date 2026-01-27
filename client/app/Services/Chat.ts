import AxiosInstance from "../Utils/AxiosInstance";

const BASE_URL = "/api/v1/chat";

export async function getBatchMessages(
  batchId: string,
  page: number = 1,
  limit: number = 50,
) {
  try {
    const response = await AxiosInstance.get(
      `${BASE_URL}/${batchId}/messages`,
      {
        params: { page, limit },
      },
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch messages";
  }
}

export async function uploadChatMedia(formData: FormData) {
  try {
    const response = await AxiosInstance.post(`${BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to upload media";
  }
}
