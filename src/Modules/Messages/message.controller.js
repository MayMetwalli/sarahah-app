import { Router } from "express";
import mongoose from "mongoose";
import { sendMessageService, getMessagesService } from "./Services/message.service.js";
import upload from "../../Middlewares/uploads.middleware.js";
import validateMessage from "../../Validators/messages.validators.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";

const router = Router();

router.post("/", upload.single("attachment"), validateMessage, sendMessageService);


// router.get("/messages/:userId", getMessagesService);
router.get(
  "/:userId",
  authenticationMiddleware,              
  getMessagesService                
);

export default router;
