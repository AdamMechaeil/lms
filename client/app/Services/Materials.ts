import AxiosInstance from "../Utils/AxiosInstance";
import {
  CREATE_MATERIAL,
  GET_ALL_MATERIALS,
  GET_MATERIAL_BY_ID,
  UPDATE_MATERIAL,
  DELETE_MATERIAL,
  ASSIGN_MATERIALS_TO_BATCH,
  GET_MATERIALS_BY_BATCH,
} from "../Utils/Constants/Materials";

export async function createMaterial(data: FormData) {
  try {
    const response = await AxiosInstance.post(CREATE_MATERIAL, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to create material";
  }
}

export async function getAllMaterials(params?: any) {
  try {
    const response = await AxiosInstance.get(GET_ALL_MATERIALS, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch materials";
  }
}

export async function getMaterialById(id: string) {
  try {
    const response = await AxiosInstance.get(`${GET_MATERIAL_BY_ID}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch material";
  }
}

export async function updateMaterial(id: string, data: any) {
  try {
    // Note: If update involves file upload, data should be FormData and content-type adjusted if necessary.
    // Assuming JSON update for now unless specified otherwise, but if it has file upload it needs multipart.
    // The server route uses upload.array("files"), so it might support file updates.
    // If 'data' is FormData, axios handles it.
    const response = await AxiosInstance.put(`${UPDATE_MATERIAL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update material";
  }
}

export async function deleteMaterial(id: string) {
  try {
    const response = await AxiosInstance.delete(`${DELETE_MATERIAL}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to delete material";
  }
}

export async function assignMaterialsToBatch(data: any) {
  try {
    const response = await AxiosInstance.post(ASSIGN_MATERIALS_TO_BATCH, data);
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data?.message || "Failed to assign materials to batch"
    );
  }
}

export async function getMaterialsByBatch(batchId: string) {
  try {
    const response = await AxiosInstance.get(
      `${GET_MATERIALS_BY_BATCH}/${batchId}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch batch materials";
  }
}
