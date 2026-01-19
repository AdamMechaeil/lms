import AxiosInstance from "../Utils/AxiosInstance";

export const MARK_BATCH_ATTENDANCE = "/attendance/markBatchAttendance";
export const GET_BATCH_ATTENDANCE = "/attendance/getBatchAttendance";
export const GET_STUDENT_ATTENDANCE = "/attendance/getStudentAttendance";

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
