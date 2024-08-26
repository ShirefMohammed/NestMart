import { useEffect, useState } from "react";

import { GetProductsResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { productsAPI } from "../../../api/productsAPI";
import { ProductCard } from "../../../components";
import { useHandleErrors } from "../../../hooks";

const LatestProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchProductsLoad, setFetchProductsLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();

  const fetchProducts = async () => {
    try {
      setFetchProductsLoad(true);

      const res = await productsAPI.getProducts(1, 20, "new");

      const data: GetProductsResponse = res.data.data;

      setProducts(data.products);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchProductsLoad(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="w-full">
      <h2 className="pb-3 mb-4 border-b border-slate-200 font-bold text-lg">Latest Products</h2>

      {!fetchProductsLoad ? (
        <ul className="grid gap-4 xsm:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {products.map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </ul>
      ) : (
        "loading ..."
      )}
    </div>
  );
};

export default LatestProducts;
