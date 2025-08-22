import { verifyToken } from "../Utils/tokens.utils.js";
import BlackListedTokens from "../Models/black-listed-tokens.model.js";
import User from "../Models/user.model.js";

export const authenticationMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization']; 
    if (!authHeader) return res.status(400).json({ message: "Please provide an access token" });

    const [prefix, token] = authHeader.split(' ');
    if (prefix !== 'Bearer' || !token) return res.status(401).json({ message: "Invalid token format" });

    const decodedData = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    if (!decodedData.jti) return res.status(401).json({ message: "Invalid Token" });

    const blackListedToken = await BlackListedTokens.findOne({ tokenId: decodedData.jti });
    if (blackListedToken) return res.status(401).json({ message: "Token is blacklisted" });

    const user = await User.findById(decodedData?._id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    req.loggedInUser = { ...user, tokenId: decodedData.jti, expirationDate: decodedData.exp };

    next();
};
