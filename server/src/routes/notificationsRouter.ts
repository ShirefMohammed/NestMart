import express from "express";

import {
  deleteNotification,
  getNotifications,
  updateNotification,
} from "../controllers/notificationsController";
import { verifyJWT } from "../middleware/verifyJWT";

const router = express.Router();

// Get notifications for receiver
router.route("/").get(verifyJWT, getNotifications);

// Update and delete notification by receiver
router
  .route("/:notificationId")
  .patch(verifyJWT, updateNotification)
  .delete(verifyJWT, deleteNotification);

export default router;
