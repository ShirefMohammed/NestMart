import express from "express";

import {
  forgetPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  sendResetPasswordForm,
  verifyAccount,
} from "../controllers/authController";

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/refresh").get(refresh);

router.route("/logout").get(logout);

router.route("/verifyAccount").get(verifyAccount);

router.route("/forgetPassword").post(forgetPassword);

router.route("/resetPassword").get(sendResetPasswordForm).post(resetPassword);

export default router;
