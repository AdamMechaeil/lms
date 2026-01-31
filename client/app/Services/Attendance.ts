import AxiosInstance from "../Utils/AxiosInstance";

import {
  MARK_BATCH_ATTENDANCE,
  GET_BATCH_ATTENDANCE,
  GET_STUDENT_ATTENDANCE,
  GET_TRAINER_ATTENDANCE_HISTORY,
} from "../Utils/Constants/Attendance";

export const getTrainerAttendanceHistory = async (params: any) => {
  try {
    const response = await AxiosInstance.get(GET_TRAINER_ATTENDANCE_HISTORY, {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message ||
      "Failed to fetch trainer attendance history"
    );
  }
};

export const markBatchAttendance = async (data: any) => {
  try {
    const response = await AxiosInstance.post(MARK_BATCH_ATTENDANCE, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to mark attendance";
  }
};

export const getBatchAttendance = async (params: any) => {
  try {
    const response = await AxiosInstance.get(GET_BATCH_ATTENDANCE, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch attendance";
  }
};

export const getStudentAttendance = async (params: any) => {
  try {
    const response = await AxiosInstance.get(GET_STUDENT_ATTENDANCE, {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch student attendance";
  }
};
