import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Không tìm thấy token, vui lòng đăng nhập",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // ensure both `id` and `_id` are available for downstream code
        if (decoded && decoded.id) {
            decoded._id = decoded.id;
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ, vui lòng đăng nhập lại",
        });
    }
}

// to authorize 
export const authorize = (...roles) => {
    return (req, res, next) => {
        //!roles.user || !roles.includes(req.user.role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập vào tài nguyên này",
            });
        }
        next();
    };
};