import express from "express";
import cors from "cors";
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import cloudinary from "./config/cloudinary.js";

import authRouter from "./routers/auth.router.js";
import userRouter from "./routers/user.routers.js";
import companyRouter from "./routers/company.routers.js";
import jobRouter from "./routers/job.routers.js";
import applicationRouter from "./routers/application.routers.js";
import interviewRouter from "./routers/interview.routers.js";
import savedRouter from "./routers/saved.routers.js";
import inquiryRouter from "./routers/inquiry.routers.js";


const PORT = 5000;
const app = express();



//DB
connectDB();

//Middleware
app.use(express.json());
app.use(cors(
  {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
  }
));



app.use('/uploads', express.static("uploads")); // để phục vụ các file tĩnh từ thư mục uploads



//Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/application", applicationRouter);
app.use("/api/saved", savedRouter);
app.use("/api/inquiry",inquiryRouter);


app.get("/", (req, res) => {
  res.send("API Working!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});