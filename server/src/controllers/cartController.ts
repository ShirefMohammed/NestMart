import {
  AddToCartRequest,
  AddToCartResponse,
  GetCartProductsRequest,
  GetCartProductsResponse,
  RemoveFromCartRequest,
  RemoveFromCartResponse,
} from "@shared/types/apiTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { httpStatusText } from "../utils/httpStatusText";

export const getCartProducts: ExpressHandler<
  GetCartProductsRequest,
  GetCartProductsResponse
> = async (req, res, next) => {
  try {
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const products = await db.getCartProducts(
      res.locals.userInfo._id,
      -1,
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

export const addToCart: ExpressHandler<
  AddToCartRequest,
  AddToCartResponse
> = async (req, res, next) => {
  try {
    const addedProduct = await db.findProductById(+req.params.productId);

    if (!addedProduct) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Product is not found",
      });
    }

    addedProduct.images = createImagesUrl("products", addedProduct.images);

    const isProductInCart = await db.findCartProduct(
      res.locals.userInfo._id,
      +req.params.productId,
    );

    if (isProductInCart) {
      return res.status(201).send({
        statusText: httpStatusText.SUCCESS,
        message: "Product is added before.",
        data: { addedProduct },
      });
    }

    await db.addToCart(res.locals.userInfo._id, +req.params.productId);

    res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { addedProduct },
    });
  } catch (err) {
    next(err);
  }
};

export const removeFormCart: ExpressHandler<
  RemoveFromCartRequest,
  RemoveFromCartResponse
> = async (req, res, next) => {
  try {
    await db.removeFromCart(res.locals.userInfo._id, +req.params.productId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
