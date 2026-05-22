import InterviewCompany from "../models/interviewCompany.model.js";
import InterviewQuestion from "../models/interviewQuestion.model.js";
import interviewRole from "../models/interviewRole.model.js";
import roleQuestion from "../models/roleQuestion.model.js";
import { handleError, parseQuestions, uploadFiles, replaceQuestions } from "../utils/helpers.js";

//INTERVIEW QUESTION

//add to a company interview question
export const addInterviewCompany = async (req, res) => {
    try{
        const { companyName, questionsCount, questionsData, questionCount, questionData } = req.body;
        const normalizedQuestionsCount = questionsCount || questionCount;
        const normalizedQuestionsData = questionsData || questionData;

        if (!companyName || !normalizedQuestionsCount) {
            return res.status(400).json({ 
                message: "Thiếu trường bắt buộc"
            });
        }
        const exists = await InterviewCompany.findOne({ companyName });
        if (exists) {
            return res.status(400).json({ 
                message: "Công ty đã tồn tại"
            });
        }
        const uploads = await uploadFiles(req.files, {
            logoFile: { folder: "jobportal/logos", type: "image" },
            csvFile: { folder: "jobportal/csv", type: "raw" }
        });

        const company = await InterviewCompany.create({
            companyName,
            logo: uploads.logoFile || "",
            questionsCount: normalizedQuestionsCount,
            csvFileUrl: uploads.csvFile || "",
            createdBy: req.user.id
        });

        if (normalizedQuestionsData) {
            const formatted = parseQuestions(
                normalizedQuestionsData,
                "company",
                company._id,
                company.createdBy
            );
            await InterviewQuestion.insertMany(formatted);
        }
        return res.status(201).json({ 
            success: true,
            company
         });
            

    }
    catch (error) {
        handleError(res, error);
    }
}

// get companies containing ques

export const getInterviewCompanies = async (req, res) => {
    try {
        const companies = await InterviewCompany.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            companies
        });
    }
    catch (error) {
        handleError(res, error);
    }
}


// now to get questions of that company
export const getInterviewQuestionsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const [company, questions] = await Promise.all([
            InterviewCompany.findById(companyId),
            InterviewQuestion.find({ company: companyId }).sort({ createdAt: -1 })
        ]);
        res.status(200).json({
            success: true,
            company,
            questions
        });
    }
    catch (error) {
        handleError(res, error);
    }
}

// Update Company
export const updateInterviewCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { companyName, questionsCount, questionsData } = req.body;

        const company = await InterviewCompany.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        if (companyName) company.companyName = companyName;
        if (questionsCount) company.questionsCount = questionsCount;

        const uploads = await uploadFiles(req.files, {
            logoFile: { folder: "jobportal/logos", type: "image" },
            csvFile: { folder: "jobportal/csv", type: "raw" }
        });


        // updated logo or csv file
        if (uploads.logoFile) company.logo = uploads.logoFile;
        if (uploads.csvFile) company.csvFileUrl = uploads.csvFile;

        await company.save(); //update

        if (questionsData) {
            const formatted = parseQuestions(
                questionsData,
                "company",
                company._id,
                req.user.id
            );

            await replaceQuestions(
                InterviewQuestion,
                { company: companyId },
                formatted
            );
        }

        res.status(200).json({ success: true, company });

    } catch (err) {
        handleError(res, err);
    }
};

// to  delete a company
export const deleteInterviewCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        await InterviewCompany.findByIdAndDelete(companyId);
        await InterviewQuestion.deleteMany({ company: companyId });
        res.status(200).json({ 
            success: true, 
            message: "Cong ty da duoc xoa" 
        });
    }
    catch (error) {
        handleError(res, error);
    }
}

// ROLE QUESTIONS
// to add a role
export const addInterviewRole = async (req, res) => {
    try {
        const { roleName, questionsCount, questionsData, questionCount, questionData } = req.body;
        const normalizedQuestionsCount = questionsCount || questionCount;
        const normalizedQuestionsData = questionsData || questionData;

        if (!roleName || !normalizedQuestionsCount) {
            return res.status(400).json({ 
                message: "Thiếu trường bắt buộc"
            });
        }
        const exists = await interviewRole.findOne({ roleName });
        if (exists) {
            return res.status(400).json({ 
                message: "Vai trò đã tồn tại"
            });
        }
        const upload = await uploadFiles(req.files, {
            imageFile: { folder: "jobportal/roles", type: "image" },
            csvFile: { folder: "jobportal/csv", type: "raw" }
        });
        const role = await interviewRole.create({
            roleName,
            image: upload.imageFile || "",
            questionsCount: normalizedQuestionsCount,
            csvFileUrl: upload.csvFile || "",
            createdBy: req.user.id
        });
        if(normalizedQuestionsData) {
            const formatted = parseQuestions(
                normalizedQuestionsData,
                "role",
                role._id,
                role.createdBy
            );
            await roleQuestion.insertMany(formatted);
        }
        return res.status(201).json({ 
            success: true,
            role
         });
    }
    catch (error) {
        handleError(res, error);
    }
}

// get roles
export const getInterviewRoles = async (req, res) => {
    try {
        const roles = await interviewRole.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            roles
        });
    }
    catch (error) {
        handleError(res, error);
    }
}


// to fetch questions of role
export const getQuestionsByRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const [role, questions] = await Promise.all([
            interviewRole.findById(roleId),
            roleQuestion.find({ roleId }).sort({ createdAt: -1 })
        ]);
        res.status(200).json({
            success: true,
            role,
            questions
        });
    }
    catch (error) {
        handleError(res, error);
    }
}

// Update Role
export const updateInterviewRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { roleName, questionsCount, questionsData } = req.body;

        const role = await interviewRole.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        if (roleName) role.roleName = roleName;
        if (questionsCount) role.questionsCount = questionsCount;

        const uploads = await uploadFiles(req.files, {
            imageFile: { folder: "jobportal/roles", type: "image" },
            csvFile: { folder: "jobportal/csv", type: "raw" }
        });

        if (uploads.imageFile) role.image = uploads.imageFile;
        if (uploads.csvFile) role.csvFileUrl = uploads.csvFile;

        await role.save();

        if (questionsData) {
            const formatted = parseQuestions(
                questionsData,
                "role",
                role._id,
                req.user.id
            );

            await replaceQuestions(
                roleQuestion,
                { roleId },
                formatted
            );
        }

        res.status(200).json({ success: true, role });

    } catch (err) {
        handleError(res, err);
    }
};

//delete a role
export const deleteInterviewRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        await interviewRole.findByIdAndDelete(roleId);
        await roleQuestion.deleteMany({
            roleId
        });
        res.status(200).json({
            success: true,
            message: "Vai trò đã được xóa"
        });
    }
    catch (error) {
        handleError(res, error);
    }
}