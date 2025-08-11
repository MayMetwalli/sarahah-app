import BlackListedTokens from "../Models/black-listed-tokens.model.js"
import User from "../Models/user.model.js"
import { verifyToken } from "../Utils/tokens.utils.js"

export const authenticationMiddleware = async (req,res,next)=>{
            const {accesstoken } = req.headers
            if(!accesstoken) return res.status(400).json({message:"Please provice an access token"})
 
            const decodedData = verifyToken(accesstoken , process.env.JWT_ACCESS_SECRET)
            if(!decodedData.jti){
                return res.status(401).json({message:"Invalid Token"})
            }

            const blackListedToken = await BlackListedTokens.findOne({tokenId:decodedData.jti})
                if(blackListedToken){
                    return res.status(401).json({message:"Token is blacklisted"})
            
                }
            
            const user = await User.findById(decodedData?._id).lean()
            if(!user){
                return res.status(404).json({message:"User not found"})
            }

            // req.loggedInUser = {user, token:{tokenId:decodedData.jti, expirationDate:decodedData.exp}}
            req.loggedInUser = {...user, tokenId:decodedData.jti, expirationDate:decodedData.exp}

            next()
        }
        
