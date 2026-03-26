import express from "express";
import { addEmployee, getEmployees, updateEmployee, deleteEmployee } from "../controllers/employee.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";

const employeeRouter = express.Router();

employeeRouter.use(adminAuthenticator); // Only Admins can manage employees

employeeRouter.post("/add", addEmployee);
employeeRouter.get("/all", getEmployees);
employeeRouter.put("/:id", updateEmployee);
employeeRouter.delete("/:id", deleteEmployee);

export default employeeRouter;
