import express from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  getCategoryProducts,
  searchCategories,
  updateCategory,
} from "../controllers/categoriesController";
import { verifyJWT } from "../middleware/verifyJWT";
import { verifyRole } from "../middleware/verifyRole";
import { ROLES_LIST } from "../utils/rolesList";
import { uploadFileByMulter } from "../utils/uploadFileByMulter";

const router = express.Router();

const upload = uploadFileByMulter("categories", "image");

router
  .route("/")
  .get(getCategories)
  .post(
    verifyJWT,
    verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),
    upload.single("image"),
    createCategory,
  );

router.route("/search").get(searchCategories);

router
  .route("/:categoryId")
  .get(getCategory)
  .patch(
    verifyJWT,
    verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),
    upload.single("image"),
    updateCategory,
  )
  .delete(
    verifyJWT,
    verifyRole(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),
    deleteCategory,
  );

router.route("/:categoryId/products").get(getCategoryProducts);

export default router;
