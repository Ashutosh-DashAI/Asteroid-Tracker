import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate.middleware";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from "../validators/auth.schema";
import { authenticateToken } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// Public routes
router.post(
  "/signup",
  authLimiter,
  validateRequest(signupSchema),
  authController.signup
);

router.post(
  "/login",
  authLimiter,
  validateRequest(loginSchema),
  authController.login
);

router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.post(
  "/logout",
  authenticateToken,
  validateRequest(refreshTokenSchema),
  authController.logout
);

router.post(
  "/change-password",
  authenticateToken,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

router.get("/me", authenticateToken, authController.getCurrentUser);

export default router;
