import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    firstName: {
        type:String, 
        required: true, 
        minLength:[3, "First name must be at least 3 characters long"], 
        maxLength:20, 
        lowercase:true},
    lastName: {
        type:String, 
        required: true, 
        minLength:[3, "Last name must be at least 3 characters long"], 
        maxLength:20, 
        lowercase:true
    } ,
    age: {
        type:Number, 
        required: true, 
        min:[18, "Age must be at least 18 years old"], 
        max:[80,"Age must be at most 80 years old"], 
        index:true
    },
    email: {
        type:String,
        required:true,
        index:{
            unique:true,
            name: 'idx_email_unique'
        }
    },
    password:{
        type:String,
        required:true,
        // set(value){
        //     const randomValue = Math.random() * 1000000
        //     return `${value}___${randomValue}`
        // }
    },
    phoneNumber:{
        type:String, 
        required:true
    },
    otps:{
        confirmation:String,
        resetPassword:String
    },
    isConfirmed:{
        type:Boolean,
        default:false
    }
},{
    timestamps: true,
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    },
    virtuals:{
        fullName:{
            get(){
                return `${this.firstName} ${this.lastName}`
            }
        }
    }

})


userSchema.index({firstName:1, lastName:1},{name:'idx_first_last_unique', unique: true
})


const User = mongoose.model("User", userSchema)
export default User