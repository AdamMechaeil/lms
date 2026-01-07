import AxiosInstance from "../Utils/AxiosInstance";
import {
  CREATE_COURSE,
  GET_ALL_COURSES,
  GET_COURSE_BY_ID,
  UPDATE_COURSE,
  DELETE_COURSE,
  CREATE_TOPIC,
  GET_ALL_TOPICS,
  GET_TOPIC_BY_ID,
  UPDATE_TOPIC,
  DELETE_TOPIC,
  ASSIGN_TOPICS_TO_COURSE,
  GET_COURSE_TOPICS,
  ASSIGN_COURSE_TO_STUDENT,
} from "../Utils/Constants/CoursesAndTopics";

// Courses
export async function createCourse(data: any) {
  try {
    const response = await AxiosInstance.post(CREATE_COURSE, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to create course";
  }
}

export async function getAllCourses(params?: any) {
  try {
    const response = await AxiosInstance.get(GET_ALL_COURSES, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch courses";
  }
}

export async function getCourseById(id: string) {
  try {
    const response = await AxiosInstance.get(`${GET_COURSE_BY_ID}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch course";
  }
}

export async function updateCourse(id: string, data: any) {
  try {
    const response = await AxiosInstance.put(`${UPDATE_COURSE}/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update course";
  }
}

export async function deleteCourse(id: string) {
  try {
    const response = await AxiosInstance.delete(`${DELETE_COURSE}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to delete course";
  }
}

// Topics
export async function createTopic(data: any) {
  try {
    const response = await AxiosInstance.post(CREATE_TOPIC, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to create topic";
  }
}

export async function getAllTopics(params?: any) {
  try {
    const response = await AxiosInstance.get(GET_ALL_TOPICS, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch topics";
  }
}

export async function getTopicById(id: string) {
  try {
    const response = await AxiosInstance.get(`${GET_TOPIC_BY_ID}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch topic";
  }
}

export async function updateTopic(id: string, data: any) {
  try {
    const response = await AxiosInstance.put(`${UPDATE_TOPIC}/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update topic";
  }
}

export async function deleteTopic(id: string) {
  try {
    const response = await AxiosInstance.delete(`${DELETE_TOPIC}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to delete topic";
  }
}

// Links
export async function assignTopicsToCourse(data: any) {
  try {
    const response = await AxiosInstance.post(ASSIGN_TOPICS_TO_COURSE, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to assign topics to course";
  }
}

export async function getCourseTopics(id: string) {
  try {
    const response = await AxiosInstance.get(`${GET_COURSE_TOPICS}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch course topics";
  }
}

export async function assignCourseToStudent(data: any) {
  try {
    const response = await AxiosInstance.post(ASSIGN_COURSE_TO_STUDENT, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to assign course to student";
  }
}
