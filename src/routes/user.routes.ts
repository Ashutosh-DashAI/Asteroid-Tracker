import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { updateProfileSchema } from "../validators/user.schema";

const router = Router();

// Public routes
router.get(
  "/search",
  validateRequest(
    updateProfileSchema.pick({ username: true }).extend({
      query: updateProfileSchema.shape.username,
      limit: updateProfileSchema.shape.username.optional(),
      offset: updateProfileSchema.shape.username.optional(),
    }).optional(),
    "query"
  ),
  userController.searchUsers
);

router.get("/:id", userController.getUserById);

router.get("/:id/followers", userController.getFollowers);

router.get("/:id/following", userController.getFollowing);

// Protected routes
router.get("/profile/current", authenticateToken, userController.getProfile);

router.put(
  "/update",
  authenticateToken,
  validateRequest(updateProfileSchema),
  userController.updateProfile
);

router.delete("/delete", authenticateToken, userController.deleteAccount);

router.post("/follow/:id", authenticateToken, userController.followUser);

router.post("/unfollow/:id", authenticateToken, userController.unfollowUser);

export default router;
