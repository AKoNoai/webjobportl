import express from "express";
import { getCompanies, addCompany, deleteCompany } from "../controllers/company.controller.js";
import { authMiddleware, authorize } from "../middlewares/authMiddlewares.js";
import { upload} from "../middlewares/uploadMiddlewares.js";

const companyRouter = express.Router();

companyRouter.get('/', getCompanies);
companyRouter.post('/', authMiddleware, authorize("admin"), upload.single("logo"), addCompany);

companyRouter.delete('/:id', authMiddleware, authorize("admin"), deleteCompany);

export default companyRouter;