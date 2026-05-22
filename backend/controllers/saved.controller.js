import User from "../models/user.model.js";


// toggle save cong viec
export const toggleSaveJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Nguoi dung khong tim thay"
            });
        }   
        const isSaved = user.savedJobs.includes(jobId);
        if (isSaved) {
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        } else {
            user.savedJobs.push(jobId);
        }
        await user.save();
        return res.status(200).json({
            success: true,
            message: isSaved ? "Cong viec da duoc bo luu" : "Cong viec da duoc luu",
            savedJobs: user.savedJobs
        });
       
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// toggle save company
export const toggleSaveQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const {type} = req.query; // type can be "company" or "role"
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Nguoi dung khong tim thay"
            });
        }
        let isSaved;
        let message;

        if (type == 'role') {
            isSaved = user.savedRoleQuestions.includes(questionId);
            if (isSaved) {
                user.savedRoleQuestions = user.savedRoleQuestions.filter(id => id.toString() !== questionId);
                message = "Cau hoi da duoc bo luu";
            } else {
                user.savedRoleQuestions.push(questionId);
                message = "Cau hoi da duoc luu";
            }
        } else {
            //default to interview question
            isSaved = user.savedInterviewQuestions.includes(questionId);
            if (isSaved) {
                user.savedInterviewQuestions = user.savedInterviewQuestions.filter(id => id.toString() !== questionId);
                message = "Cau hoi da duoc bo luu";
            } else {
                user.savedInterviewQuestions.push(questionId);
                message = "Cau hoi da duoc luu";
            }
        }
        await user.save();
        return res.status(200).json({
            success: true,
            message,
            savedInterviewQuestions: user.savedInterviewQuestions,
            savedRoleQuestions: user.savedRoleQuestions
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//to get all saved items
export const getSavedItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .populate("savedJobs")
            .populate({
                path: "savedInterviewQuestions",
                populate: { path: "company"}
            })
            .populate({
                path: "savedRoleQuestions",
                populate: { path: "roleId"}
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Nguoi dung khong tim thay"
            });
        }
        res.status(200).json({
            success: true,
            savedJobs: user.savedJobs,
            savedInterviewQuestions: user.savedInterviewQuestions,
            savedRoleQuestions: user.savedRoleQuestions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}



//