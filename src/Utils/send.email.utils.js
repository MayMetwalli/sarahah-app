import nodemailer from "nodemailer"

export const sendEmail = async ({
    to,
    cc,
    subject,
    content,
    attachments=[]

})=>{
    const transporter = nodemailer.createTransport({
        host:"smtp.mail.com",
        port:465,
        secure: true,
        service: "gmail",
        auth:{
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD,
        }
    })

    const info = await transporter.sendMail({
        from: 'maymetwalli.27@gmail.com',
        to,
        cc,
        html:content,
        subject,
        attachments
    })

    console.log('info',info)
    return info 
}



import {EventEmitter} from "node:events";
export const emitter = new EventEmitter()

emitter.on('sendEmail', (args)=>{
    console.log(`The email sending event started`)
    console.log(args)

    sendEmail(args)
})