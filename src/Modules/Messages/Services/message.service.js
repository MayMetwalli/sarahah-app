import Message from "../../../Models/messages.model.js";

export const sendMessageService = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const attachmentPath = req.file ? req.file.path : null;

    const newMsg = new Message({
      senderId,
      receiverId,
      content,
      attachmentPath,
      createdAt: Date.now()
    });

    await newMsg.save();
    res.status(201).json({ message: newMsg });
  } catch (err) {
    console.error("Error sending message:", err);
res.status(500).json({ error: "Internal server error", err: err.message });
  }
};

export const getMessagesService = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching messages for userId:", userId); 
    const messages = await Message.find({ receiverId: userId }).sort({ createdAt: -1 });
    console.log("Messages found:", messages.length);      
    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

