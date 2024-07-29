import bcrypt from "bcrypt";
import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "node:path";

import { db } from "../database";
import {
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendResetPasswordFormRequest,
  SendResetPasswordFormResponse,
  VerifyAccountRequest,
  VerifyAccountResponse,
} from "@shared/types/apiTypes";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { RgxList } from "../utils/RgxList";
import { createImagesUrl } from "../utils/createImagesUrl";
import { generateAccessToken } from "../utils/generateAccessToken";
import { generateRefreshToken } from "../utils/generateRefreshToken";
import { generateResetPasswordToken } from "../utils/generateResetPasswordToken";
import { generateVerificationToken } from "../utils/generateVerificationToken";
import { httpStatusText } from "../utils/httpStatusText";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";

export const register: ExpressHandler<
  RegisterRequest,
  RegisterResponse
> = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "All fields are required",
      });
    }

    if (!RgxList.NAME_REGEX.test(name)) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message:
          "Name must be 4 to 24 characters, Must begin with a letter, Letters, numbers, underscores, hyphens allowed, No spaces.",
      });
    }

    if (!RgxList.EMAIL_REGEX.test(email)) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Enter valid email.",
      });
    }

    if (!RgxList.PASS_REGEX.test(password)) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message:
          "Password must be 8 to 24 characters, Must include uppercase and lowercase letters , a number and a special character, Allowed special characters: !, @, #, $, %",
      });
    }

    const user = await db.findUserByEmail(email, "_id");

    if (user) {
      return res.status(409).send({
        statusText: httpStatusText.FAIL,
        message: "User with same email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.createUser({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const newUser = await db.findUserByEmail(email, "_id");

    const verificationToken = generateVerificationToken(newUser._id);
    db.setVerificationToken(newUser._id, verificationToken);

    await sendVerificationEmail(email, verificationToken);

    res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message:
        "Register succeeded. Your account has been created but not verified. Check you email for verification link.",
    });
  } catch (err) {
    next(err);
  }
};

export const login: ExpressHandler<LoginRequest, LoginResponse> = async (
  req,
  res,
  next,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "All fields are required.",
      });
    }

    const user = await db.findUserByEmail(email);

    if (!user) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "User is not found.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "Wrong password.",
      });
    }

    if (!user.isVerified) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "Your account is not verified.",
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);

    const refreshToken = generateRefreshToken(user._id);

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Creates Secure Cookie with refreshToken
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: true, // https
      sameSite: "none", // cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "Login succeeded",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: createImagesUrl("avatars", [user.avatar])[0],
          role: user.role,
        },
        accessToken: accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh: ExpressHandler<RefreshRequest, RefreshResponse> = async (
  req,
  res,
  next,
) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "Refresh token jwt is required",
      });
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    jwt.verify(
      cookies.jwt,
      process.env.REFRESH_TOKEN_SECRET!,
      async (err: any, decoded: any) => {
        if (err) {
          return res.status(403).send({
            statusText: httpStatusText.RefreshTokenExpiredError,
            message: "Refresh token is forbidden",
          });
        }

        const user = await db.findUserById(+decoded.userId);

        if (!user) {
          return res.status(404).send({
            statusText: httpStatusText.FAIL,
            message: "Account is not found",
          });
        }

        const accessToken = generateAccessToken(user._id, user.role);

        const refreshToken = generateRefreshToken(user._id);

        // Creates Secure Cookie with refresh token
        res.cookie("jwt", refreshToken, {
          httpOnly: true, // accessible only by web server
          secure: true, // https
          sameSite: "none", // cross-site cookie
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).send({
          statusText: httpStatusText.SUCCESS,
          message: "Refresh succeeded",
          data: {
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              avatar: createImagesUrl("avatars", [user.avatar])[0],
              role: user.role,
            },
            accessToken: accessToken,
          },
        });
      },
    );
  } catch (err) {
    next(err);
  }
};

export const logout: ExpressHandler<LogoutRequest, LogoutResponse> = async (
  _req,
  res,
  next,
) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const verifyAccount: RequestHandler<
  any,
  VerifyAccountResponse,
  VerifyAccountRequest,
  any
