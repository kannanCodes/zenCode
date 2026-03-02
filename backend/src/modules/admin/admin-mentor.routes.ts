import { Router } from 'express';
import { AdminMentorController } from './admin-mentor.controller';
import { AdminMentorService } from './admin-mentor.service';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleGuard } from '../../shared/middlewares/role-guard.middleware';
import { UserRole } from '../../shared/constants/roles';
import adminAuthRouter from './auth/admin-auth.routes';
import { validateRequest, validateQuery } from '../../shared/middlewares/validate.middleware';
import { createMentorSchema, listMentorsQuerySchema } from './mentor-management/validators/mentor.validator';

const router = Router();

router.use('/auth', adminAuthRouter);
const adminMentorService = new AdminMentorService();
const adminMentorController = new AdminMentorController(adminMentorService);


router.post(
  '/mentors',
  authMiddleware,
  roleGuard(UserRole.ADMIN),
  validateRequest(createMentorSchema),
  adminMentorController.createMentor.bind(adminMentorController)
);

router.get(
  '/mentors',
  authMiddleware,
  roleGuard(UserRole.ADMIN),
  validateQuery(listMentorsQuerySchema),
  adminMentorController.listMentors.bind(adminMentorController)
);

router.patch(
  '/mentors/:mentorId/status',
  authMiddleware,
  roleGuard(UserRole.ADMIN),
  adminMentorController.updateMentorStatus.bind(adminMentorController)
);

router.post(
  '/mentors/:mentorId/resend-invite',
  authMiddleware,
  roleGuard(UserRole.ADMIN),
  adminMentorController.resendMentorInvite.bind(adminMentorController)
);

export default router;