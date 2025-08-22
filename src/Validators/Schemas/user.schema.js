import Joi from "joi";
import { GenderEnum } from "../../Common/enums/user.enum.js";
import { isValidObjectId } from "mongoose";

// const Names=[
//     'js','python','cpp'
// ]

function objectIdValidation(value,helper){
return isValidObjectId(value) ? value:helper.message('invalid object id')
}

export const SignUpSchema = {
    body: Joi.object({
        firstName: Joi.string().alphanum().required().messages({
            'string.base':'first name must be a string',
            'any.required':'first name is required',
            'string.alphanum':'first name must contain only letters and numbers'
        }),
        lastName: Joi.string().min(3).max(20).required(),
        email:Joi.string().email().required(),
            password: Joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/)
            .required()
            .messages({
                "string.pattern.base":
                "Password must contain at least one lowercase letter, one uppercase, one digit and one special character",
            }),

        confirmPassword:Joi.string().valid(Joi.ref('password')),
        age: Joi.number().min(18).max(60).required(),
        // minAge:Joi.number().greater(18),
        // maxAge:Joi.number().less(100),
        gender:Joi.string().valid(...Object.values(GenderEnum)).optional(),
        phoneNumber:Joi.string().required(),
        isConfirmed: Joi.boolean().truthy('yes').falsy('no').sensitive(),
        userId:Joi.custom(objectIdValidation)
        // skillsNames:Joi.array().items(Joi.string()),
    //     skills:Joi.array().items(
    //         Joi.object({
    //             name:Joi.string().valid(...Names),
    //             level:Joi.string().valid(...Object.values(skillLevelEnum))
    //         })
    //     ).length(2)
    })
    .with('email','password')
    .with('firstName','lastName')
}