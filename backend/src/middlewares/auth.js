import jwt from "jsonwebtoken";

// Middleware to authenticate JWT token
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized", error: error.message });
    }
}

// Role-based middleware factory
function authorizeRole(role) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || user.role !== role) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        next();
    };
}

const is_user = authorizeRole("USER");
const is_admin = authorizeRole("ADMIN");

export { authenticate, is_user, is_admin };
