import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// Tao cong viec moi
export const createJob = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request file:", req.file ? "File received" : "No file");

        let {
            roleName,
            companyName,
            techStack,
            location,
            experience,
            salary,
            salaryType,
            jobType,
            postDate,
            category,
            openings,
            overview,
            responsibilities,
            jobCriteria,
            education,
        } = req.body;

        // handle arrays if sent as JSON string
        if (typeof techStack === "string") {
            try {
                techStack = JSON.parse(techStack);
            } catch (e) {
                console.error("Error parsing techStack:", e.message);
                return res.status(400).json({
                    success: false,
                    message: "Invalid techStack format",
                });
            }
        }
        if (typeof responsibilities === "string") {
            try {
                responsibilities = JSON.parse(responsibilities);
            } catch (e) {
                console.error("Error parsing responsibilities:", e.message);
                return res.status(400).json({
                    success: false,
                    message: "Invalid responsibilities format",
                });
            }
        }
        if (typeof jobCriteria === "string") {
            try {
                jobCriteria = JSON.parse(jobCriteria);
            } catch (e) {
                console.error("Error parsing jobCriteria:", e.message);
                return res.status(400).json({
                    success: false,
                    message: "Invalid jobCriteria format",
                });
            }
        }
        if (typeof education === "string") {
            try {
                education = JSON.parse(education);
            } catch (e) {
                console.error("Error parsing education:", e.message);
                return res.status(400).json({
                    success: false,
                    message: "Invalid education format",
                });
            }
        }

        // Validate required fields
        const missingFields = [];
        if (!roleName) missingFields.push("roleName");
        if (!companyName) missingFields.push("companyName");
        if (!location) missingFields.push("location");
        if (!experience) missingFields.push("experience");
        if (!salary) missingFields.push("salary");
        if (!jobType) missingFields.push("jobType");
        if (!category) missingFields.push("category");
        if (!overview) missingFields.push("overview");
        if (!req.file) missingFields.push("companyLogo (file)");

        if (missingFields.length > 0) {
            console.log("Missing fields:", missingFields);
            return res.status(400).json({
                success: false,
                message: "Missing required fields: " + missingFields.join(", "),
            });
        }

        // Validate arrays are not empty
        if (!Array.isArray(techStack) || techStack.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tech Stack không được trống",
            });
        }
        if (!Array.isArray(responsibilities) || responsibilities.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Responsibilities không được trống",
            });
        }
        if (!Array.isArray(jobCriteria) || jobCriteria.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Job Criteria không được trống",
            });
        }
        if (!Array.isArray(education) || education.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Education không được trống",
            });
        }

        let postDateValue;
        if (postDate) {
            if (typeof postDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(postDate)) {
                const [year, month, day] = postDate.split("-");
                postDateValue = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
            } else {
                postDateValue = new Date(postDate);
            }
            if (isNaN(postDateValue.getTime())) {
                postDateValue = new Date();
            }
        } else {
            postDateValue = new Date();
        }

        let companyLogo = "";
        if (req.file) {
            try {
                const uploadRes = await uploadToCloudinary(req.file.buffer, "jobportal/logos", "image", req.file.originalname);
                companyLogo = uploadRes.secure_url;
            } catch (uploadErr) {
                console.error("Cloudinary upload error:", uploadErr);
                return res.status(400).json({
                    success: false,
                    message: "Lỗi tải ảnh lên Cloudinary: " + uploadErr.message,
                });
            }
        }

        const job = new Job({
            companyLogo,
            roleName,
            companyName,
            techStack,
            location,
            experience,
            salary: Number(salary),
            salaryType: salaryType || "/month",
            jobType,
            postDate: postDateValue,
            category,
            openings: Number(openings) || 1,
            overview,
            responsibilities,
            jobCriteria,
            education,
            createdBy: req.user._id,
        });
        await job.save();

        res.status(201).json({
            success: true,
            message: "Công việc đã được tạo thành công",
            job,
        });


    }

    catch (error) {
        console.error("Lỗi khi tạo công việc:", error.message);
        console.error("Stack trace:", error.stack);
        return res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi tạo công việc"
        });
    }
}

// to get all job
export const getAllJobs = async (req, res) => {
    try {
        const {roleName, companyName, location, category, jobType, experience,
            minSalary, maxSalary, search } = req.query;

            const query = {status: "active"};

            //search by roleName, companyName, or techstack
            if (search) {
                query.$or = [
                    { roleName: { $regex: search, $options: "i" } },
                    { companyName: { $regex: search, $options: "i" } },
                    { techStack: { $regex: search, $options: "i" } }
                ];
            }
            if (roleName) query.roleName = { $regex: roleName, $options: "i" };
            if (companyName) query.companyName = { $regex: companyName, $options: "i" };
            if (location) query.location = { $regex: location, $options: "i" };
            if (experience) query.experience = { $regex: experience, $options: "i" };

            if (category) {
                const categories = Array.isArray(category) ? category : category.split(",");
                query.category = { $in: categories.map(cat => new RegExp(cat, "i")) };
            }
            if (jobType) {
                const types = Array.isArray(jobType) ? jobType : jobType.split(",");
                const normalizeTypeToRegex = (type) => {
                    const raw = String(type).trim();
                    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    // Normalize spaces, hyphens, underscores
                    const normalized = escaped.replace(/[-_\s]+/g, "[-_\\s]*");
                    return new RegExp(`^${normalized}$`, "i");
                };
                query.jobType = { $in: types.map(normalizeTypeToRegex) };
            }

            if (minSalary || maxSalary) {
                query.salary = {};
                if (minSalary) query.salary.$gte = Number(minSalary);
                if (maxSalary) query.salary.$lte = Number(maxSalary);
            }

        const jobs = await Job.find(query).sort({ createAt: -1 });
            return res.status(200).json({
                success: true,
                count: jobs.length,
                message: "Danh sách công việc đã được lấy thành công",
                jobs,
            });



        }


        catch (error) {
            console.error("Lỗi khi lấy danh sách công việc:", error);
            return res.status(500).json({
                success: false,
                message: "Server Loi"
            });
        }
}

