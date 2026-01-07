import AxiosInstance from "../Utils/AxiosInstance";
import {
  ADMIN_LOGIN,
  TRAINER_LOGIN,
  CONNECT_GOOGLE,
  STUDENT_LOGIN,
  UPDATE_STUDENT_PASSWORD,
  VERIFY_TOKEN,
  LOGOUT,
} from "../Utils/Constants/Auth";

export async function Adminlogin(token: string) {
  try {
    const response = await AxiosInstance.post(ADMIN_LOGIN, { token });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Login failed";
  }
}

export async function Studentlogin(data: any) {
  try {
    const response = await AxiosInstance.post(STUDENT_LOGIN, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Login failed";
  }
}

export async function Trainerlogin(token: string) {
  try {
    const response = await AxiosInstance.post(TRAINER_LOGIN, { token });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Login failed";
  }
}

export async function ConnectGoogle(code: string, trainerId: string) {
  try {
    const response = await AxiosInstance.post(CONNECT_GOOGLE, {
      code,
      trainerId,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Connection failed";
  }
}

export async function UpdateStudentPassword(data: any) {
  try {
    const response = await AxiosInstance.post(UPDATE_STUDENT_PASSWORD, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update password";
  }
}

export async function VerifyToken() {
  try {
    const response = await AxiosInstance.post(VERIFY_TOKEN);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Token verification failed";
  }
}

export async function Logout() {
  try {
    const response = await AxiosInstance.post(LOGOUT);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Logout failed";
  }
}
