import { Router } from 'express';
import { MentorAuthService } from './mentor-auth.service';
import { MentorAuthController } from './mentor-auth.controller';
import { validateRequest } from '../../../shared/middlewares/validate.middleware';
import { mentorLoginSchema } from './validators/mentor-login.validator';
import { activateMentorSchema } from './validators/activate-mentor.validator';

const router = Router();

const service = new MentorAuthService();
const controller = new MentorAuthController(service);

router.post(
  '/login',
  validateRequest(mentorLoginSchema),
  controller.login.bind(controller)
);

router.post(
  '/activate',
  validateRequest(activateMentorSchema),
  controller.activate.bind(controller)
);

router.post('/refresh', controller.refresh.bind(controller));
router.post('/logout', controller.logout.bind(controller));

export default router;