import bcrypt from "bcrypt";

import {
  AccessTokenUserInfo,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserRequest,
  GetUserResponse,
  GetUsersRequest,
  GetUsersResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from "@shared/types/apiTypes";
import { Chat, User } from "@shared/types/entitiesTypes";

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
    const limit: number = req.query?.limit ? Number(req.query.limit) : 10;
    const page: number = req.query?.page ? Number(req.query.page) : 1;
    const skip: number = (page - 1) * limit;

    const users: User[] = await db.getUsers(
      -1,
      limit,
      skip,
      "_id, name, email, avatar, createdAt, updatedAt, isVerified, role, phone, country, city",
    );

    users.forEach((user: User) => {
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

export const searchUsers: ExpressHandler<
  SearchUsersRequest,
  SearchUsersResponse
> = async (req, res, next) => {
  try {
    const searchKey: string = req.query?.searchKey;
    const limit: number = req.query?.limit ? Number(req.query.limit) : 10;
    const page: number = req.query?.page ? Number(req.query.page) : 1;
    const skip: number = (page - 1) * limit;

    if (!searchKey) {
      return res.status(200).send({
        statusText: httpStatusText.SUCCESS,
        message: "",
        data: { users: [] },
      });
    }

    const users: User[] = await db.searchUsers(
      searchKey,
      -1,
      limit,
      skip,
      "_id, name, email, avatar, createdAt, updatedAt, isVerified, role, phone, country, city",
    );

    users.forEach((user: User) => {
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
      return res.status(403).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    let user: User = await db.findUserById(
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
    const userInfo: AccessTokenUserInfo = res.locals.userInfo;
    const { name, country, city, phone, oldPassword, password } = req.body;

    // Only account owner can make updates
    if (userInfo._id !== +req.params.userId) {
      if (req?.file?.filename) {
        await deleteFile("avatars", req.file.filename);
      }

      return res.status(403).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const user: User = await db.findUserById(userInfo._id);

    // Confirm if user not found
    if (!user) {
      if (req?.file?.filename) {
        await deleteFile("avatars", req.file.filename);
      }

      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Account is not found.",
      });
    }

    let message: string = "Account updated successfully.";
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

    // Delete the old user.avatar image if not equal defaultAvatar.png
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
    }

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: message,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser: ExpressHandler<
  DeleteUserRequest,
  DeleteUserResponse
> = async (req, res, next) => {
  try {
    const userInfo: AccessTokenUserInfo = res.locals.userInfo;
    const { password } = req.body;

    if (
      userInfo._id !== +req.params.userId &&
      userInfo.role !== ROLES_LIST.Admin &&
      userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      return res.status(403).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const user: User = await db.findUserById(
      +req.params.userId,
      "_id, avatar, password, role",
    );

    if (!user) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Account is not found.",
      });
    }

    // Prevent deleting admins and superAdmins
    if (user.role === ROLES_LIST.Admin || user.role === ROLES_LIST.SuperAdmin) {
      return res.status(403).send({
        statusText: httpStatusText.FAIL,
        message: "Admin or SuperAdmin can not be deleted.",
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
        return res.status(403).send({
          statusText: httpStatusText.FAIL,
          message: "Wrong password",
        });
      }
    }

    // Delete user (messages, orders) notifications
    await db.deleteAllUserNotifications(+req.params.userId);

    // Remove user's cart items
    await db.removeAllFromCart(+req.params.userId);

    // Delete user orders
    await db.deleteAllUserOrders(+req.params.userId);

    // Delete user (customer) chat and messages
    const customerChat: Chat = await db.findChatByCustomerId(
      +req.params.userId,
      "_id",
    );

    if (customerChat?._id) {
      await db.updateChat(customerChat._id, {
        lastMsgId: null,
        lastNotReadMsgId: null,
      });
      await db.deleteChatMessages(customerChat._id);
      await db.deleteChat(customerChat._id);
    }

    // Delete user avatar
    if (user.avatar !== "defaultAvatar.png") {
      await deleteFile("avatars", user.avatar);
    }

    // Delete this user
    await db.deleteUser(+req.params.userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
