import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GetProductsResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { productsAPI } from "../../../api/productsAPI";
import { ProductCard } from "../../../components";
import { useHandleErrors, useQuery } from "../../../hooks";

const ProductsList = () => {
  const query = useQuery(); /* For default states */

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLength, setProductsLength] = useState<number>(0);
  const [fetchProductsLoad, setFetchProductsLoad] = useState<boolean>(false);

  const [limit, setLimit] = useState<number>(query.limit && +query.limit >= 1 ? +query.limit : 30);
  const [productsPage, setProductsPage] = useState<number>(
    query.page && +query.page >= 1 ? +query.page : 1,
  );

  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  const searchProducts = async () => {
    try {
      if (!query.searchKey) return;

      setFetchProductsLoad(true);

      const res = await productsAPI.searchProducts(query.searchKey, productsPage, limit, "new");

      const data: GetProductsResponse = res.data.data;

      setProducts(data.products);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchProductsLoad(false);
    }
  };

  /* Set query states when location URL changes */
  useEffect(() => {
    setLimit(query.limit && +query.limit >= 1 ? +query.limit : 30);
    setProductsPage(query.page && +query.page >= 1 ? +query.page : 1);
  }, [query.searchKey, query.page, query.limit]);

  useEffect(() => {
    setProductsLength(products.length);
  }, [products]);

  useEffect(() => {
    searchProducts();
  }, [query.searchKey, productsPage, limit]);

  useEffect(() => {
    navigate(`/products/search?searchKey=${query.searchKey}&page=${productsPage}&limit=${limit}`);
  }, [query.searchKey, productsPage, limit]);

  return (
    <section className="w-full">
      {!fetchProductsLoad ? (
        <>
          <ul className="grid gap-4 xsm:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {products.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </ul>

          {products.length > 0 ? (
            <Pagination
              productsLength={productsLength}
              limit={limit}
              setLimit={setLimit}
              productsPage={productsPage}
              setProductsPage={setProductsPage}
            />
          ) : (
            <div className="flex items-center justify-center px-4 py-12 text-2xl">
              No Products Found
            </div>
          )}
        </>
      ) : (
        "loading ..."
      )}
    </section>
  );
};

const Pagination = ({ productsLength, limit, setLimit, productsPage, setProductsPage }) => {
  const handleNext = () => {
    setProductsPage(productsPage + 1);
  };

  const handlePrev = () => {
    if (productsPage > 1) {
      setProductsPage(productsPage - 1);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(event.target.value));
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center space-x-2">
        <button
          className="px-4 py-1 bg-main text-white rounded disabled:opacity-50"
          onClick={handlePrev}
          disabled={productsPage === 1 ? true : false}
        >
          Previous
        </button>
        <button
          className="px-4 py-1 bg-main text-white rounded disabled:opacity-50"
          onClick={handleNext}
          disabled={productsLength < limit ? true : false}
        >
          Next
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="limit" className="text-sm">
          Products per page:
        </label>
        <select
          id="limit"
          className="p-1 border rounded border-slate-300 bg-gray-50 focus:border-slate-500"
          value={limit}
          onChange={handleLimitChange}
        >
          <option className="text-black" value={5}>
            5
          </option>
          <option className="text-black" value={10}>
            10
          </option>
          <option className="text-black" value={20}>
            20
          </option>
          <option className="text-black" value={30}>
            30
          </option>
        </select>
      </div>
    </div>
  );
};

export default ProductsList;
