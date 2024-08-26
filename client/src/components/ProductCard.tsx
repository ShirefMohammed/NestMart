import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StoreState } from "client/src/store/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";

import { AddToCartResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { cartAPI } from "../api/cartAPI";
import { useNotify } from "../hooks";
import { addToCart as addToCartStore } from "../store/slices/cartSlice";

const ProductCard = ({ product }: { product: Product }) => {
  const accessToken = useSelector((state: StoreState) => state.accessToken);
  const [addProductToCartLoad, setAddProductToCartLoad] = useState(false);
  const dispatch = useDispatch();
  const notify = useNotify();

  const addToCart = async (productId: number) => {
    try {
      if (!accessToken) return notify("info", "You should login first");

      setAddProductToCartLoad(true);

      const res = await cartAPI.addToCart(productId);

      const data: AddToCartResponse = res.data.data;

      notify("success", "Product is added to your cart");

      dispatch(addToCartStore(data.addedProduct));
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Add to cart fail!");
      }
    } finally {
      setAddProductToCartLoad(false);
    }
  };

  return (
    <div className="w-full px-3 py-5 border border-slate-200 rounded-md flex flex-col  justify-between gap-4">
      <img src={product.images[0]} alt="" loading="lazy" className="w-25 m-auto" />

      <Link to={`/products/${product._id}`} className="font-bold hover:underline">
        {product.title}
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-main font-bold mr-3">
            ${product.price - (product.discount / 100) * product.price}
          </span>

          <span className="text-heavyGray text-sm font-bold line-through">${product.price}</span>
        </div>

        <button
          type="button"
          disabled={addProductToCartLoad ? true : false}
          style={addProductToCartLoad ? { opacity: 0.5, cursor: "revert" } : {}}
          className="bg-lightGreen text-main text-sm rounded w-18 h-7 flex items-center justify-center gap-2"
          onClick={() => addToCart(product._id)}
        >
          {addProductToCartLoad ? (
            <PuffLoader color="#000" size={15} />
          ) : (
            <>
              <FontAwesomeIcon icon={faCartPlus} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
