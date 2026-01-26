import AxiosInstance from "../Utils/AxiosInstance";
import {
  CREATE_STUDENT,
  GET_ALL_STUDENTS,
  GET_STUDENT_BY_ID,
  UPDATE_STUDENT,
  DELETE_STUDENT,
  UPDATE_PROFILE_PICTURE,
} from "../Utils/Constants/Student";

export async function createStudent(data: FormData) {
  try {
    const response = await AxiosInstance.post(CREATE_STUDENT, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to create student";
  }
}

export async function getAllStudents(params?: any) {
  try {
    const response = await AxiosInstance.get(GET_ALL_STUDENTS, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch students";
  }
}

export async function getStudentById(id: string) {
  try {
    const response = await AxiosInstance.get(`${GET_STUDENT_BY_ID}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch student";
  }
}

export async function updateStudent(id: string, data: FormData) {
  try {
    const response = await AxiosInstance.put(`${UPDATE_STUDENT}/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update student";
  }
}

export async function deleteStudent(id: string) {
  try {
    const response = await AxiosInstance.delete(`${DELETE_STUDENT}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to delete student";
  }
}

export async function updateStudentProfilePicture(id: string, data: FormData) {
  try {
    const response = await AxiosInstance.put(
      `${UPDATE_PROFILE_PICTURE}/${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update profile picture";
  }
}
