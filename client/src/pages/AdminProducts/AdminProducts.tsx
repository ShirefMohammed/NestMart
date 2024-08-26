import { faEye, faPen, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";

import { GetProductsResponse, SearchProductsResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { productsAPI } from "../../api/productsAPI";
import { AdminBreadcrumb, GlassWrapper } from "../../components";
import { useHandleErrors, useNotify, useQuery } from "../../hooks";
import CreateProduct from "./components/CreateProduct";
import UpdateProduct from "./components/UpdateProduct";

const AdminProducts = () => {
  const query = useQuery(); /* For default states */

  const [products, setProducts] = useState<Product[]>([]); /* fetched or searched */
  const [productsLength, setProductsLength] = useState<number>(0);

  /* Start query states */
  const [limit, setLimit] = useState<number>(query.limit && +query.limit >= 1 ? +query.limit : 5);

  const [productsPage, setProductsPage] = useState<number>(
    !query.searchKey && query.page && +query.page >= 1 ? +query.page : 1,
  );

  const [searchProductsPage, setSearchProductsPage] = useState<number>(
    query.searchKey && query.page && +query.page >= 1 ? +query.page : 1,
  );

  const [searchKey, setSearchKey] = useState<string>(query.searchKey ? query.searchKey : "");
  /* End query states */

  const [fetchProductsLoad, setFetchProductsLoad] = useState<boolean>(false);
  const [searchProductsLoad, setSearchProductsLoad] = useState<boolean>(false);

  const [openCreateProduct, setOpenCreateProduct] = useState<boolean>(false);

  const [openUpdateProduct, setOpenUpdateProduct] = useState<boolean>(false);
  const [updateProductId, setUpdateProductId] = useState<number | null>(null);

  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  /* Start functions */
  const fetchProducts = async () => {
    try {
      setFetchProductsLoad(true);

      const res = await productsAPI.getProducts(productsPage, limit, "new");

      const data: GetProductsResponse = res.data.data;

      setProducts(data.products);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchProductsLoad(false);
    }
  };

  const searchProducts = async () => {
    try {
      setSearchProductsLoad(true);

      const res = await productsAPI.searchProducts(searchKey, searchProductsPage, limit, "new");

      const data: SearchProductsResponse = res.data.data;

      setProducts(data.products);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSearchProductsLoad(false);
    }
  };
  /* End functions */

  /* Set query states when location URL changes */
  useEffect(() => {
    setLimit(query.limit && +query.limit >= 1 ? +query.limit : 5);

    setProductsPage(!query.searchKey && query.page && +query.page >= 1 ? +query.page : 1);

    setSearchProductsPage(query.searchKey && query.page && +query.page >= 1 ? +query.page : 1);

    setSearchKey(query.searchKey ? query.searchKey : "");
  }, []);

  useEffect(() => {
    setProductsLength(products.length);
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [productsPage]);

  useEffect(() => {
    if (searchKey) searchProducts();
  }, [searchProductsPage]);

  useEffect(() => {
    searchKey ? searchProducts() : fetchProducts();
  }, [limit]);

  useEffect(() => {
    if (!searchKey) fetchProducts();
  }, [searchKey]);

  useEffect(() => {
    searchKey
      ? navigate(`/admin/products?page=${searchProductsPage}&searchKey=${searchKey}&limit=${limit}`)
      : navigate(`/admin/products?page=${productsPage}&limit=${limit}`);
  }, [productsPage, searchProductsPage, searchKey, limit]);

  return (
    <>
      {/* AdminBreadcrumb */}
      <AdminBreadcrumb pageName="Products" />

      {/* Search Form && Create Product Btn */}
      <header className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
        <label htmlFor="table-search-products" className="sr-only">
          Search
        </label>

        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            searchKey ? searchProducts() : fetchProducts();
          }}
        >
          <input
            type="text"
            id="table-search-products"
            className="block p-2 pe-10 text-sm text-gray-900 border border-slate-300 
              dark:border-slate-700 rounded-lg w-80 bg-gray-50 dark:bg-transparent
              focus:border-slate-500 dark:focus:border-slate-500 dark:placeholder-gray-400 
              dark:text-white outline-none"
            placeholder="Search for products"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <button
            type="submit"
            title="search"
            className="absolute inset-y-0 ltr:inset-r-0 flex items-center justify-center text-white bg-blue-500 rounded-md w-8 h-8 top-[3px] end-1"
          >
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </button>
        </form>

        <button
          type="button"
          className="inset-y-0 ltr:inset-r-0 px-4 py-1 flex items-center justify-center text-white bg-blue-500 rounded-md"
          onClick={() => setOpenCreateProduct(true)}
        >
          New
          <svg
            className="w-4 h-4 ml-1 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 5v10m5-5H5"
            />
          </svg>
        </button>
      </header>

      {/* Products Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right shadow-lg border border-slate-300 dark:border-slate-700">
          <thead>
            <tr className="text-sm font-bold text-body bg-whiten dark:bg-boxdark-2 dark:text-bodydark">
              <th scope="col" className="px-6 py-3">
                First Image
              </th>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Discount
              </th>
              <th scope="col" className="px-6 py-3">
                Final Price
              </th>
              <th scope="col" className="px-6 py-3">
                Available
              </th>
              <th scope="col" className="px-6 py-3">
                Category Id
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {fetchProductsLoad || searchProductsLoad ? (
              <tr>
                <td className="w-full p-4">loading ...</td>
              </tr>
            ) : products.length > 0 ? (
              <>
                {products.map((product: Product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    searchKey={searchKey}
                    fetchProducts={fetchProducts}
                    searchProducts={searchProducts}
                    setUpdateProductId={setUpdateProductId}
                    setOpenUpdateProduct={setOpenUpdateProduct}
                  />
                ))}
              </>
            ) : (
              <tr>
                <td className="w-full p-4">No results</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      <Pagination
        productsLength={productsLength}
        limit={limit}
        setLimit={setLimit}
        searchKey={searchKey}
        productsPage={productsPage}
        setProductsPage={setProductsPage}
        searchProductsPage={searchProductsPage}
        setSearchProductsPage={setSearchProductsPage}
      />

      {/* Create Product */}
      {openCreateProduct ? (
        <GlassWrapper setOpenGlassWrapper={setOpenCreateProduct}>
          <CreateProduct setProducts={setProducts} setOpenCreateProduct={setOpenCreateProduct} />
        </GlassWrapper>
      ) : (
        ""
      )}

      {/* Update Product */}
      {openUpdateProduct ? (
        <GlassWrapper setOpenGlassWrapper={setOpenUpdateProduct}>
          <UpdateProduct
            updateProductId={Number(updateProductId)}
            setProducts={setProducts}
            setOpenUpdateProduct={setOpenUpdateProduct}
          />
        </GlassWrapper>
      ) : (
        ""
      )}
    </>
  );
};

const ProductRow = ({
  product,
  searchKey,
  fetchProducts,
  searchProducts,
  setUpdateProductId,
  setOpenUpdateProduct,
}) => {
  const productData: Product = product;
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const notify = useNotify();

  const deleteProduct = async (productId: number) => {
    try {
      setDeleteLoading(true);

      const confirmResult = confirm("Are you sure?");

      if (!confirmResult) return;

      await productsAPI.deleteProduct(productId);

      searchKey ? searchProducts() : fetchProducts();

      notify("success", "Product is deleted");
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Delete product fail!");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <tr className="border-b border-slate-300 dark:border-slate-700 text-sm text-body bg-white dark:bg-boxdark dark:text-bodydark font-normal">
      <th
        scope="row"
        className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white whitespace-nowrap"
      >
        <img className="w-10 h-10 rounded-md" src={productData.images[0]} alt="" />
      </th>

      <td className="px-6 py-4 whitespace-nowrap">{productData.title}</td>

      <td className="px-6 py-4 whitespace-nowrap">
        {new Date(productData.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">${productData.price}</td>

      <td className="px-6 py-4 whitespace-nowrap">%{productData.discount}</td>

      <td className="px-6 py-4 whitespace-nowrap">
        ${productData.price - (productData.discount / 100) * productData.price}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">{productData.available}</td>

      <td className="px-6 py-4 whitespace-nowrap">{productData.categoryId}</td>

      <td className="px-6 py-4 w-32 whitespace-nowrap">
        <Link
          to={`/products/${productData._id}`}
          title="view product details"
          className="text-blue-600 dark:text-blue-500 mr-4"
        >
          <FontAwesomeIcon icon={faEye} />
        </Link>

        <button
          type="button"
          title="update this product"
          className="text-blue-600 dark:text-blue-500 mr-4"
          onClick={() => {
            setUpdateProductId(productData._id);
            setOpenUpdateProduct(true);
          }}
        >
          <FontAwesomeIcon icon={faPen} />
        </button>

        <button
          type="button"
          title="delete this product"
          className="text-red-500"
          onClick={() => deleteProduct(productData._id)}
          disabled={deleteLoading ? true : false}
          style={deleteLoading ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          {deleteLoading ? (
            <PuffLoader color="#000" size={20} />
          ) : (
            <FontAwesomeIcon icon={faTrashCan} />
          )}
        </button>
      </td>
    </tr>
  );
};

const Pagination = ({
  productsLength,
  limit,
  setLimit,
  searchKey,
  productsPage,
  setProductsPage,
  searchProductsPage,
  setSearchProductsPage,
}) => {
  const handleNext = () => {
    if (searchKey) {
      setSearchProductsPage(searchProductsPage + 1);
    } else {
      setProductsPage(productsPage + 1);
    }
  };

  const handlePrev = () => {
    if (searchKey && searchProductsPage > 1) {
      setSearchProductsPage(searchProductsPage - 1);
    } else if (!searchKey && productsPage > 1) {
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
          className="px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          onClick={handlePrev}
          disabled={
            searchKey && searchProductsPage === 1
              ? true
              : !searchKey && productsPage === 1
                ? true
                : false
          }
        >
          Previous
        </button>
        <button
          className="px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
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
          className="p-1 border rounded border-slate-300 dark:border-slate-700
              bg-gray-50 dark:bg-transparent focus:border-slate-500 dark:focus:border-slate-500 
              dark:placeholder-gray-400 dark:text-white outline-none"
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
        </select>
      </div>
    </div>
  );
};

export default AdminProducts;
