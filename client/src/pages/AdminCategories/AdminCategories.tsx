import { faEye, faPen, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";

import { GetCategoriesResponse, SearchCategoriesResponse } from "@shared/types/apiTypes";
import { Category } from "@shared/types/entitiesTypes";

import { categoriesAPI } from "../../api/categoriesAPI";
import { AdminBreadcrumb, GlassWrapper } from "../../components";
import { useHandleErrors, useNotify, useQuery } from "../../hooks";
import CreateCategory from "./components/CreateCategory";
import UpdateCategory from "./components/UpdateCategory";

const AdminCategories = () => {
  const query = useQuery(); /* For default states */

  const [categories, setCategories] = useState<Category[]>([]); /* fetched or searched */
  const [categoriesLength, setCategoriesLength] = useState<number>(0);

  /* Start query states */
  const [limit, setLimit] = useState<number>(query.limit && +query.limit >= 1 ? +query.limit : 5);

  const [categoriesPage, setCategoriesPage] = useState<number>(
    !query.searchKey && query.page && +query.page >= 1 ? +query.page : 1,
  );

  const [searchCategoriesPage, setSearchCategoriesPage] = useState<number>(
    query.searchKey && query.page && +query.page >= 1 ? +query.page : 1,
  );

  const [searchKey, setSearchKey] = useState<string>(query.searchKey ? query.searchKey : "");
  /* End query states */

  const [fetchCategoriesLoad, setFetchCategoriesLoad] = useState<boolean>(false);
  const [searchCategoriesLoad, setSearchCategoriesLoad] = useState<boolean>(false);

  const [openCreateCategory, setOpenCreateCategory] = useState<boolean>(false);

  const [openUpdateCategory, setOpenUpdateCategory] = useState<boolean>(false);
  const [updateCategoryId, setUpdateCategoryId] = useState<number | null>(null);

  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  /* Start functions */
  const fetchCategories = async () => {
    try {
      setFetchCategoriesLoad(true);

      const res = await categoriesAPI.getCategories(categoriesPage, limit, "new");

      const data: GetCategoriesResponse = res.data.data;

      setCategories(data.categories);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchCategoriesLoad(false);
    }
  };

  const searchCategories = async () => {
    try {
      setSearchCategoriesLoad(true);

      const res = await categoriesAPI.searchCategories(
        searchKey,
        searchCategoriesPage,
        limit,
        "new",
      );

      const data: SearchCategoriesResponse = res.data.data;

      setCategories(data.categories);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSearchCategoriesLoad(false);
    }
  };
  /* End functions */

  /* Set query states when location URL changes */
  useEffect(() => {
    setLimit(query.limit && +query.limit >= 1 ? +query.limit : 5);

    setCategoriesPage(!query.searchKey && query.page && +query.page >= 1 ? +query.page : 1);

    setSearchCategoriesPage(query.searchKey && query.page && +query.page >= 1 ? +query.page : 1);

    setSearchKey(query.searchKey ? query.searchKey : "");
  }, []);

  useEffect(() => {
    setCategoriesLength(categories.length);
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [categoriesPage]);

  useEffect(() => {
    if (searchKey) searchCategories();
  }, [searchCategoriesPage]);

  useEffect(() => {
    searchKey ? searchCategories() : fetchCategories();
  }, [limit]);

  useEffect(() => {
    if (!searchKey) fetchCategories();
  }, [searchKey]);

  useEffect(() => {
    searchKey
      ? navigate(
          `/admin/categories?page=${searchCategoriesPage}&searchKey=${searchKey}&limit=${limit}`,
        )
      : navigate(`/admin/categories?page=${categoriesPage}&limit=${limit}`);
  }, [categoriesPage, searchCategoriesPage, searchKey, limit]);

  return (
    <>
      {/* AdminBreadcrumb */}
      <AdminBreadcrumb pageName="Categories" />

      {/* Search Form && Create Category Btn */}
      <header className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
        <label htmlFor="table-search-categories" className="sr-only">
          Search
        </label>

        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            searchKey ? searchCategories() : fetchCategories();
          }}
        >
          <input
            type="text"
            id="table-search-categories"
            className="block p-2 pe-10 text-sm text-gray-900 border border-slate-300 
              dark:border-slate-700 rounded-lg w-80 bg-gray-50 dark:bg-transparent
              focus:border-slate-500 dark:focus:border-slate-500 dark:placeholder-gray-400 
              dark:text-white outline-none"
            placeholder="Search for categories"
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
          onClick={() => setOpenCreateCategory(true)}
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

      {/* Categories Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right shadow-lg border border-slate-300 dark:border-slate-700">
          <thead>
            <tr className="text-sm font-bold text-body bg-whiten dark:bg-boxdark-2 dark:text-bodydark">
              <th scope="col" className="px-6 py-3">
                Image
              </th>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {fetchCategoriesLoad || searchCategoriesLoad ? (
              <tr>
                <td className="w-full p-4">loading ...</td>
              </tr>
            ) : categories.length > 0 ? (
              <>
                {categories.map((category: Category) => (
                  <CategoryRow
                    key={category._id}
                    category={category}
                    searchKey={searchKey}
                    fetchCategories={fetchCategories}
                    searchCategories={searchCategories}
                    setUpdateCategoryId={setUpdateCategoryId}
                    setOpenUpdateCategory={setOpenUpdateCategory}
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
        categoriesLength={categoriesLength}
        limit={limit}
        setLimit={setLimit}
        searchKey={searchKey}
        categoriesPage={categoriesPage}
        setCategoriesPage={setCategoriesPage}
        searchCategoriesPage={searchCategoriesPage}
        setSearchCategoriesPage={setSearchCategoriesPage}
      />

      {/* Create Category */}
      {openCreateCategory ? (
        <GlassWrapper setOpenGlassWrapper={setOpenCreateCategory}>
          <CreateCategory
            setCategories={setCategories}
            setOpenCreateCategory={setOpenCreateCategory}
          />
        </GlassWrapper>
      ) : (
        ""
      )}

      {/* Update Category */}
      {openUpdateCategory ? (
        <GlassWrapper setOpenGlassWrapper={setOpenUpdateCategory}>
          <UpdateCategory
            updateCategoryId={Number(updateCategoryId)}
            setCategories={setCategories}
            setOpenUpdateCategory={setOpenUpdateCategory}
          />
        </GlassWrapper>
      ) : (
        ""
      )}
    </>
  );
};

