import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {  sendForgotPasswordEmail, sendVerificationEmail } from "../utils/emailService.js";
import jwt from "jsonwebtoken";


// den dang ky 1 nguoi dung moi
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({
            success: false,
            message: "Người dùng đã tồn tại",
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "user";

    // để tạo mã OTP 6 chữ số
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOTPExpire = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        verificationOTP,
        verificationOTPExpire,
    });

    // để gửi email xác minh
    try {
        await sendVerificationEmail(email, name, verificationOTP);
    } catch (error) {
        console.error("Lỗi gửi email xác minh:", error);
    }
    
    res.status(201).json({
        success: true,
        message: "Tài khoản đã được tạo thành công! Vui lòng kiểm tra email để lấy mã xác minh gồm 6 chữ số.",
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: false,
        }
    })

}
    catch (error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// gửi dang nhập nguoi dung
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc mật khẩu không hợp lệ",
            });
        }
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản chưa được xác minh. Vui lòng kiểm tra email để lấy mã xác minh gồm 6 chữ số.",
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc mật khẩu không hợp lệ",
            });
        }


        // để tạo mã thông báo
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    }
    catch (error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// để xác minh email
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email và mã OTP là bắt buộc",
            });
        }


        const user = await User.findOne({ 
            email,
            verificationOTP: otp,
            verificationOTPExpire: { $gt: Date.now() }, // kiểm tra OTP còn hiệu lực
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Mã OTP không hợp lệ hoặc đã hết hạn",
            });
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Xác minh email thành công! Bạn có thể đăng nhập ngay bây giờ.",
        });
    }

    catch (error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// nếu người dùng quên mật khẩu
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email là bắt buộc",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng với email này",
            });
        }
        
        const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const resetOTPExpire = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút

        user.resetPasswordOTP = resetOTP;
        user.resetPasswordOTPExpire = resetOTPExpire;
        await user.save();

        try {
            await sendForgotPasswordEmail(email, user.name, resetOTP);
        } catch (error) {
            console.error("Lỗi gửi email khôi phục mật khẩu:", error);
        }

        res.status(200).json({
            success: true,
            message: "Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.",
        });
    }
    catch (error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// để đặt lại mật khẩu
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, mã OTP và mật khẩu mới là bắt buộc",
            });
        }

        const user = await User.findOne({ 
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpire: { $gt: Date.now() }, // kiểm tra OTP còn hiệu lực
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Mã OTP không hợp lệ hoặc đã hết hạn",
            });
        }

        // để cập nhật mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay bây giờ.",
        });
    }
    catch (error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }   
}