> = async (req, res, next) => {
  try {
    const { verificationToken } = req.query;

    if (!verificationToken || typeof verificationToken !== "string") {
      return res.status(400).send("Verification token is missing");
    }

    const user = await db.findUserByVerificationToken(verificationToken, "_id");

    if (!user) {
      return res.status(404).send("Invalid verification token");
    }

    try {
      // Verify the verification token
      const decodedToken = jwt.verify(
        verificationToken,
        process.env.VERIFICATION_TOKEN_SECRET!,
      );

      // Check if the decoded token contains the correct user ID
      if (
        typeof decodedToken === "object" &&
        decodedToken !== null &&
        "userId" in decodedToken &&
        (decodedToken as JwtPayload).userId !== user._id
      ) {
        return res.status(409).send("Invalid verification token");
      }

      // Update user's verification status
      await db.updateUser(user._id, { isVerified: true });
      await db.setVerificationToken(user._id, "");

      return res
        .status(200)
        .sendFile(
          path.join(__dirname, "..", "views", "verification_confirmation.html"),
        );
    } catch (error) {
      return res
        .status(403)
        .send(
          "Verification token has been expired. Go to forget password page to generate a new verification token.",
        );
    }
  } catch (err) {
    next(err);
  }
};

export const forgetPassword: ExpressHandler<
  ForgetPasswordRequest,
  ForgetPasswordResponse
> = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Email is required",
      });
    }

    const user = await db.findUserByEmail(email, "_id");

    if (!user) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "User is not found",
      });
    }

    const resetPasswordToken = generateResetPasswordToken(user._id);
    await db.setResetPasswordToken(user._id, resetPasswordToken);

    sendResetPasswordEmail(email, resetPasswordToken);

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message:
        "We send and email to you. check it and follow the link to reset your password.",
    });
  } catch (err) {
    next(err);
  }
};

export const sendResetPasswordForm: RequestHandler<
  any,
  SendResetPasswordFormResponse,
  SendResetPasswordFormRequest,
  any
> = async (req, res, next) => {
  try {
    const { resetPasswordToken } = req.query;

    if (!resetPasswordToken || typeof resetPasswordToken !== "string") {
      return res.status(400).send("Reset password token is missing");
    }

    const user = await db.findUserByResetPasswordToken(
      resetPasswordToken,
      "_id",
    );

    if (!user) {
      return res.status(404).send("Invalid reset password token");
    }

    try {
      const decodedToken = jwt.verify(
        resetPasswordToken,
        process.env.RESETPASSWORD_TOKEN_SECRET!,
      );

      // Check if the decoded token contains the correct user ID
      if (
        typeof decodedToken === "object" &&
        decodedToken !== null &&
        "userId" in decodedToken &&
        (decodedToken as JwtPayload).userId !== user._id
      ) {
        return res.status(409).send("Invalid reset password token");
      }

      // Send reset password form
      return res
        .status(200)
        .sendFile(
          path.join(__dirname, "..", "views", "reset_password_form.html"),
        );
    } catch (error) {
      return res
        .status(403)
        .send(
          "Reset password token has been expired. Go to forget password page to generate a new reset password token.",
        );
    }
  } catch (err) {
    next(err);
  }
};

export const resetPassword: RequestHandler<
  any,
  ResetPasswordResponse,
  ResetPasswordRequest,
  any
> = async (req, res, next) => {
  try {
    const { resetPasswordToken, newPassword } = req.body;

    if (!resetPasswordToken) {
      return res.status(400).send("Reset password token is required");
    }

    if (!newPassword) {
      return res.status(400).send("New password is required");
    }

    const user = await db.findUserByResetPasswordToken(
      resetPasswordToken,
      "_id",
    );

    if (!user) {
      return res.status(404).send("Invalid reset password token");
    }

    if (!RgxList.PASS_REGEX.test(newPassword)) {
      return res
        .status(400)
        .send(
          "Password must be 8 to 24 characters, Must include uppercase and lowercase letters , a number and a special character, Allowed special characters: !, @, #, $, %",
        );
    }

    await db.updateUser(user._id, {
      password: await bcrypt.hash(newPassword, 10),
      isVerified: true,
    });

    await db.setVerificationToken(user._id, "");
    await db.setResetPasswordToken(user._id, "");

    res.status(200).send("Reset password succeeded, You can login now.");
  } catch (err) {
    next(err);
  }
};
