import express from "express";
import {
  assignCourseToStudent,
  assignTopicsToCourse,
  createCourse,
  createTopic,
  deleteCourse,
  deleteTopic,
  getAllCourses,
  getAllTopics,
  getCourseById,
  getCourseTopics,
  getTopicById,
  updateCourse,
  updateTopic,
} from "../controllers/coursesandtopics.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";

const coursesandtopicsRouter = express.Router();
///// courses /////
coursesandtopicsRouter.post("/createCourse", adminAuthenticator, createCourse);
coursesandtopicsRouter.get("/getAllCourses", adminAuthenticator, getAllCourses);
coursesandtopicsRouter.get(
  "/getCourseById/:id",
  adminAuthenticator,
  getCourseById
);
coursesandtopicsRouter.put(
  "/updateCourse/:id",
  adminAuthenticator,
  updateCourse
);
coursesandtopicsRouter.delete(
  "/deleteCourse/:id",
  adminAuthenticator,
  deleteCourse
);

///// topics /////

coursesandtopicsRouter.post("/createTopic", adminAuthenticator, createTopic);
coursesandtopicsRouter.get("/getAllTopics", adminAuthenticator, getAllTopics);
coursesandtopicsRouter.get(
  "/getTopicById/:id",
  adminAuthenticator,
  getTopicById
);
coursesandtopicsRouter.put("/updateTopic/:id", adminAuthenticator, updateTopic);
coursesandtopicsRouter.delete(
  "/deleteTopic/:id",
  adminAuthenticator,
  deleteTopic
);

///// courses and topics links /////

coursesandtopicsRouter.post(
  "/assignTopicsToCourse",
  adminAuthenticator,
  assignTopicsToCourse
);
coursesandtopicsRouter.get(
  "/getCourseTopics/:id",
  adminAuthenticator,
  getCourseTopics
);

coursesandtopicsRouter.post(
  "/assignCourseToStudent",
  adminAuthenticator,
  assignCourseToStudent
);

export default coursesandtopicsRouter;
