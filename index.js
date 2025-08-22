import dotenv from "dotenv";
dotenv.config();
import express from "express";
import userRouter from "./src/Modules/Users/user.controller.js";
import messageRouter from "./src/Modules/Messages/message.controller.js";
import dbConnection from "./src/DB/db.connection.js"


const app = express();

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

dbConnection()
app.use(async (err, req, res, next) => {
    console.error(err.stack);

    if (req.session?.inTransaction) {
        await req.session.abortTransaction();
        req.session.endSession();
        console.log('The transaction is aborted');
    }

    res.status(500).json({ message: "Something broke", err:err.message, stack:err.stack });
});


app.use((req, res)=>{
    res.status(404).send("Not Found");
})

app.listen(process.env.PORT, ()=>{
    console.log("Server is running on port 3000")
})