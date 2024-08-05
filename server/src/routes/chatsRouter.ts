import express from "express";

import {
  createChat,
  createMessage,
  deleteChat,
  deleteMessage,
  getChat,
  getChatMessages,
  getChats,
  updateChat,
} from "../controllers/chatsController";
import { verifyJWT } from "../middleware/verifyJWT";
import { verifyRole } from "../middleware/verifyRole";
import { ROLES_LIST } from "../utils/rolesList";

const router = express.Router();

router
  .route("/")
  .get(verifyJWT, verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin), getChats)
  .post(verifyJWT, createChat);

router
  .route("/:chatId")
  .get(verifyJWT, getChat)
  .patch(verifyJWT, updateChat)
  .delete(verifyJWT, deleteChat);

router
  .route("/:chatId/messages")
  .get(verifyJWT, getChatMessages)
  .post(verifyJWT, createMessage);

router.route("/:chatId/messages/:messageId").delete(verifyJWT, deleteMessage);

export default router;
