import {
  CreateProductRequest,
  CreateProductResponse,
  DeleteProductRequest,
  DeleteProductResponse,
  GetProductRequest,
  GetProductResponse,
  GetProductsRequest,
  GetProductsResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { deleteImages } from "../utils/deleteImages";
import handleImageQuality from "../utils/handleImageQuality";
import { httpStatusText } from "../utils/httpStatusText";

export const getProducts: ExpressHandler<
  GetProductsRequest,
  GetProductsResponse
> = async (req, res, next) => {
  try {
    const order = req.query.order;
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const products = await db.getProducts(
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

export const getProduct: ExpressHandler<
  GetProductRequest,
  GetProductResponse
> = async (req, res, next) => {
  try {
    let product = await db.findProductById(+req.params.productId);

    if (!product) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Product is not found",
      });
    }

    product.images = createImagesUrl("products", product.images);

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { product },
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct: ExpressHandler<
  CreateProductRequest,
  CreateProductResponse
> = async (req, res, next) => {
  try {
    if (
      !req.body?.title ||
      !req.body?.desc ||
      !req.body?.price ||
      !req.body?.available ||
      !req.body?.categoryId
    ) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message:
          "Product title, desc, price, available and categoryId are required.",
      });
    }

    req.files = req.files instanceof Array ? req.files : [];

    if (req.files.length === 0) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Product images is required.",
      });
    }

    if (
      req.body?.discount &&
      (+req.body.discount < 0 || +req.body.discount > 100)
    ) {
      await deleteImages(
        "products",
        req.files.map((image) => image.filename),
      );

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Product discount must be between 0 and 100.",
      });
    }

    if (req.body?.price && +req.body.price < 0) {
      await deleteImages(
        "products",
        req.files.map((image) => image.filename),
      );

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Invalid product price.",
      });
    }

    if (req.body?.available && +req.body.available < 0) {
      await deleteImages(
        "products",
        req.files.map((image) => image.filename),
      );

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Invalid product available mount.",
      });
    }

    const isCategoryFound = await db.findCategoryById(
      +req.body.categoryId,
      "_id",
    );

    if (!isCategoryFound) {
      await deleteImages(
        "products",
        req.files.map((image) => image.filename),
      );

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Category is not found.",
      });
    }

    const isProductFound = await db.findProductByTitle(
      req.body.title,
      "_id",
      false,
    );

    if (isProductFound) {
      await deleteImages(
        "products",
        req.files.map((image) => image.filename),
      );

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Product with same title already exists.",
      });
    }

    req.files.map(async (image: any) => {
      await handleImageQuality(
        "products",
        image.filename,
        image.filename,
        300,
        300,
        80,
      );
    });

    req.body.images = req.files.map((image) => image.filename);

    await db.createProduct(req.body);

    const newProduct = await db.findProductByTitle(req.body.title);
    newProduct.images = createImagesUrl("products", newProduct.images);

    res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message: "Product is created.",
      data: { newProduct },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct: ExpressHandler<
  UpdateProductRequest,
  UpdateProductResponse
> = async (req, res, next) => {
  try {
    const {
      title,
      desc,
      discount,
      price,
      available,
      categoryId,
      deletedImages,
    } = req.body;

    req.files = req.files instanceof Array ? req.files : [];

    const product = await db.findProductById(
      +req.params.productId,
      "_id",
      true,
    );

    if (!product) {
      await deleteImages(
        "products",
        req.files.map((image) => image.filename),
      );

      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Product is not found.",
      });
    }

    let message = "Product is updated.";
    const updatedFields: Partial<Product> = {};

    if (title) {
      const isTitleTokenBefore = await db.findProductByTitle(
        title,
        "_id",
        false,
      );

      if (
        isTitleTokenBefore &&
        isTitleTokenBefore._id !== +req.params.productId
      ) {
        message += ` Title is not updated as another product with same title exists.`;
      } else {
        updatedFields.title = title;
      }
    }

    if (desc) {
      updatedFields.desc = desc;
    }

    if (discount) {
      if (+discount < 0 || +discount > 100) {
        message += ` Discount is not updated as it should be between 0 and 100.`;
      } else {
        updatedFields.discount = +discount;
      }
    }

    if (price) {
      if (+price < 0) {
        message += ` Price is not updated as it should be positive.`;
      } else {
        updatedFields.price = +price;
      }
    }

    if (available) {
      if (+available < 0) {
        message += ` Available is not updated as it should be positive.`;
      } else {
        updatedFields.available = +available;
      }
    }

    if (categoryId) {
      const isCategoryFound = await db.findCategoryById(categoryId, "_id");

      if (!isCategoryFound) {
        message += ` Category id is not updated as it is not found.`;
      } else {
        updatedFields.categoryId = +categoryId;
      }
    }

    if (
      (!req.files || req.files.length === 0) &&
      deletedImages &&
      deletedImages.length === product.images.length
    ) {
      message +=
        " Images are not updated as the product should have at least one image.";
    } else {
      if (
        deletedImages &&
        deletedImages instanceof Array &&
        deletedImages.length > 0
      ) {
        await deleteImages("products", deletedImages);

        updatedFields.images = product.images.filter(
          (image: string) => !deletedImages.includes(image),
        );
      } else {
        updatedFields.images = product.images;
      }

      if (req.files && req.files.length > 0) {
        const processedImages = await Promise.all(
          req.files.map(async (image) => {
            await handleImageQuality(
              "products",
              image.filename,
              image.filename,
              300,
              300,
              80,
            );
            return image.filename;
          }),
        );

        updatedFields.images = [...updatedFields.images!, ...processedImages];
      }
    }

    await db.updateProduct(+req.params.productId, updatedFields);

    const updatedProduct = await db.findProductById(+req.params.productId);

    updatedProduct.images = createImagesUrl("products", updatedProduct.images);

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message,
      data: { updatedProduct },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct: ExpressHandler<
  DeleteProductRequest,
  DeleteProductResponse
> = async (req, res, next) => {
  try {
    const product = await db.findProductById(+req.params.productId);

    if (!product) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Product is not found",
      });
    }

    await deleteImages("products", product.images);

    await db.deleteProduct(+req.params.productId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
