import {
  CreateCategoryRequest,
  CreateCategoryResponse,
  DeleteCategoryRequest,
  DeleteCategoryResponse,
  GetCategoriesRequest,
  GetCategoriesResponse,
  GetCategoryProductsRequest,
  GetCategoryProductsResponse,
  GetCategoryRequest,
  GetCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
} from "@shared/types/apiTypes";
import { Category } from "@shared/types/entitiesTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { deleteFile } from "../utils/deleteFile";
import handleImageQuality from "../utils/handleImageQuality";
import { httpStatusText } from "../utils/httpStatusText";

export const getCategories: ExpressHandler<
  GetCategoriesRequest,
  GetCategoriesResponse
> = async (req, res, next) => {
  try {
    const order = req.query.order;
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const categories = await db.getCategories(
      order === "old" ? 1 : -1,
      limit,
      skip,
    );

    categories.forEach((category) => {
      category.image = createImagesUrl("categories", [category.image])[0];
    });

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
};

export const getCategory: ExpressHandler<
  GetCategoryRequest,
  GetCategoryResponse
> = async (req, res, next) => {
  try {
    let category = await db.findCategoryById(+req.params.categoryId);

    if (!category) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Category is not found",
      });
    }

    category.image = createImagesUrl("categories", [category?.image])[0];

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

export const createCategory: ExpressHandler<
  CreateCategoryRequest,
  CreateCategoryResponse
> = async (req, res, next) => {
  try {
    if (!req.body?.title) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Category title is required.",
      });
    }

    if (!req?.file?.filename) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Category image is required.",
      });
    }

    const isCategoryFound = await db.findCategoryByTitle(req.body.title, "_id");

    if (isCategoryFound) {
      await deleteFile("categories", req.file.filename);

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Category with same title already exists.",
      });
    }

    await handleImageQuality(
      "categories",
      req.file.filename,
      req.file.filename,
      150,
      150,
      80,
    );

    await db.createCategory({
      title: req.body.title,
      image: req.file.filename,
    });

    const newCategory = await db.findCategoryByTitle(req.body.title);
    newCategory.image = createImagesUrl("categories", [newCategory.image])[0];

    res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message: "Category is created.",
      data: { newCategory },
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory: ExpressHandler<
  UpdateCategoryRequest,
  UpdateCategoryResponse
> = async (req, res, next) => {
  try {
    const category = await db.findCategoryById(+req.params.categoryId);

    if (!category) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Category is not found.",
      });
    }

    let message = "Category is updated.";
    const updatedFields: Partial<Category> = {};

    if (req.body.title) {
      const isTitleTokenBefore = await db.findCategoryByTitle(
        req.body.title,
        "_id",
      );

      if (
        isTitleTokenBefore &&
        isTitleTokenBefore._id !== +req.params.categoryId
      ) {
        message += ` Title is not updated as another category with same title exists.`;
      } else {
        updatedFields.title = req.body.title;
      }
    }

    if (req?.file?.filename) {
      await deleteFile("categories", category.image);

      await handleImageQuality(
        "categories",
        req.file.filename,
        req.file.filename,
        150,
        150,
        80,
      );

      updatedFields.image = req.file.filename;
    }

    await db.updateCategory(+req.params.categoryId, updatedFields);

    const updatedCategory = await db.findCategoryById(+req.params.categoryId);

    updatedCategory.image = createImagesUrl("categories", [
      updatedCategory.image,
    ])[0];

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message,
      data: { updatedCategory },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory: ExpressHandler<
  DeleteCategoryRequest,
  DeleteCategoryResponse
> = async (req, res, next) => {
  try {
    const category = await db.findCategoryById(+req.params.categoryId, "image");

    if (!category) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Category is not found",
      });
    }

    await deleteFile("categories", category.image);

    await db.deleteCategory(+req.params.categoryId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const getCategoryProducts: ExpressHandler<
  GetCategoryProductsRequest,
  GetCategoryProductsResponse
> = async (req, res, next) => {
  try {
    const order = req.query.order;
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const products = await db.getCategoryProducts(
      +req.params.categoryId,
      order === "old" ? 1 : -1,
      limit,
      skip,
    );

    products.forEach((product) => {
      product.images = createImagesUrl("products", product.images);
    });

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { products },
    });
  } catch (err) {
    next(err);
  }
};
