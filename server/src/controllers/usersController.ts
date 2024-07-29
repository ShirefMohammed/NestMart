import bcrypt from "bcrypt";

import {
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserRequest,
  GetUserResponse,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from "@shared/types/apiTypes";
import { User } from "@shared/types/entitiesTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { RgxList } from "../utils/RgxList";
import { createImagesUrl } from "../utils/createImagesUrl";
import { deleteFile } from "../utils/deleteFile";
import handleImageQuality from "../utils/handleImageQuality";
import { httpStatusText } from "../utils/httpStatusText";
import { ROLES_LIST } from "../utils/rolesList";

export const getUsers: ExpressHandler<
  GetUsersRequest,
  GetUsersResponse
> = async (req, res, next) => {
  try {
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const users = await db.getUsers(
      -1,
      limit,
      skip,
      "_id, name, email, avatar, createdAt, updatedAt, isVerified, role, phone, country, city",
    );

    users.forEach((user) => {
      user.avatar = createImagesUrl("avatars", [user.avatar])[0];
    });

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

export const getUser: ExpressHandler<GetUserRequest, GetUserResponse> = async (
  req,
  res,
  next,
) => {
  try {
    if (
      res.locals.userInfo._id !== +req.params.userId &&
      res.locals.userInfo.role !== ROLES_LIST.Admin &&
      res.locals.userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    let user = await db.findUserById(
      +req.params.userId,
      "_id, name, email, avatar, createdAt, updatedAt, isVerified, role, phone, country, city",
    );

    if (!user) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Account is not found",
      });
    }

    user.avatar = createImagesUrl("avatars", [user?.avatar])[0];

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser: ExpressHandler<
  UpdateUserRequest,
  UpdateUserResponse
> = async (req, res, next) => {
  try {
    const userInfo = res.locals.userInfo;
    const { name, country, city, phone, oldPassword, password } = req.body;

    if (userInfo._id !== +req.params.userId) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const user = await db.findUserById(userInfo._id);

    if (!user) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Account is not found.",
      });
    }

    let message = "Account updated successfully.";
    const updatedFields: Partial<User> = {};

    if (name) {
      if (!RgxList.NAME_REGEX.test(name)) {
        message += ` Name is not updated because Name must be 4 to 24 characters, Must begin with a letter, Letters, numbers, underscores, hyphens allowed, No spaces.`;
      } else {
        updatedFields.name = name;
      }
    }

    if (country) {
      updatedFields.country = country;
    }

    if (city) {
      updatedFields.city = city;
    }

    if (phone) {
      updatedFields.phone = phone;
    }

    if (req?.file?.filename) {
      if (user.avatar !== "defaultAvatar.png") {
        await deleteFile("avatars", user.avatar);
      }

      await handleImageQuality(
        "avatars",
        req.file.filename,
        req.file.filename,
        225,
        225,
        80,
      );

      updatedFields.avatar = req.file.filename;
    }

    if (oldPassword && !password) {
      message += " Password is not updated because password is required.";
    } else if (!oldPassword && password) {
      message += " Password is not updated because old password is required.";
    } else if (oldPassword && password) {
      const isOldPasswordMatch = await bcrypt.compare(
        oldPassword,
        user.password,
      );

      if (!isOldPasswordMatch) {
        message += " Password is not updated because old password is wrong.";
      } else {
        if (!RgxList.PASS_REGEX.test(password)) {
          message += ` Password is not updated because Password must be 8 to 24 characters, Must include uppercase and lowercase letters, a number and a special character, Allowed special characters: !, @, #, $, %.`;
        } else {
          updatedFields.password = await bcrypt.hash(password, 10);
        }
      }
    }

    await db.updateUser(userInfo._id, updatedFields);

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: message,
    });
  } catch (err) {
    next(err);
  }
};

// TODO: Delete all user related resources
export const deleteUser: ExpressHandler<
  DeleteUserRequest,
  DeleteUserResponse
> = async (req, res, next) => {
  try {
    const userInfo = res.locals.userInfo;
    const { password } = req.body;

    if (
      userInfo._id !== +req.params.userId &&
      userInfo.role !== ROLES_LIST.Admin &&
      userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const user = await db.findUserById(
      +req.params.userId,
      "_id, avatar, password",
    );

    if (!user) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Account is not found.",
      });
    }

    if (
      userInfo.role !== ROLES_LIST.Admin &&
      userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      if (!password) {
        return res.status(400).send({
          statusText: httpStatusText.FAIL,
          message: "Password is required",
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res.status(401).send({
          statusText: httpStatusText.FAIL,
          message: "Wrong password",
        });
      }
    }

    // Delete cart items
    // Delete orders
    // Delete notifications
    // Delete messages
    // Delete chats

    // Delete this user
    await db.deleteUser(+req.params.userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
