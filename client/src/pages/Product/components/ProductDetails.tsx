import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StoreState } from "client/src/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";

import { AddToCartResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { cartAPI } from "../../../api/cartAPI";
import { useNotify } from "../../../hooks";
import { addToCart as addToCartStore } from "../../../store/slices/cartSlice";

const ProductDetails = ({
  product,
  fetchProductsLoad,
}: {
  product: Product | undefined;
  fetchProductsLoad: boolean;
}) => {
  return (
    <section className="flex gap-12 p-5 max-lg:flex-col">
      {product?._id ? (
        <>
          <ProductImages images={product?.images || []} />
          <ProductDescription product={product} />
        </>
      ) : fetchProductsLoad ? (
        "Loading ..."
      ) : (
        ""
      )}
    </section>
  );
};

const ProductImages = ({ images }: { images: string[] }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  useEffect(() => {
    setSelectedImage(images[0]);
  }, [images]);

  return (
    <div className="flex-1">
      <figure className="w-full h-90 max-w-80 rounded-lg m-auto border border-slate-300 flex items-center justify-center">
        <img src={selectedImage} alt="" className="h-4/5 max-w-full rounded-md" />
      </figure>

      <div className="flex items-center justify-center flex-wrap gap-3 pt-4 w-full">
        {images.map((image: string, imageIndex: number) => {
          return (
            <button
              key={imageIndex}
              className={`${selectedImage === image ? "opacity-60 border border-main rounded-md" : ""}`}
            >
              <img
                className="w-12 sm:w-20 hover:opacity-70 hover:border hover:border-main rounded-md transition-all bg-slate-200"
                src={image}
                alt=""
                onClick={() => setSelectedImage(image)}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ProductDescription = ({ product }: { product: Product }) => {
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
    <div className="flex-1">
      <h2 className="text-5xl mt-4 mb-8 max-sm:text-3xl font-bold">{product.title}</h2>

      <p>{product.desc}</p>

      <div className="flex flex-col items-start gap-4 mt-4 mb-5 max-sm:flex-row max-sm:justify-between max-sm:mb-7 max-sm:items-center">
        <div className="flex items-center gap-4">
          <span className="font-bold text-4xl">
            ${product.price - (product.discount / 100) * product.price}
          </span>
          <span className="text-main bg-lightGreen py-1 px-2 rounded">{product.discount}%</span>
        </div>
        <p className="line-through font-bold text-heavyGray">{product.price}</p>
      </div>

      <button
        type="button"
        disabled={addProductToCartLoad ? true : false}
        style={addProductToCartLoad ? { opacity: 0.5, cursor: "revert" } : {}}
        className="bg-main text-white text-sm rounded w-35 h-8 flex items-center justify-center gap-2"
        onClick={() => addToCart(product._id)}
      >
        <FontAwesomeIcon icon={faCartPlus} />
        <span>Add to cart</span>
        {addProductToCartLoad ? <PuffLoader color="#fff" size={15} /> : ""}
      </button>
    </div>
  );
};

export default ProductDetails;