const CategoryRow = ({
  category,
  searchKey,
  fetchCategories,
  searchCategories,
  setUpdateCategoryId,
  setOpenUpdateCategory,
}) => {
  const categoryData: Category = category;
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const notify = useNotify();

  const deleteCategory = async (categoryId: number) => {
    try {
      setDeleteLoading(true);

      const confirmResult = confirm("Are you sure?");

      if (!confirmResult) return;

      await categoriesAPI.deleteCategory(categoryId);

      searchKey ? searchCategories() : fetchCategories();

      notify("success", "Category is deleted");
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Delete category fail!");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <tr className="border-b border-slate-300 dark:border-slate-700 text-sm text-body bg-white dark:bg-boxdark dark:text-bodydark font-normal">
      <th
        scope="row"
        className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
      >
        <img className="w-10 h-10 rounded-md" src={categoryData.image} alt="" />
      </th>

      <td className="px-6 py-4">{categoryData.title}</td>

      <td className="px-6 py-4">
        {new Date(categoryData.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="px-6 py-4">
        <Link
          to={`/categories/${categoryData._id}/products`}
          title="view category details"
          className="text-blue-600 dark:text-blue-500 mr-4"
        >
          <FontAwesomeIcon icon={faEye} />
        </Link>

        <button
          type="button"
          title="update this category"
          className="text-blue-600 dark:text-blue-500 mr-4"
          onClick={() => {
            setUpdateCategoryId(categoryData._id);
            setOpenUpdateCategory(true);
          }}
        >
          <FontAwesomeIcon icon={faPen} />
        </button>

        <button
          type="button"
          title="delete this category"
          className="text-red-500"
          onClick={() => deleteCategory(categoryData._id)}
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
  categoriesLength,
  limit,
  setLimit,
  searchKey,
  categoriesPage,
  setCategoriesPage,
  searchCategoriesPage,
  setSearchCategoriesPage,
}) => {
  const handleNext = () => {
    if (searchKey) {
      setSearchCategoriesPage(searchCategoriesPage + 1);
    } else {
      setCategoriesPage(categoriesPage + 1);
    }
  };

  const handlePrev = () => {
    if (searchKey && searchCategoriesPage > 1) {
      setSearchCategoriesPage(searchCategoriesPage - 1);
    } else if (!searchKey && categoriesPage > 1) {
      setCategoriesPage(categoriesPage - 1);
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
            searchKey && searchCategoriesPage === 1
              ? true
              : !searchKey && categoriesPage === 1
                ? true
                : false
          }
        >
          Previous
        </button>
        <button
          className="px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          onClick={handleNext}
          disabled={categoriesLength < limit ? true : false}
        >
          Next
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="limit" className="text-sm">
          Categories per page:
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

export default AdminCategories;
