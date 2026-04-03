import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { updateProfileSchema } from "../validators/user.schema";

const router = Router();

// All routes require authentication for user profile management
router.get("/profile", authenticateToken, userController.getProfile);

router.put(
  "/profile",
  authenticateToken,
  validateRequest(updateProfileSchema),
  userController.updateProfile
);

export default router;
