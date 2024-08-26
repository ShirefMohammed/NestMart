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
  SearchCategoriesRequest,
  SearchCategoriesResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
} from "@shared/types/apiTypes";
import { Category, Product } from "@shared/types/entitiesTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { deleteFile } from "../utils/deleteFile";
import { deleteImages } from "../utils/deleteImages";
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

    const categories: Category[] = await db.getCategories(
      order === "old" ? 1 : -1,
      limit,
      skip,
    );

    categories.forEach((category: Category) => {
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

export const searchCategories: ExpressHandler<
  SearchCategoriesRequest,
  SearchCategoriesResponse
> = async (req, res, next) => {
  try {
    const order = req.query.order;
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const categories: Category[] = await db.searchCategories(
      req.query.searchKey,
      order === "old" ? 1 : -1,
      limit,
      skip,
    );

    categories.forEach((category: Category) => {
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
    let category: Category = await db.findCategoryById(+req.params.categoryId);

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
    if (!req?.file?.filename) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Category image is required.",
      });
    }

    if (!req.body?.title) {
      await deleteFile("categories", req.file.filename);

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Category title is required.",
      });
    }

    const isCategoryFound: Category = await db.findCategoryByTitle(
      req.body.title,
      "_id",
    );

    if (isCategoryFound) {
      await deleteFile("categories", req.file.filename);

      return res.status(409).send({
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

    const newCategory: Category = await db.createCategory({
      title: req.body.title,
      image: req.file.filename,
    });

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
    const category: Category = await db.findCategoryById(
      +req.params.categoryId,
    );

    if (!category) {
      if (req?.file?.filename) {
        await deleteFile("categories", req.file.filename);
      }

      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Category is not found.",
      });
    }

    let message = "Category is updated.";
    const updatedFields: Partial<Category> = {};

    if (req.body.title) {
      const isTitleTokenBefore: Category = await db.findCategoryByTitle(
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

    const updatedCategory: Category = await db.updateCategory(
      +req.params.categoryId,
      updatedFields,
    );

    // Delete old category image
    if (req?.file?.filename) {
      await deleteFile("categories", category.image);
    }

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
    const category: Category = await db.findCategoryById(
      +req.params.categoryId,
      "image",
    );

    if (!category) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Category is not found",
      });
    }

    // Get all category products and delete them
    const allCategoryProducts: Product[] = await db.getCategoryProducts(
      +req.params.categoryId,
    );

    for (const product of allCategoryProducts) {
      // Delete the product from every cart
      await db.removeProductFromCarts(+product._id);

      // Update orders which contains this product
      await db.updateOrdersAfterDeletingProduct(+product._id);

      // Delete product images
      await deleteImages("products", product.images);

      // Delete the product
      await db.deleteProduct(+product._id);
    }

    // Delete category images
    await deleteFile("categories", category.image);

    // Delete the category
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

    const products: Product[] = await db.getCategoryProducts(
      +req.params.categoryId,
      order === "old" ? 1 : -1,
      limit,
      skip,
    );

    products.forEach((product: Product) => {
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
