import AxiosInstance from "../Utils/AxiosInstance";
import {
  CREATE_BATCH,
  GET_ALL_BATCHES,
  GET_BATCH_BY_ID,
  UPDATE_BATCH,
  DELETE_BATCH,
  ASSIGN_BATCH_TO_STUDENT,
  CREATE_BATCH_MEET_LINK,
  GET_BATCH_RECORDINGS,
  GET_BATCHES_BY_STUDENT,
  REMOVE_STUDENT_FROM_BATCH,
} from "../Utils/Constants/Batch";

export async function createBatch(data: any) {
  try {
    const response = await AxiosInstance.post(CREATE_BATCH, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to create batch";
  }
}

export async function getAllBatches(params?: any) {
  try {
    const response = await AxiosInstance.get(GET_ALL_BATCHES, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch batches";
  }
}

export async function getBatchById(id: string) {
  try {
    const response = await AxiosInstance.get(`${GET_BATCH_BY_ID}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch batch";
  }
}

export async function updateBatch(id: string, data: any) {
  try {
    const response = await AxiosInstance.put(`${UPDATE_BATCH}/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update batch";
  }
}

export async function deleteBatch(id: string) {
  try {
    const response = await AxiosInstance.delete(`${DELETE_BATCH}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to delete batch";
  }
}

export async function assignBatchToStudent(data: any) {
  try {
    const response = await AxiosInstance.post(ASSIGN_BATCH_TO_STUDENT, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to assign batch to student";
  }
}

export async function createBatchMeetLink(data: any) {
  try {
    const response = await AxiosInstance.post(CREATE_BATCH_MEET_LINK, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to create meet link";
  }
}

export async function getBatchRecordings(batchId: string) {
  try {
    const response = await AxiosInstance.get(
      `${GET_BATCH_RECORDINGS}/${batchId}`
    );
    return response.data.recordings || [];
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch batch recordings";
  }
}

export async function getBatchesByStudent(studentId: string) {
  try {
    const response = await AxiosInstance.get(
      `${GET_BATCHES_BY_STUDENT}/${studentId}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch student batches";
  }
}
export async function removeStudentFromBatch(data: any) {
  try {
    const response = await AxiosInstance.delete(REMOVE_STUDENT_FROM_BATCH, {
      data,
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message || "Failed to remove student from batch"
    );
  }
}
