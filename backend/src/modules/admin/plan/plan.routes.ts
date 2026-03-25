import { Router } from "express";
import { PlanController } from "./plan.controller";
import { authMiddleware } from "../../../shared/middlewares/auth.middleware";
import { roleGuard } from "../../../shared/middlewares/role-guard.middleware";
import { UserRole } from "../../../shared/constants/roles";
import { validateRequest } from "../../../shared/middlewares/validate.middleware";
import { createPlanValidator } from "./validators/create-plan.validator";
import { updatePlanValidator } from "./validators/update-plan.validator";

const router = Router();
const controller = new PlanController();

// ADMIN ONLY
router.post(
     "/",
     authMiddleware,
     roleGuard(UserRole.ADMIN),
     validateRequest(createPlanValidator),
     controller.createPlan
);

router.patch(
     "/:id",
     authMiddleware,
     roleGuard(UserRole.ADMIN),
     validateRequest(updatePlanValidator),
     controller.updatePlan
);

router.get(
     "/admin",
     authMiddleware,
     roleGuard(UserRole.ADMIN),
     controller.getAdminPlans
);

// PUBLIC
router.get("/", controller.getActivePlans);

export default router;