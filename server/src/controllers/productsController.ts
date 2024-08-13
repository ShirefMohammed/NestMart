import {
  CreateProductRequest,
  CreateProductResponse,
  DeleteProductRequest,
  DeleteProductResponse,
  GetProductRequest,
  GetProductResponse,
  GetProductsRequest,
  GetProductsResponse,
  SearchProductsRequest,
  SearchProductsResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from "@shared/types/apiTypes";
import { Category, Product } from "@shared/types/entitiesTypes";

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

    const products: Product[] = await db.getProducts(
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

export const searchProducts: ExpressHandler<
  SearchProductsRequest,
  SearchProductsResponse
> = async (req, res, next) => {
  try {
    const order = req.query.order;
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const products: Product[] = await db.searchProducts(
      req.query.searchKey,
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

export const getProduct: ExpressHandler<
  GetProductRequest,
  GetProductResponse
> = async (req, res, next) => {
  try {
    let product: Product = await db.findProductById(+req.params.productId);

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
    // Check product images are required
    req.files = req.files instanceof Array ? req.files : [];

    if (req.files.length === 0) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Product images is required.",
      });
    }

    const imagesNames: string[] = req.files.map((image) => image.filename);

    // Check not found fields
    if (
      !req.body?.title ||
      !req.body?.desc ||
      !req.body?.price ||
      !req.body?.available ||
      !req.body?.categoryId
    ) {
      await deleteImages("products", imagesNames);

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message:
          "Product title, desc, price, available and categoryId are required.",
      });
    }

    // Check if product with same title exists
    const isProductWithSameTitleFound: Product = await db.findProductByTitle(
      req.body.title,
      "_id",
      false,
    );

    if (isProductWithSameTitleFound) {
      await deleteImages("products", imagesNames);

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Product with same title already exists.",
      });
    }

    // Check price constraints
    if (req.body?.price && +req.body.price < 0) {
      await deleteImages("products", imagesNames);

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Invalid product price.",
      });
    }

    // Check discount constraints
    if (
      req.body?.discount &&
      (+req.body.discount < 0 || +req.body.discount > 100)
    ) {
      await deleteImages("products", imagesNames);

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Product discount must be between 0 and 100.",
      });
    }

    // Check available constraints
    if (req.body?.available && +req.body.available < 0) {
      await deleteImages("products", imagesNames);

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Invalid product available mount.",
      });
    }

    // Check if category not found
    const isCategoryFound: Category = await db.findCategoryById(
      +req.body.categoryId,
      "_id",
    );

    if (!isCategoryFound) {
      await deleteImages("products", imagesNames);

      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Category is not found.",
      });
    }

    // Handle uploaded images quality
    for (const image of req.files) {
      await handleImageQuality(
        "products",
        image.filename,
        image.filename,
        300,
        300,
        80,
      );
    }

    // Create new product
    const newProduct: Product = await db.createProduct({
      title: req.body.title,
      desc: req.body.desc,
      price: req.body.price,
      discount: req.body.discount,
      available: req.body.available,
      categoryId: req.body.categoryId,
      images: imagesNames,
    });

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
      price,
      discount,
      available,
      categoryId,
      deletedImages,
    } = req.body;

    req.files = req.files instanceof Array ? req.files : [];
    const newImagesNames: string[] = req.files.map((image) => image.filename);

    // Check if product exists
    const product: Product = await db.findProductById(+req.params.productId);

    if (!product) {
      await deleteImages("products", newImagesNames);

      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Product is not found.",
      });
    }

    let message = "Product is updated.";
    const updatedFields: Partial<Product> = {};

    // Check title constraints
    if (title) {
      const isTitleTokenBefore: Product = await db.findProductByTitle(
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

    // Check desc constraints
    if (desc) {
      updatedFields.desc = desc;
    }

    // Check price constraints
    if (price) {
      if (+price < 0) {
        message += ` Price is not updated as it should be positive.`;
      } else {
        updatedFields.price = +price;
      }
    }

    // Check discount constraints
    if (discount) {
      if (+discount < 0 || +discount > 100) {
        message += ` Discount is not updated as it should be between 0 and 100.`;
      } else {
        updatedFields.discount = +discount;
      }
    }

    // Check available constraints
    if (available) {
      if (+available < 0) {
        message += ` Available is not updated as it should be positive.`;
      } else {
        updatedFields.available = +available;
      }
    }

    // Check if category found
    if (categoryId) {
      const isCategoryFound: Category = await db.findCategoryById(
        categoryId,
        "_id",
      );

      if (!isCategoryFound) {
        message += ` Category id is not updated as it is not found.`;
      } else {
        updatedFields.categoryId = +categoryId;
      }
    }

    // Handle images
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

    // Update the product
    const updatedProduct: Product = await db.updateProduct(
      +req.params.productId,
      updatedFields,
    );

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
    const product: Product = await db.findProductById(+req.params.productId);

    if (!product) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Product is not found",
      });
    }

    await db.deleteProduct(+req.params.productId);

    await deleteImages("products", product.images);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
