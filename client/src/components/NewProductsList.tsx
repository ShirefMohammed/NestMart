import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { GetProductsResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { productsAPI } from "../api/productsAPI";
import { useHandleErrors } from "../hooks";

const NewProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchProductsLoad, setFetchProductsLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();

  const fetchProducts = async () => {
    try {
      setFetchProductsLoad(true);

      const res = await productsAPI.getProducts(1, 3, "new");

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
    <div className="w-full p-5 rounded-md shadow-md border border-slate-200">
      <h3 className="pb-3 mb-4 border-b border-slate-200 font-bold text-lg">New Products</h3>

      {!fetchProductsLoad ? (
        <ul className="flex flex-col gap-3">
          {products.map((product: Product) => (
            <li key={product._id}>
              <Link
                to={`/products/${product._id}`}
                className="p-2 rounded-md border border-slate-200 flex items-center gap-3 hover:underline"
              >
                <img src={product.images[0]} alt="" loading="lazy" className="w-14 h-14 object-cover rounded-sm" />
                <div>
                  <span className="text-sm text-main font-bold">{product.title}</span>
                  <span className="text-sm text-heavyGray font-bold block">
                    ${product.price - (product.discount / 100) * product.price}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        "loading ..."
      )}
    </div>
  );
};

export default NewProductsList;
