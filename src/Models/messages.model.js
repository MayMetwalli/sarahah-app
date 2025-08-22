import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxLength: 500 },
    attachmentPath: { type: String }, 
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
