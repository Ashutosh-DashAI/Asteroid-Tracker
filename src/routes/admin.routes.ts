import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// All admin routes are protected and require ADMIN role
router.use(authenticateToken, authorize("ADMIN"));

// User management
router.get("/users", adminController.getAllUsers);

router.delete("/users/:id", adminController.deleteUser);

router.put("/users/:id/ban", adminController.banUser);

router.put("/users/:id/unban", adminController.unbanUser);

// Stats
router.get("/stats", adminController.getSystemStats);

router.get("/users-latest", adminController.getLatestRegisteredUsers);

export default router;
