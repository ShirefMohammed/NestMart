import express from "express";

import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
} from "../controllers/ordersController";
import { verifyJWT } from "../middleware/verifyJWT";

const router = express.Router();

router.route("/").get(verifyJWT, getOrders).post(verifyJWT, createOrder);

router
  .route("/:orderId")
  .get(verifyJWT, getOrder)
  .delete(verifyJWT, deleteOrder);

export default router;
