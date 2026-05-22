import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { getProfile, getResume, updateProfile } from "../controllers/user.controller.js";
import { upload } from "../middlewares/uploadMiddlewares.js";

const userRouter = express.Router();

userRouter.get('/profile', authMiddleware, getProfile);
userRouter.get('/resume/:id', getResume);

userRouter.put('/profile', authMiddleware, upload.single('resume'), updateProfile);

export default userRouter;