import mongoose from "mongoose";
import { compareSync, hashSync } from "bcrypt"
import User from "../../../Models/user.model.js"
import { encrypt } from "../../../Utils/encryption.utils.js"
import { decrypt } from "../../../Utils/encryption.utils.js"
import { sendEmail } from "../../../Utils/send.email.utils.js"
import {customAlphabet} from "nanoid"
import { emitter } from "../../../Utils/send.email.utils.js"
import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from "uuid"
import { generateToken, verifyToken } from "../../../Utils/tokens.utils.js"
import BlackListedTokens from "../../../Models/black-listed-tokens.model.js"
import Message from "../../../Models/messages.model.js";
const uniqueString = customAlphabet('fsjfwi4uh5o4nt', 5)

export const SignUpService = async (req, res) =>{
    try{
        const {firstName, lastName, email, password, age, phoneNumber} = req.body
        const isEmailExist = await User.findOne({
            $or: [
            {email},
            {firstName, lastName}
        ]})
        if(isEmailExist){
            return res.status(400).json({message:"User already exists"})
        }
        // const  user = await User.create({firstName, lastName, email, password, age} )
        const encryptedPhoneNumber = encrypt(phoneNumber)

        const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS)

        const otp = uniqueString()

        const userInstance = new User({
            firstName , 
            lastName, 
            email, 
            password:hashedPassword, 
            age, 
            phoneNumber:encryptedPhoneNumber, 
            otps:{confirmation:hashSync(otp, +process.env.SALT_ROUNDS)}
        })
        await userInstance.save()
        userInstance.otps = {
    confirmation: hashSync(otp, +process.env.SALT_ROUNDS),
    confirmationExpires: Date.now() + (2 * 60 * 1000), 
    failedAttempts: 0,
    banUntil: null
};



        // await sendEmail({
        //     to:email,
        //     subject:'Confirmation Email',
        //     content: `<h1>Confirm your Email</h1> <br> <h3>Your confirmation OTP is : ${otp}</h3>`
        // })

        emitter.emit('sendEmail', {
            to:email,
            subject:'Confirmation Email',
            content: `<h1>Confirm your Email</h1> <br> <h3>Your confirmation OTP is : ${otp}</h3>`
        })

        return res.status(201).json({message:"user created successfully", userInstance})
    } catch(error){
        return res.status(500).json({message:"Internal server error", error: error.message})
    }
}


export const ConfirmEmailService = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, isConfirmed: false });
    if (!user) {
        return res.status(400).json({ message: "User not found or already confirmed" });
    }

    if (user.otps?.banUntil && Date.now() < user.otps.banUntil) {
        return res.status(403).json({ message: "Too many failed attempts. Try again later." });
    }

    if (user.otps?.banUntil && Date.now() >= user.otps.banUntil) {
        user.otps.failedAttempts = 0;
        user.otps.banUntil = null;
    }

    if (!user.otps?.confirmationExpires || Date.now() > user.otps.confirmationExpires) {
        return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    const isOtpMatch = compareSync(otp, user.otps?.confirmation);
    if (!isOtpMatch) {
        user.otps.failedAttempts = (user.otps.failedAttempts || 0) + 1;

        if (user.otps.failedAttempts >= 5) {
            user.otps.banUntil = Date.now() + (5 * 60 * 1000); 
        }

        await user.save();
        return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isConfirmed = true;
    user.otps = null;

    await user.save();
    return res.status(200).json({ message: "Email confirmed successfully" });
};



export const SignInService = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // const isPasswordMatch = compareSync(password, user.password)
        // if(!isPasswordMatch){
        //     return res.status(404).json({message:"Invalid password"})
        // }

        const isPasswordMatch = compareSync(password, user.password)
        if(!isPasswordMatch){
            return res.status(404).json({message:"Invalid password"})
        }

        const accesstoken = generateToken({
            _id:user._id, email:user.email
        }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN),
            jwtid:uuidv4()
        })

        const refreshtoken = generateToken({
            _id:user._id, email:user.email
        }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            jwtid:uuidv4()
        })

        return res.status(200).json({ message: "Sign in successful", accesstoken, refreshtoken});

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error:error.message });
    }
};



export const UpdateAccountService = async (req,res)=>{
    try{
        // const {userId} = req.params
        const {_id} = req.loggedInUser

        const {firstName, lastName, email, age} = req.body

        const user = await User.findByIdAndUpdate(_id, {firstName, lastName, email, age}, { new: true, runValidators: true })
           if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        
        return res.status(200).json({ message: "User updated successfully", user });

    }catch(error){
         return res.status(500).json({message:"Internal Service Error", error:error.message})
    }
}


export const DeleteAccountService = async (req, res) => {
  const { _id } = req.loggedInUser; 

  const session = await mongoose.startSession();
  req.session = session;
  session.startTransaction();

  const deletedUser = await User.findByIdAndDelete(_id, { session });
  if (!deletedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  await Message.deleteMany({ receiverId: _id }, { session });

  await session.commitTransaction();
  session.endSession(); 
  return res.status(200).json({ message: "User deleted successfully", deletedUser });
};




export const ListUsersService = async (req, res)=>{
    let users = await User.find()
    users= users.map((user)=>{
        return{
            ...user._doc,
            phoneNumber:decrypt(user.phoneNumber)
        }
    })
    res.status(200).json({users})
}


export const LogOutService = async(req, res)=>{
const {tokenId, expirationDate, _id}= req.loggedInUser
// 
await BlackListedTokens.create({
    tokenId,
    expirationDate: new Date(expirationDate * 1000),
    userId:_id
,

})

return res.status(200).json({message:"User logged out successfully"})
}


export const RefreshTokenService = async(req, res)=>{
 const {refreshtoken} = req.headers
 const decodedData = verifyToken(refreshtoken, process.env.JWT_REFRESH_SECRET)
        const accesstoken = generateToken({
            _id:decodedData._id, email:decodedData.email
        }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid:uuidv4()
        })
        return res.status(200).json({message:"User token refreshed successfully", accesstoken})

}



export const UpdatePasswordService = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { _id } = req.loggedInUser; 


        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new password are required" });
        }

  
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const isMatch = compareSync(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }


        const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        return res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};



