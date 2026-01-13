import AxiosInstance from "../Utils/AxiosInstance";
import {
  ADD_TRAINER,
  GET_ALL_TRAINERS,
  GET_TRAINER_BY_ID,
  UPDATE_TRAINER,
  DELETE_TRAINER,
} from "../Utils/Constants/Trainer";

export async function addTrainer(data: FormData) {
  try {
    const response = await AxiosInstance.post(ADD_TRAINER, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to add trainer"
    );
  }
}

export async function getAllTrainers(params?: any) {
  try {
    const response = await AxiosInstance.get(GET_ALL_TRAINERS, { params });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch trainers"
    );
  }
}

export async function getTrainerById(id: string) {
  try {
    const response = await AxiosInstance.get(`${GET_TRAINER_BY_ID}/${id}`);
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch trainer"
    );
  }
}

export async function updateTrainer(id: string, data: FormData) {
  try {
    const response = await AxiosInstance.put(`${UPDATE_TRAINER}/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update trainer"
    );
  }
}

export async function deleteTrainer(id: string) {
  try {
    const response = await AxiosInstance.delete(`${DELETE_TRAINER}/${id}`);
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to delete trainer"
    );
  }
}
