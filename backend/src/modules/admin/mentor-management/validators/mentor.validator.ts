import Joi from 'joi';

export const createMentorSchema = Joi.object({
  fullName: Joi.string().trim().min(3).required(),
  email: Joi.string().email().required(),
  expertise: Joi.array().items(Joi.string().trim()).min(1).required(),
  experienceLevel: Joi.string()
    .valid('junior', 'mid', 'senior')
    .required(),
});

export const listMentorsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid('INVITED', 'ACTIVE', 'DISABLED'),
  experienceLevel: Joi.string().valid('junior', 'mid', 'senior'),
  isBlocked: Joi.string().valid('true', 'false'),
  expertise: Joi.string().trim(),
  search: Joi.string().trim().max(100),
  sortBy: Joi.string()
    .valid('createdAt', 'invitedAt', 'activatedAt', 'experienceLevel', 'mentorStatus')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});