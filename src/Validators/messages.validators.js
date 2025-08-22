import Joi from "joi";

const messageSchema = Joi.object({
  senderId: Joi.string().required(),
  receiverId: Joi.string().required(),
  content: Joi.string().max(500).required()
});

export default function validateMessage(req, res, next) {
  const { error } = messageSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}
