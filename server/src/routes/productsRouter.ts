import express from "express";

import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  searchProducts,
  updateProduct,
} from "../controllers/productsController";
import { verifyJWT } from "../middleware/verifyJWT";
import { verifyRole } from "../middleware/verifyRole";
import { ROLES_LIST } from "../utils/rolesList";
import { uploadFileByMulter } from "../utils/uploadFileByMulter";

const router = express.Router();

const upload = uploadFileByMulter("products", "image");

router
  .route("/")
  .get(getProducts)
  .post(
    verifyJWT,
    verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),
    upload.array("images"),
    createProduct,
  );

router.route("/search").get(searchProducts);

router
  .route("/:productId")
  .get(getProduct)
  .patch(
    verifyJWT,
    verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),
    upload.array("images"),
    updateProduct,
  )
  .delete(
    verifyJWT,
    verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),
    deleteProduct,
  );

export default router;
