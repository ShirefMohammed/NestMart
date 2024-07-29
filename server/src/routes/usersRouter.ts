import express from "express";

import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/usersController";
import { verifyJWT } from "../middleware/verifyJWT";
import { verifyRole } from "../middleware/verifyRole";
import { ROLES_LIST } from "../utils/rolesList";
import { uploadFileByMulter } from "../utils/uploadFileByMulter";

const router = express.Router();

router
  .route("/")
  .get(
    verifyJWT,
    verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),
    getUsers,
  );

const upload = uploadFileByMulter("avatars", "image");

router
  .route("/:userId")
  .get(verifyJWT, getUser)
  .patch(verifyJWT, upload.single("avatar"), updateUser)
  .delete(verifyJWT, deleteUser);

export default router;
