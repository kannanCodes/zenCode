import { Router } from 'express';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { roleGuard } from '../../../shared/middlewares/role-guard.middleware';
import { UserRole } from '../../../shared/constants/roles';
import { validateQuery } from '../../../shared/middlewares/validate.middleware';
import { listUsersSchema } from './validators/list-users.validator';

const router = Router();

const service = new AdminUserService();
const controller = new AdminUserController(service);

router.use(authMiddleware, roleGuard(UserRole.ADMIN));

router.get(
     '/users',
     validateQuery(listUsersSchema),
     controller.listUsers.bind(controller),
);

router.patch(
     '/users/:userId/block',
     controller.blockUser.bind(controller),
);

router.patch(
     '/users/:userId/unblock',
     controller.unblockUser.bind(controller),
);

export default router;