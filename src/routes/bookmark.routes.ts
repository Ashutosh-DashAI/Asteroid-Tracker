import { Router } from "express";
import { bookmarkController } from "../controllers/bookmark.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All bookmark routes are protected
router.use(authenticateToken);

router.post("/:messageId", bookmarkController.bookmarkMessage);

router.delete("/:messageId", bookmarkController.removeBookmark);

router.get("/", bookmarkController.getBookmarkedMessages);

export default router;
