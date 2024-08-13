import express from "express";

import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  getOrders,
} from "../controllers/ordersController";
import { verifyJWT } from "../middleware/verifyJWT";
import { verifyRole } from "../middleware/verifyRole";
import { ROLES_LIST } from "../utils/rolesList";

const router = express.Router();

router.route("/").get(verifyJWT, getOrders).post(verifyJWT, createOrder);

router
  .route("/all")
  .get(
    verifyJWT,
    verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),
    getAllOrders,
  );

router
  .route("/:orderId")
  .get(verifyJWT, getOrder)
  .delete(verifyJWT, deleteOrder);

export default router;
