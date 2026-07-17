import jwt from 'jsonwebtoken';
import User from '../Model/User.Model.js';

export const authenticateUser = async(req, res, next) => {

    try {
        const token = req.cookies.token || req.headers.authorization.split(" ")[1];;
        console.log("token", token);

        if (!token) {
            return res.status(401).json({ message: "Authentication token missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }

        req.user = user;
        console.log("Authenticated user:", req.user._id);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Authentication failed", error: error.message });
    }

}