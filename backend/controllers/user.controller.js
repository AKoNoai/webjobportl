import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js"; // file PDF hay Word lưu trong Cloudinary
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// lấy thông tin người dùng
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại",
            });
        }
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// cập nhật thông tin người dùng
export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;

        if (typeof req.body.resume === "string" && req.body.resume.trim()) {
            const resumeUrl = req.body.resume.trim();
            updateData.resume = resumeUrl;

            const resumeType = resumeUrl.includes('/raw') ? "raw" : "image";
            const publicId = getPublicIdFromUrl(resumeUrl, resumeType);
            if (publicId) {
                updateData.resumePublicId = publicId;
            }
        }

        // Cập nhật sơ yếu lý lịch cho người tìm việc
        if (req.file && req.user.role === "user") {
            const originalName = req.file.originalname;
            const extension = originalName.split(".").pop().toLowerCase();

            // Tên tệp đã được làm sạch nhưng vẫn giữ nguyên phần mở rộng cho các tệp thô.
            const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
            const sanitizedBase = nameWithoutExt.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9\-_]/g, "");
            const sanitizedFileName = `${sanitizedBase}.${extension}`;

            // Xác định loại tài nguyên: hình ảnh nên được định dạng là 'image', tài liệu/pdf thường an toàn hơn nếu được định dạng là 'raw' để gửi đi.
            const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
            const resourceType = isImage ? "image" : "raw";

            const uploadResult = await uploadToCloudinary(req.file.buffer, 
                "job/resumes", resourceType, sanitizedFileName
            );
            if (uploadResult) {
                updateData.resume = uploadResult.secure_url;
                updateData.resumePublicId = uploadResult.public_id;
            }
        }

        await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        const user = await User.findById(req.user.id).select("-password");

        return res.status(200).json({
            success: true,
            message: "Cập nhật hồ sơ thành công",
            user,
        });
    }

    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// Hàm hỗ trợ để trích xuất ID công khai từ URL của Cloudinary
const getPublicIdFromUrl = (url, resourceType) => {
    try {
        const parts = url.split("/");
        const uploadIndex = parts.findIndex((part) => part === "upload");
        if (uploadIndex === -1) return null;
        const pathAfterVersion = parts.slice(uploadIndex + 2).join("/"); // Bỏ qua 'upload' và 'v1234567890'
        if (resourceType === "raw") return pathAfterVersion; // Đối với tài nguyên thô, giữ nguyên phần mở rộng

        return pathAfterVersion.substring(0, pathAfterVersion.lastIndexOf('.')) || pathAfterVersion; // Loại bỏ phần mở rộng cho hình ảnh
    }
    catch (e) {
        return null;
    }
}

// to get user resume
export const getResume = async (req, res) => {
    try {
        const userId = req.params.id || req.user?.id;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu mã người dùng",
            });
        }

        const user = await User.findById(userId);
        if (!user || !user.resume) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hồ sơ của bạn",
            });
        }
        const resoureceType = user.resume.includes('/raw') ? "raw" : "image";
        const publicId = user.resumePublicId || getPublicIdFromUrl(user.resume, resoureceType);
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "Không tìm thấy hồ sơ của bạn",
            });
        }
        if (resoureceType === "raw") {
            const fileName = publicId.split("/").pop() || "resume.pdf";
            const format = fileName.split(".") ? fileName.split(".").pop().toLowerCase() : "pdf";

            const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
                resource_type: "raw",
                type: "upload",
                secure: true,
                expires_at: Math.floor(Date.now() / 1000) + 300, // 5 phút
            });
            return res.redirect(signedUrl);
        }

        // với hình ảnh
        const signedUrl = cloudinary.url(publicId, {
            resource_type: "image",
            type: "upload",
            secure: true,
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 300,
    });

    return res.redirect(signedUrl);

    }

    catch (error) {
        console.error("Lỗi khi lấy hồ sơ:", error.message);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi lấy hồ sơ của bạn",
        });
    }
}
