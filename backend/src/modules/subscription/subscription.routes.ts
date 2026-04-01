import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const router = Router();
const controller = new SubscriptionController();


router.get("/me", authMiddleware, controller.getMySubscription);
router.delete("/cancel", authMiddleware, controller.cancelSubscription);
router.patch("/change-plan", authMiddleware, controller.changePlan);

export default router;
