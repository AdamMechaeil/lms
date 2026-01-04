import { Request, Response } from "express";
import Course from "../models/courses.js";
import Topic from "../models/topic.js";
import CourseTopicLinkModel from "../models/coursetopiclink.js";
import mongoose from "mongoose";
import CourseStudentLinkModel from "../models/coursestudentlink.js";

/////// Courses Controllers //////
export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed To Create Course" });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const matchStage: any = {};
    if (type) matchStage.type = type;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const facetStage = {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNumber },
          {
            $lookup: {
              from: "coursetopiclinks",
              localField: "_id",
              foreignField: "course",
              as: "links",
            },
          },
          {
            $lookup: {
              from: "topics",
              localField: "links.topic",
              foreignField: "_id",
              as: "topics",
            },
          },
          {
            $addFields: {
              totalDuration: { $sum: "$topics.duration" },
            },
          },
          {
            $project: {
              links: 0,
              __v: 0,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    };

    const pipeline: any[] = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    pipeline.push(facetStage);

    const result = await Course.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

    res.status(200).json({
      data,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    console.error("Error getting all courses:", error);
    res.status(500).json({ error: "Failed To Get Courses" });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "coursetopiclinks",
          localField: "_id",
          foreignField: "course",
          as: "links",
        },
      },
      {
        $lookup: {
          from: "topics",
          localField: "links.topic",
          foreignField: "_id",
          as: "topics",
        },
      },
      {
        $addFields: {
          totalDuration: { $sum: "$topics.duration" },
        },
      },
      {
        $project: {
          links: 0,
          __v: 0,
        },
      },
    ]);

    if (!course || course.length === 0) {
      res.status(404).json({ error: "Course Not Found" });
      return;
    }

    res.status(200).json(course[0]);
  } catch (error) {
    console.error("Error getting course by id:", error);
    res.status(500).json({ error: "Failed To Get Course" });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed To Update Course" });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed To Delete Course" });
  }
};

//// Topics Controllers //////

export const createTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).send("Topic created successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed To Create Topic" });
  }
};

export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ error: "Failed To Get Topics" });
  }
};

export const getTopicById = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findById(req.params.id);
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: "Failed To Get Topic" });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).send("Topic updated successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed To Update Topic" });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    res.status(200).send("Topic deleted successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed To Delete Topic" });
  }
};

////// Courses and Topics Link Controllers //////

export const assignTopicsToCourse = async (req: Request, res: Response) => {
  try {
    const { courseId, topicIds } = req.body;

    if (!courseId || !topicIds || !Array.isArray(topicIds)) {
      res.status(400).json({
        error: "Invalid input. courseId and topicIds array are required.",
      });
      return;
    }

    const linksToCreate = topicIds.map((topicId) => ({
      course: courseId,
      topic: topicId,
    }));

    await CourseTopicLinkModel.insertMany(linksToCreate);

    res.status(201).send("Topics assigned to course successfully");
  } catch (error) {
    console.error("Error assigning topics to course:", error);
    res.status(500).json({ error: "Failed To Create Course Topic Links" });
  }
};

export const assignCourseToStudent = async (req: Request, res: Response) => {
  try {
    const { courseId, studentId } = req.body;

    if (!courseId || !studentId) {
      res.status(400).json({
        error: "Invalid input. courseId and studentId are required.",
      });
      return;
    }

    await CourseStudentLinkModel.create({
      course: courseId,
      student: studentId,
    });

    res.status(201).send("Course assigned to student successfully");
  } catch (error) {
    console.error("Error assigning course to student:", error);
    res.status(500).json({ error: "Failed To Assign Course To Student" });
  }
};

export const getCourseTopics = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;

    if (!courseId) {
      res.status(400).json({ error: "Course ID is required" });
      return;
    }

    const courseTopics = await Course.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $lookup: {
          from: "coursetopiclinks",
          localField: "_id",
          foreignField: "course",
          as: "links",
        },
      },
      {
        $lookup: {
          from: "topics",
          localField: "links.topic",
          foreignField: "_id",
          as: "topics",
        },
      },
      {
        $project: {
          links: 0,
          __v: 0,
        },
      },
    ]);

    if (!courseTopics || courseTopics.length === 0) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    res.status(200).json(courseTopics[0]);
  } catch (error) {
    console.error("Error getting course topics:", error);
    res.status(500).json({ error: "Failed To Get Course Topics" });
  }
};
