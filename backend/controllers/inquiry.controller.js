import Inquiry from "../models/inquiry.model.js";
import { sendAdminInquiryEmail } from "../utils/emailService.js";

// to submit an iquery
export const submitInquiry = async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;
        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin"
            });
        }

        const inquiry = await Inquiry.create({
            fullName,
            email,
            phone,
            subject,
            message
        });

        try {
            await sendAdminInquiryEmail({ fullName, email, phone, subject, message });
        } catch (emailError) {
            console.error("Lỗi khi gửi email thông báo:", emailError);
        }
        res.status(201).json({
            success: true,
            inquiry,
            message: "Yêu cầu của bạn đã được gửi thành công"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}