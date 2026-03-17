import { Router } from "express";
import { SubmissionController } from "./submission.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { createSubmissionSchema } from "./validators/submission.validator";

const router = Router();
const controller = new SubmissionController();

router.post("/", authMiddleware, validateRequest(createSubmissionSchema), controller.submit);
router.get("/me", authMiddleware, controller.getMySubmissions);
router.get("/:id", authMiddleware, controller.getSubmission);

export default router;