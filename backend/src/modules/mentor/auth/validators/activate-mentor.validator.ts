import Joi from 'joi';

export const activateMentorSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().required(),
});

