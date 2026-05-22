import Company from "../models/company.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";


// lấy danh sách công ty
export const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json({
            success: true,
            companies
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// thêm công ty admin
export const addCompany = async (req, res) => {
    try {
        const { website } = req.body;
        if (!website) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ thông tin",
            });

        }
        let logoUrl = "";
        if (req.file) {
            const uploadPath = await uploadToCloudinary(req.file.buffer,
                "jobportal/logos",
                "image",
                req.file.originalname
            );
            logoUrl = uploadPath.secure_url;
        }
        const company = await Company.create({
            logo: logoUrl,
            website,
            createdBy: req.user._id
        });
        res.status(201).json({
            success: true,
            message: "Công ty đã được tạo thành công",
            company,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,

            message: error.message,
        });
    }
}

// xóa công ty
export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Công ty không tồn tại",
            });
        }
        await company.deleteOne();
        res.status(200).json({
            success: true,
            message: "Công ty đã được xóa thành công",
        });
    }

    catch (error) {
        res.status(500).json({
            success: false,     
            message: error.message,
        });
    }
}