import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { GetCategoriesResponse } from "@shared/types/apiTypes";
import { Category } from "@shared/types/entitiesTypes";

import { categoriesAPI } from "../../../api/categoriesAPI";
import { useHandleErrors } from "../../../hooks";

const AllCategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchCategoriesLoad, setFetchCategoriesLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();

  const fetchCategories = async () => {
    try {
      setFetchCategoriesLoad(true);

      const res = await categoriesAPI.getCategories(1, 20, "new");

      const data: GetCategoriesResponse = res.data.data;

      setCategories(data.categories);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchCategoriesLoad(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="w-full">
      <h2 className="mb-4 font-bold text-xl">Shop by Categories</h2>

      {!fetchCategoriesLoad ? (
        <ul className="flex gap-4 flex-wrap justify-center md:justify-normal">
          {categories.map((category: Category) => (
            <li key={category._id}>
              <Link
                to={`/categories/${category._id}/products`}
                className="py-5 px-6 rounded-md bg-slate-100 flex flex-col items-center gap-3 hover:underline"
              >
                <img src={category.image} alt="" className="w-20 h-20 object-cover rounded-sm" />
                <span className="text-sm">{category.title}</span>
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

export default AllCategoriesList;
