import express from "express";

import {
  addToCart,
  getCartProducts,
  removeFormCart,
} from "../controllers/cartController";
import { verifyJWT } from "../middleware/verifyJWT";

const router = express.Router();

router.route("/").get(verifyJWT, getCartProducts);

router
  .route("/:productId")
  .post(verifyJWT, addToCart)
  .delete(verifyJWT, removeFormCart);

export default router;
