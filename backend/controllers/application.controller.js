import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";

const getRequestUserId = (req) => req.user?._id || req.user?.id;

// user nộp đơn ứng tuyển
export const applyJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = getRequestUserId(req);

        if (!jobId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp thông tin ứng tuyển hợp lệ",
            });
        }

        // kiểm tra xem công việc có tồn tại không
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Công việc không tồn tại",
            });
        }

        // check if user already applied
        const existingApplication = await Application.findOne({ job: jobId, user: userId });
        if (existingApplication) {
            return res.status(200).json({
                success: true,
                alreadyApplied: true,
                message: "You have already applied for this job",
            });
        }

        const newapplication = new Application({
            job: jobId,
            user: userId,
        });
        await newapplication.save();
        res.status(201).json({
            success: true,
            message: "Bạn đã nộp đơn thành công",
        });
    }
    catch (error) {
        console.error("Error applying for job:", error);
        res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi nộp đơn, vui lòng thử lại sau",
        });
    }
}


// get all applications for a job (admin panel)
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Công việc không tồn tại",
            });
        }

        const applications = await Application.find({ job: jobId }).populate({
            path: "user",
            select: "name email phone resume",
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            jobName: job.roleName,
            applications: applications
             .filter(app => app.user) // lọc ra các ứng dụng có user đã bị xóa
             .map(app => ({ 
                applicationId: app._id,
                ...app.user._doc, // thông tin người dùng
                appliedDate: app.createdAt, // thời gian nộp đơn
                resume: app.user.resume || "" // link hồ sơ
             })),
        });
    }
    catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({
            success: false,
            message: "Server loi",
        });
    }
}

// get all jobs applied by user
export const getUserApplications = async (req, res) => {
    try {
        const userId = req.user._id;
        const applications = await Application.find({ user: userId }).populate("job").sort({ createdAt: -1 });

        const validApplications = applications.filter(app => app.job !== null); // lọc ra các ứng dụng có job đã bị xóa
        return res.status(200).json({
            success: true,
            applications: validApplications

        });
    }
    catch (error) {
        console.error("Error fetching user applications:", error);
        res.status(500).json({
            success: false,
            message: "Server loi",
        });
    }
}