// get the dashboarh stats for admin
export const getDashboardStats = async (req, res) => {
    try {
        const adminId = req.user._id;
        const totalJobs = await Job.countDocuments();
        const closedJobs = await Job.countDocuments({ status: "closed" });
        const totalApplicationsResult = await Application.aggregate([
            { 
                $lookup: {
                     from: "users",
                     localField: "user",
                     foreignField: "_id", 
                    as: "userRecord"
                    } 
                },
                { $unwind: "$userRecord" },
                {
                    $lookup: {
                        from: "jobs",
                        localField: "job",
                        foreignField: "_id",
                        as: "jobRecord"
                    }
                },
                { $unwind: "$jobRecord" },
                { $count: "count" }
            ]);
        const totalApplications = totalApplicationsResult[0]?.count || 0;
        const companies = await Job.distinct("companyName", { status: "active" });
        const totalCompanies = companies.length;

        return res.status(200).json({
            success: true,
            message: "Thống kê dashboard đã được lấy thành công",
            stats: {
                totalJobs: totalJobs.toLocaleString(),
                closedJobs: closedJobs.toLocaleString(),
                totalApplications: totalApplications.toLocaleString(),
                totalCompanies: totalCompanies.toLocaleString()
            }
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy thống kê dashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Server Loi"
        });
    }
}

// get all job by the ad
export const getJobsByAdmin = async (req, res) => {
    try{
        const jobs = await Job.find().sort({ createdAt: -1 });

        const applicationStats = await Application.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userRecord"
                }
            },
            { $unwind: "$userRecord" },
            {
                $group: {
                    _id: "$job",
                    count: { $sum: 1 },
                }
            }
        ]);

        // map the count for easy lookup
        const countsMap = applicationStats.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});

        const jobsWithStats = jobs.map(job => ({
            ...job._doc,
            applicationCount: countsMap[job._id.toString()] || 0
        }));

        return res.status(200).json({
            success: true,
            message: "Danh sách công việc của admin đã được lấy thành công",
            jobs: jobsWithStats,
        });
    }
        catch (error) {
            console.error("Lỗi khi lấy công việc của admin:", error);
            return res.status(500).json({
                success: false,
                message: "Server Loi"
            });
        }

    }

// get the job by id
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy công việc",
            });
        }

        return res.status(200).json({
            success: true,
            job,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy công việc theo ID:", error);
        return res.status(500).json({
            success: false,
            message: "Server Loi"
        });
    }
}

// Update a job
export const updateJob = async (req, res) => {
    try {
        let {
            roleName,
            companyName,
            techStack,
            location,
            experience,
            salary,
            salaryType,
            jobType,
            postDate,
            category,
            openings,
            overview,
            responsibilities,
            jobCriteria,
            education,
        } = req.body;

        // Handle arrays if sent as JSON strings from frontend FormData
        if (typeof techStack === "string") techStack = JSON.parse(techStack);
        if (typeof responsibilities === "string") responsibilities = JSON.parse(responsibilities);
        if (typeof jobCriteria === "string") jobCriteria = JSON.parse(jobCriteria);
        if (typeof education === "string") education = JSON.parse(education);

        let postDateValue;
        if (postDate) {
            if (typeof postDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(postDate)) {
                const [year, month, day] = postDate.split("-");
                // Use UTC to prevent timezone shifts across days
                postDateValue = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
            } else {
                postDateValue = new Date(postDate);
            }
            if (isNaN(postDateValue.getTime())) {
                postDateValue = new Date();
            }
        } else {
            postDateValue = new Date();
        }

        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // Admins can update any job

        let companyLogo = job.companyLogo;
        if (req.file) {
            const uploadRes = await uploadToCloudinary(req.file.buffer, "jobportal/logos", "image", req.file.originalname);
            companyLogo = uploadRes.secure_url;
        }

        job = await Job.findByIdAndUpdate(
            req.params.id,
            {
                companyLogo,
                roleName,
                companyName,
                techStack,
                location,
                experience,
                salary,
                salaryType,
                jobType,
                postDate: postDateValue,
                category,
                openings,
                overview,
                responsibilities,
                jobCriteria,
                education,
            },
            { returnDocument: 'after', runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Job updated successfully",
            job, // updated
        });
    } catch (error) {
        console.error("Error updating job:", error);
        return res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

// to delete a job
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy công việc",
            });
        }
        await Application.deleteMany({ jobId: req.params.id });
        await job.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Công việc đã được xóa thành công",
        });
    }
    catch (error) {
        console.error("Lỗi khi xóa công việc:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server Loi"
        });
    }
}

// to close a job opening
export const closeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy công việc",
            });
        }

        if (job.status === "closed") {
            return res.status(200).json({
                success: true,
                message: "Công việc đã ở trạng thái đã đóng",
                job,
            });
        }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { status: "closed" },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Công việc đã được đóng thành công",
            job: updatedJob,
        });
    }
    catch (error) {
        console.error("Lỗi khi đóng công việc:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server Loi"
        });
    }
}