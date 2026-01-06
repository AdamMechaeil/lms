import AxiosInstance from "../Utils/AxiosInstance";
import {
  ADMIN_LOGIN,
  TRAINER_LOGIN,
  CONNECT_GOOGLE,
} from "../Utils/Constants/Auth";

export async function Adminlogin(token: string) {
  try {
    const response = await AxiosInstance.post(ADMIN_LOGIN, { token });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Login failed";
  }
}

export function Studentlogin() {
  try {
  } catch (error) {}
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

export function UpdateStudentPassword() {
  try {
  } catch (error) {}
}

export function VerifyToken() {
  try {
  } catch (error) {}
}

export function Logout() {
  try {
  } catch (error) {}
}
