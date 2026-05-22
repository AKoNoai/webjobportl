import { uploadToCloudinary } from "./cloudinaryUpload.js";

// uppload files 
export const uploadFiles = async (files, config) => {
    const results = {};

    if(!files) return results;
    for (const key in config ) {
        if (files[key]) {
            const file = files[key][0];

            const uploadResult = await uploadToCloudinary(
                file.buffer, 
                config[key].folder, 
                config[key].type, 
                file.originalname
            );

            results[key] = uploadResult.secure_url;
        }
    }
    return results;
}

//  parse and format questions

export const parseQuestions = (questionsData, type, id, userId) => {
    const parsed = JSON.parse(questionsData);
    return parsed.map((q) => {
        let date = new Date(q.postDate);
        if (isNaN(date)) date = new Date(); // nếu postDate không hợp lệ, sử dụng ngày hiện tại

        return {
            ...(type === "company" && { company: id }),
            ...(type === "role" && { roleId: id }),
            question: q.question,
            answer: q.answer,
            keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [q.keyPoints],
            postDate: date,
            createdBy: userId,
            askedBy: q.companies?.map((c) => ({
                companyName: c.name || "",
                dateAsked: c.date || "",
            })) || [],
        };
    });
}

// replace all question
export const replaceQuestions = async (Model, filter, questions) => {
    await Model.deleteMany(filter);
    await Model.insertMany(questions);
}

//handle error

export const handleError = (res, error) => {
    return res.status(500).json({
        success: false,
        message: error.message
    });
}
