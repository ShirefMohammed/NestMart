import { useEffect, useState } from "react";

import { GetProductsResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { productsAPI } from "../../../api/productsAPI";
import { ProductCard } from "../../../components";
import { useHandleErrors } from "../../../hooks";

const RelatedProductsList = ({ product }: { product: Product | undefined }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchProductsLoad, setFetchProductsLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();

  const searchProducts = async () => {
    try {
      if (!product?.title) return;

      setFetchProductsLoad(true);

      const res = await productsAPI.searchProducts(product.title, 1, 10, "new");

      const data: GetProductsResponse = res.data.data;

      setProducts(data.products.filter((item) => item._id !== product._id));
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchProductsLoad(false);
    }
  };

  useEffect(() => {
    searchProducts();
  }, [product]);

  return (
    <>
      {fetchProductsLoad ? (
        "loading ..."
      ) : products.length > 0 ? (
        <section className="w-full">
          <h2 className="pb-3 mb-4 border-b border-slate-200 font-bold text-lg">
            Related Products
          </h2>

          <ul className="grid gap-4 xsm:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {products.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </ul>
        </section>
      ) : (
        ""
      )}
    </>
  );
};

export default RelatedProductsList;
